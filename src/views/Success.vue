<template>
    <div class="container is-max-desktop py-6">
        <div class="box has-text-centered p-6">
            <span class="icon is-large has-text-success mb-4">
                <i class="fas fa-check-circle fa-4x"></i>
            </span>
            <h1 class="title is-2 has-text-success">Payment Successful!</h1>
            <p class="subtitle is-5">Thank you for your subscription.</p>

            <hr />

            <div class="content has-text-left is-medium">
                <h3 class="title is-4 mb-4">Order Summary</h3>
                <div class="columns is-multiline is-mobile">
                    <div class="column is-6 has-text-weight-bold">Pack:</div>
                    <div class="column is-6">{{ orderDetails.pack }}</div>

                    <div class="column is-6 has-text-weight-bold">Recipient:</div>
                    <div class="column is-6">{{ orderDetails.recipientName }}</div>

                    <div class="column is-6 has-text-weight-bold">Phone:</div>
                    <div class="column is-6">{{ orderDetails.phoneNumber }}</div>

                    <div class="column is-6 has-text-weight-bold">Schedule:</div>
                    <div class="column is-6">{{ orderDetails.deliverySchedule }}</div>

                    <div class="column is-6 has-text-weight-bold">Amount Paid:</div>
                    <div class="column is-6">{{ orderDetails.amount }} THB</div>
                </div>

                <div class="notification is-light mt-4">
                    <strong>Delivery Address:</strong> <br />
                    {{ orderDetails.deliveryAddress }}
                </div>
            </div>

            <div class="buttons is-centered mt-6">
                <!-- Link to Public Tracking Page with Order ID -->
                <router-link 
                    :to="{ path: '/tracking', query: { orderId: orderDetails.orderId } }" 
                    class="button is-primary is-medium is-fullwidth"
                >
                    Track My Order
                </router-link>

                <router-link to="/" class="button is-text mt-2"> Back to Home </router-link>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            orderDetails: {
                orderId: '', // Added orderId
                pack: '',
                recipientName: '',
                phoneNumber: '',
                deliverySchedule: '',
                deliveryAddress: '',
                amount: '',
            },
        }
    },
    mounted() {
        // รับข้อมูลที่ส่งมาจากหน้า Subscription
        // ใช้ history state API ของ Vue Router เพื่อความปลอดภัยและ URL สวยงาม (ไม่โชว์ยาวๆ ใน URL)
        const state = history.state

        if (state && state.orderDetails) {
            this.orderDetails = state.orderDetails
        } else {
            // Fallback กรณีเข้าหน้านี้ตรงๆ (อาจจะ redirect กลับไปหน้าแรก หรือโชว์ข้อมูล mock)
            this.orderDetails = {
                orderId: '',
                pack: 'Unknown Pack',
                recipientName: '-',
                phoneNumber: '-',
                deliverySchedule: '-',
                deliveryAddress: '-',
                amount: '-',
            }
        }
    },
}
</script>

<style scoped>
.box {
    border-radius: 12px;
    box-shadow:
        0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1),
        0 0px 0 1px rgba(10, 10, 10, 0.02);
}
</style>
