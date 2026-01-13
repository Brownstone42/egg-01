<template>
    <div class="box">
        <h2 class="title is-4 mb-4">My Subscription Tracking</h2>

        <div v-if="loading" class="has-text-centered py-5">
            <span class="icon is-large">
                <i class="fas fa-spinner fa-pulse fa-2x"></i>
            </span>
            <p class="mt-2">Loading subscription details...</p>
        </div>

        <div v-else-if="errorMessage" class="notification is-danger is-light">
            {{ errorMessage }}
        </div>

        <div v-else>
            <div v-if="subscriptions.length === 0" class="notification is-info is-light">
                You don't have any active subscriptions yet.
            </div>

            <div v-else class="table-container">
                <table class="table is-fullwidth is-striped is-hoverable">
                    <thead>
                        <tr>
                            <th>Pack</th>
                            <th>Recipient</th>
                            <th>Schedule</th>
                            <th>Next Delivery</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="sub in subscriptions" :key="sub.id">
                            <td>{{ sub.pack }}</td>
                            <td>{{ sub.recipientName }}</td>
                            <td>{{ sub.deliverySchedule }}</td>
                            <td>
                                <span v-if="getNextDelivery(sub.deliveryDates)">
                                    {{ formatDate(getNextDelivery(sub.deliveryDates)) }}
                                </span>
                                <span v-else class="tag is-light">Complete</span>
                            </td>
                            <td>
                                <span class="tag" :class="getStatusClass(sub)">
                                    {{ sub.status === 'paid' ? 'Active' : sub.status }}
                                </span>
                            </td>
                            <td>
                                <button
                                    class="button is-small is-info is-outlined"
                                    @click="openDetailModal(sub)"
                                >
                                    <span class="icon is-small">
                                        <i class="fas fa-search"></i>
                                    </span>
                                    <span>View</span>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Subscription Detail Modal -->
        <div class="modal" :class="{ 'is-active': showDetailModal }">
            <div class="modal-background" @click="closeDetailModal"></div>
            <div class="modal-content">
                <div class="box" v-if="selectedSub">
                    <h3 class="title is-4 mb-2">Subscription Details</h3>
                    <p class="subtitle is-6 has-text-grey">Order ID: {{ selectedSub.id }}</p>

                    <div class="columns">
                        <div class="column is-6">
                            <p><strong>Pack:</strong> {{ selectedSub.pack }}</p>
                            <p><strong>Recipient:</strong> {{ selectedSub.recipientName }}</p>
                            <p><strong>Phone:</strong> {{ selectedSub.phoneNumber }}</p>
                        </div>
                        <div class="column is-6">
                            <p>
                                <strong>Status:</strong>
                                <span class="tag is-success is-light">{{
                                    selectedSub.status
                                }}</span>
                            </p>
                            <p><strong>Schedule:</strong> {{ selectedSub.deliverySchedule }}</p>
                            <p><strong>Note:</strong> {{ selectedSub.noteToDriver || '-' }}</p>
                        </div>
                    </div>

                    <div class="mb-4">
                        <p><strong>Address:</strong> {{ selectedSub.deliveryAddress }}</p>
                    </div>

                    <h4 class="title is-5 mt-5 mb-3">Delivery Timeline</h4>
                    <div class="timeline">
                        <div
                            class="timeline-item"
                            v-for="(date, index) in selectedSub.deliveryDates"
                            :key="index"
                        >
                            <div class="timeline-marker" :class="getMarkerClass(date)"></div>
                            <div class="timeline-content">
                                <p class="heading">{{ formatDate(date) }}</p>
                                <p>{{ getDeliveryStatusText(date) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button
                class="modal-close is-large"
                aria-label="close"
                @click="closeDetailModal"
            ></button>
        </div>
    </div>
</template>

<script>
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore'

export default {
    props: {
        user: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            loading: false,
            subscriptions: [],
            errorMessage: '',
            showDetailModal: false,
            selectedSub: null,
        }
    },
    watch: {
        user: {
            immediate: true,
            handler(newUser) {
                if (newUser) {
                    this.fetchSubscriptions()
                }
            },
        },
    },
    methods: {
        async fetchSubscriptions() {
            if (!this.user) return

            this.loading = true
            this.errorMessage = ''
            this.subscriptions = []

            try {
                const db = getFirestore()
                const ordersRef = collection(db, 'orders')
                const q = query(
                    ordersRef,
                    where('userId', '==', this.user.uid),
                    orderBy('createdAt', 'desc'),
                )

                const querySnapshot = await getDocs(q)

                querySnapshot.forEach((doc) => {
                    const data = doc.data()
                    const deliveryDates = data.deliveryDates
                        ? data.deliveryDates.map((ts) => (ts.toDate ? ts.toDate() : new Date(ts)))
                        : []

                    this.subscriptions.push({
                        id: doc.id,
                        ...data,
                        deliveryDates: deliveryDates,
                    })
                })
            } catch (error) {
                console.error('Error fetching subscriptions:', error)
                if (error.message.includes('index')) {
                    this.errorMessage = 'System is indexing your data. Please try again later.'
                } else {
                    this.errorMessage = 'Failed to load subscriptions.'
                }
            } finally {
                this.loading = false
            }
        },
        formatDate(date) {
            if (!date) return '-'
            return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date)
        },
        getNextDelivery(dates) {
            if (!dates || dates.length === 0) return null
            const now = new Date()
            return dates.find((d) => d >= now) || null
        },
        getStatusClass(sub) {
            if (sub.status === 'paid') return 'is-success is-light'
            return 'is-warning is-light'
        },
        getMarkerClass(date) {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())

            if (d < today) return 'is-success'
            if (d.getTime() === today.getTime()) return 'is-warning'
            return ''
        },
        getDeliveryStatusText(date) {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())

            if (d < today) return 'Delivered'
            if (d.getTime() === today.getTime()) return 'Out for Delivery'
            return 'Scheduled'
        },
        openDetailModal(sub) {
            this.selectedSub = sub
            this.showDetailModal = true
        },
        closeDetailModal() {
            this.showDetailModal = false
            this.selectedSub = null
        },
    },
}
</script>

<style scoped>
/* Timeline CSS (Simple Vertical) */
.timeline {
    border-left: 2px solid #dbdbdb;
    margin-left: 20px;
    padding-left: 20px;
}
.timeline-item {
    position: relative;
    padding-bottom: 20px;
}
.timeline-marker {
    position: absolute;
    left: -26px; /* Adjust based on border/padding */
    top: 5px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #dbdbdb;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px #dbdbdb;
}
.timeline-marker.is-success {
    background: #48c774;
    box-shadow: 0 0 0 1px #48c774;
}
.timeline-marker.is-warning {
    background: #ffdd57;
    box-shadow: 0 0 0 1px #ffdd57;
}
</style>
