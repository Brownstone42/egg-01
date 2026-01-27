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
                <!-- Use the shared component here -->
                <OrderDetailDisplay v-if="selectedSub" :order="selectedSub" />
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
import OrderDetailDisplay from '@/components/OrderDetailDisplay.vue'

export default {
    components: {
        OrderDetailDisplay,
    },
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
                // Note: Compound queries with orderBy usually require an index in Firestore.
                // If this fails with "index required", remove orderBy or create the index via console link provided in error.
                const q = query(
                    ordersRef,
                    where('userId', '==', this.user.uid),
                    orderBy('createdAt', 'desc'),
                )

                const querySnapshot = await getDocs(q)

                querySnapshot.forEach((doc) => {
                    const data = doc.data()
                    
                    // Filter: Only show paid/successful orders
                    if (data.status === 'paid' || data.status === 'successful') {
                        const deliveryDates = data.deliveryDates
                            ? data.deliveryDates.map((ts) => (ts.toDate ? ts.toDate() : new Date(ts)))
                            : []

                        // Map nested data structure to flat structure for display
                        this.subscriptions.push({
                            id: doc.id,
                            status: data.status,
                            createdAt: data.createdAt,
                            // Mapped Fields
                            recipientName: data.customer?.name || data.recipientName || '-',
                            phoneNumber: data.customer?.phone || data.phoneNumber || '-',
                            deliveryAddress: data.customer?.address || data.deliveryAddress || '-',
                            pack: data.items 
                                 ? data.items.map(i => `${i.name} (${i.cycle})`).join(', ') 
                                 : (data.pack || '-'),
                            deliverySchedule: data.deliverySchedule || 'Every Monday',
                            deliveryDates: deliveryDates,
                            noteToDriver: data.noteToDriver || data.customer?.note || ''
                        })
                    }
                })
            } catch (error) {
                console.error('Error fetching subscriptions:', error)
                if (error.message.includes('index')) {
                    // Fallback if index missing: fetch without sort, then sort in memory (or show index error link in console)
                    console.warn("Firestore Index missing. Please create one.")
                    this.errorMessage = 'System is preparing your data structure. Please check console for index creation link.'
                } else {
                    this.errorMessage = 'Failed to load subscriptions.'
                }
            } finally {
                this.loading = false
            }
        },
        // Keep simple format for the table row
        formatDate(date) {
            if (!date) return '-'
            return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date)
        },
        getNextDelivery(dates) {
            if (!dates || dates.length === 0) return null
            const now = new Date()
            // Reset time to start of day for accurate comparison
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            // Find first date that is today or in future
            return dates.find((d) => {
                 const checkDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                 return checkDate >= today;
            }) || null
        },
        getStatusClass(sub) {
            if (sub.status === 'paid' || sub.status === 'successful') return 'is-success is-light'
            return 'is-warning is-light'
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
/* Removed duplicated timeline styles */
</style>
