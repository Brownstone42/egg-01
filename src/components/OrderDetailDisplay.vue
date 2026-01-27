<template>
    <div class="box">
        <!-- Header with Share Button -->
        <div class="is-flex is-justify-content-between is-align-items-start mb-4">
            <div>
                <h3 class="title is-4 mb-2">Order Details</h3>
                <p class="subtitle is-6 has-text-grey">Order ID: {{ order.id }}</p>
            </div>
            <button
                class="button is-small is-info is-light"
                @click="copyShareLink"
                :class="{ 'is-success': copied }"
            >
                <span class="icon">
                    <i class="fas" :class="copied ? 'fa-check' : 'fa-share-alt'"></i>
                </span>
                <span>{{ copied ? 'Copied Link!' : 'Share Tracking' }}</span>
            </button>
        </div>

        <div class="columns">
            <div class="column is-6">
                <p><strong>Pack:</strong> {{ order.pack }}</p>
                <p><strong>Recipient:</strong> {{ order.recipientName }}</p>
                <p><strong>Phone:</strong> {{ order.phoneNumber }}</p>
            </div>
            <div class="column is-6">
                <p>
                    <strong>Status:</strong>
                    <span class="tag is-success is-light ml-2">{{ order.status }}</span>
                </p>
                <p><strong>Schedule:</strong> {{ order.deliverySchedule }}</p>
                <p><strong>Note:</strong> {{ order.noteToDriver || '-' }}</p>
            </div>
        </div>

        <div class="mb-4">
            <p><strong>Address:</strong> {{ order.deliveryAddress }}</p>
        </div>

        <h4 class="title is-5 mt-5 mb-3">Delivery Timeline</h4>
        <div class="timeline" v-if="order.deliveryDates && order.deliveryDates.length > 0">
            <div class="timeline-item" v-for="(date, index) in order.deliveryDates" :key="index">
                <div class="timeline-marker" :class="getMarkerClass(date)"></div>
                <div class="timeline-content">
                    <p class="heading">{{ formatDate(date) }}</p>
                    <p>{{ getDeliveryStatusText(date) }}</p>
                </div>
            </div>
        </div>
        <div v-else class="notification is-light">No delivery schedule information available.</div>
    </div>
</template>

<script>
export default {
    name: 'OrderDetailDisplay',
    props: {
        order: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            copied: false,
        }
    },
    methods: {
        async copyShareLink() {
            // Construct the full URL using the current origin (works for both localhost and prod)
            const shareUrl = `${window.location.origin}/tracking?orderId=${this.order.id}`

            try {
                await navigator.clipboard.writeText(shareUrl)

                // Show feedback
                this.copied = true
                setTimeout(() => {
                    this.copied = false
                }, 2000) // Reset after 2 seconds
            } catch (err) {
                console.error('Failed to copy link:', err)
                alert('Could not copy link to clipboard.')
            }
        },
        formatDate(date) {
            if (!date) return '-'
            // Handle Firestore Timestamp or Date object
            const d = date.toDate ? date.toDate() : new Date(date)
            return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(d)
        },
        getMarkerClass(date) {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const d = date.toDate ? date.toDate() : new Date(date)
            const checkDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())

            if (checkDate < today) return 'is-success'
            if (checkDate.getTime() === today.getTime()) return 'is-warning'
            return ''
        },
        getDeliveryStatusText(date) {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const d = date.toDate ? date.toDate() : new Date(date)
            const checkDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())

            if (checkDate < today) return 'Delivered'
            if (checkDate.getTime() === today.getTime()) return 'Out for Delivery'
            return 'Scheduled'
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
