<template>
    <div class="container">
        <h1 class="title">Subscription Details</h1>
        <div class="box">
            <div class="field">
                <label class="label">Selected Pack</label>
                <div class="control">
                    <input class="input" type="text" :value="selectedPack" readonly />
                </div>
            </div>

            <div class="field">
                <label class="label">Recipient Name</label>
                <div class="control">
                    <input
                        class="input"
                        :class="{ 'is-danger': errors.recipientName }"
                        v-model="formData.recipientName"
                        type="text"
                        placeholder="e.g. John Doe"
                    />
                </div>
            </div>

            <!-- Phone Number Section -->
            <div class="field">
                <label class="label">Phone Number</label>
                <div class="control">
                    <input
                        class="input"
                        :class="{ 'is-danger': errors.phoneNumber }"
                        v-model="formData.phoneNumber"
                        type="tel"
                        placeholder="+66812345678"
                    />
                </div>
                <p class="help is-danger" v-if="errors.phoneNumber">Phone number is required.</p>
            </div>

            <div class="field">
                <label class="label">Delivery Schedule</label>
                <div class="control">
                    <div class="select" :class="{ 'is-danger': errors.deliverySchedule }">
                        <select v-model="formData.deliverySchedule">
                            <option disabled value="">Please select one</option>
                            <option>Wednesday Morning (07:00-10:00)</option>
                            <option>Wednesday Evening (17:00-20:00)</option>
                            <option>Sunday Morning (07:00-10:00)</option>
                            <option>Sunday Evening (17:00-20:00)</option>
                        </select>
                    </div>
                </div>
            </div>

            <google-map
                v-model="formData.deliveryAddress"
                :error="errors.deliveryAddress"
            ></google-map>

            <div class="field">
                <label class="label">Note to Driver (Optional)</label>
                <div class="control">
                    <textarea
                        class="textarea"
                        v-model="formData.noteToDriver"
                        placeholder="e.g. Please leave the package at the front door. My house number is 123."
                    ></textarea>
                </div>
            </div>

            <div class="field">
                <label class="label">Payment Option</label>
                <div class="control">
                    <label class="radio">
                        <input type="radio" v-model="formData.paymentOption" value="qrcode" />
                        QR Code
                    </label>
                    <label class="radio ml-2">
                        <input type="radio" v-model="formData.paymentOption" value="creditcard" />
                        Credit Card
                    </label>
                </div>
            </div>

            <div v-if="errorMessage" class="notification is-danger">
                {{ errorMessage }}
            </div>

            <div class="field">
                <div class="control">
                    <button
                        class="button is-primary"
                        :class="{ 'is-loading': isLoading }"
                        @click="validateAndPay"
                    >
                        Proceed to Payment
                    </button>
                </div>
            </div>
        </div>

        <!-- Payment Modal / Section -->
        <div v-if="showPaymentSection" class="modal is-active">
            <div class="modal-background" @click="closePaymentModal"></div>
            <div class="modal-content">
                <div class="box has-text-centered">
                    <!-- Case 1: Pending (Show QR) -->
                    <div v-if="paymentStatus === 'pending'">
                        <h3 class="title is-4">Scan to Pay</h3>
                        <div v-if="qrCodeUrl">
                            <figure class="image is-inline-block" style="width: 250px">
                                <img :src="qrCodeUrl" alt="PromptPay QR Code" />
                            </figure>
                            <p class="mt-4 has-text-weight-bold">Amount: {{ amountToPay }} THB</p>
                            <div
                                class="is-flex is-justify-content-center is-align-items-center mt-2"
                            >
                                <span class="loader mr-2"></span>
                                <span class="help has-text-info">Waiting for payment...</span>
                            </div>
                            <p class="help is-danger mt-2">QR Code expires in a few minutes.</p>
                        </div>
                        <div v-else>
                            <p>Generating QR Code...</p>
                        </div>
                    </div>

                    <!-- Case 2: Failed/Expired -->
                    <div v-else-if="paymentStatus === 'failed'">
                        <span class="icon is-large has-text-danger mb-3">
                            <i class="fas fa-times-circle fa-3x"></i>
                        </span>
                        <h3 class="title is-4 has-text-danger">Payment Failed</h3>
                        <p class="mb-4">
                            The payment was not successful or the QR code has expired.
                        </p>
                        <button class="button is-primary is-outlined" @click="retryPayment">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
            <button
                class="modal-close is-large"
                aria-label="close"
                @click="closePaymentModal"
            ></button>
        </div>
    </div>
</template>

<script>
import GoogleMap from '@/components/GoogleMap.vue'
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { getAuth } from 'firebase/auth'

export default {
    components: {
        GoogleMap,
    },
    data() {
        return {
            selectedPack: '',
            omisePublicKey: 'pkey_test_63bghetmlex6v6n314d',
            amountToPay: 1000,

            formData: {
                recipientName: '',
                phoneNumber: '',
                deliverySchedule: '',
                deliveryAddress: '',
                noteToDriver: '',
                paymentOption: 'qrcode',
            },
            errors: {
                recipientName: false,
                phoneNumber: false,
                deliverySchedule: false,
                deliveryAddress: false,
            },
            errorMessage: '',
            isLoading: false,
            showPaymentSection: false,
            qrCodeUrl: null,
            omiseScriptLoaded: false,

            // Payment Logic
            currentChargeId: null,
            pollingInterval: null,
            paymentStatus: 'pending',
        }
    },
    computed: {
        ...mapStores(useAuthStore),
    },
    watch: {
        'formData.recipientName'(value) {
            if (value) this.errors.recipientName = false
        },
        'formData.phoneNumber'(value) {
            if (value) {
                this.errors.phoneNumber = false
            }
        },
        'formData.deliverySchedule'(value) {
            if (value) this.errors.deliverySchedule = false
        },
        'formData.deliveryAddress'(value) {
            if (value) this.errors.deliveryAddress = false
        },
    },
    mounted() {
        this.selectedPack = this.$route.query.pack || 'No pack selected'
        this.loadOmiseScript()
    },
    beforeUnmount() {
        this.stopPolling()
    },
    methods: {
        loadOmiseScript() {
            if (window.Omise) {
                this.omiseScriptLoaded = true
                window.Omise.setPublicKey(this.omisePublicKey)
                return
            }
            const script = document.createElement('script')
            script.src = 'https://cdn.omise.co/omise.js'
            script.onload = () => {
                this.omiseScriptLoaded = true
                window.Omise.setPublicKey(this.omisePublicKey)
            }
            document.head.appendChild(script)
        },
        async validateAndPay() {
            this.errorMessage = ''
            this.showPaymentSection = false
            let hasError = false

            // Reset errors
            Object.keys(this.errors).forEach((key) => {
                this.errors[key] = false
            })

            if (!this.formData.recipientName) {
                this.errors.recipientName = true
                hasError = true
            }
            if (!this.formData.phoneNumber) {
                this.errors.phoneNumber = true
                hasError = true
            }
            if (!this.formData.deliverySchedule) {
                this.errors.deliverySchedule = true
                hasError = true
            }
            if (!this.formData.deliveryAddress) {
                this.errors.deliveryAddress = true
                hasError = true
            }

            if (hasError) {
                this.errorMessage = 'Please fill in all required fields.'
                return
            }

            if (!this.omiseScriptLoaded) {
                this.errorMessage = 'Payment system is initializing. Please try again in a moment.'
                return
            }

            this.isLoading = true
            this.paymentStatus = 'pending'

            if (this.formData.paymentOption === 'qrcode') {
                await this.handlePromptPay()
            } else {
                alert('Credit Card implementation coming soon!')
                this.isLoading = false
            }
        },
        handlePromptPay() {
            window.Omise.createSource(
                'promptpay',
                {
                    amount: this.amountToPay * 100,
                    currency: 'THB',
                },
                (statusCode, response) => {
                    if (statusCode === 200) {
                        const sourceId = response.id
                        this.createChargeOnBackend(sourceId, this.amountToPay * 100)
                    } else {
                        this.isLoading = false
                        this.errorMessage = `Payment failed: ${response.message}`
                    }
                },
            )
        },
        getBackendUrl(functionName) {
            return `https://asia-southeast1-egg-01-ca15a.cloudfunctions.net/${functionName}`
        },
        async createChargeOnBackend(sourceId, amount) {
            try {
                const functionUrl = this.getBackendUrl('createCharge')

                // Get Current User (from Firebase Auth directly to be sure)
                const auth = getAuth()
                const currentUser = auth.currentUser
                const userId = currentUser ? currentUser.uid : 'guest_user'

                // Prepare Metadata (Order Info)
                const orderMetadata = {
                    userId: userId,
                    pack: this.selectedPack,
                    recipientName: this.formData.recipientName,
                    phoneNumber: this.formData.phoneNumber,
                    deliverySchedule: this.formData.deliverySchedule,
                    deliveryAddress: this.formData.deliveryAddress,
                    noteToDriver: this.formData.noteToDriver,
                }

                const res = await fetch(functionUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        source: sourceId,
                        amount: amount,
                        currency: 'thb',
                        metadata: orderMetadata,
                    }),
                })

                if (!res.ok) {
                    let errorMessage = 'Server error'
                    try {
                        const errorData = await res.json()
                        errorMessage = errorData.error || errorMessage
                    } catch (e) {
                        /* ignore */
                    }
                    throw new Error(errorMessage)
                }

                const charge = await res.json()

                if (charge.source && charge.source.scannable_code) {
                    this.qrCodeUrl = charge.source.scannable_code.image.download_uri
                    this.currentChargeId = charge.id
                    this.showPaymentSection = true
                    this.paymentStatus = 'pending'
                    this.startPolling()
                } else {
                    throw new Error('QR Code generation failed (No scannable code returned).')
                }
            } catch (error) {
                console.error('Backend error:', error)
                this.errorMessage = `Failed to process payment: ${error.message}`
            } finally {
                this.isLoading = false
            }
        },
        startPolling() {
            this.stopPolling()
            this.pollingInterval = setInterval(async () => {
                await this.checkPaymentStatus()
            }, 5000)
        },
        stopPolling() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval)
                this.pollingInterval = null
            }
        },
        async checkPaymentStatus() {
            if (!this.currentChargeId || this.paymentStatus !== 'pending') return

            try {
                const functionUrl = this.getBackendUrl('checkChargeStatus')
                const res = await fetch(functionUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chargeId: this.currentChargeId }),
                })

                if (res.ok) {
                    const data = await res.json()

                    if (data.status === 'successful') {
                        // FIX: Store the ID before clearing it
                        const confirmedOrderId = this.currentChargeId;

                        this.paymentStatus = 'successful'
                        this.stopPolling()
                        this.closePaymentModal() // This sets currentChargeId to null

                        this.$router.push({
                            name: 'success',
                            state: {
                                orderDetails: {
                                    // Use the stored variable
                                    orderId: confirmedOrderId,
                                    pack: this.selectedPack,
                                    recipientName: this.formData.recipientName,
                                    phoneNumber: this.formData.phoneNumber,
                                    deliverySchedule: this.formData.deliverySchedule,
                                    deliveryAddress: this.formData.deliveryAddress,
                                    amount: this.amountToPay,
                                },
                            },
                        })
                    } else if (data.status === 'failed' || data.status === 'expired') {
                        this.paymentStatus = 'failed'
                        this.stopPolling()
                    }
                }
            } catch (error) {
                console.error('Error checking status:', error)
            }
        },
        retryPayment() {
            this.paymentStatus = 'pending'
            this.qrCodeUrl = null
            this.handlePromptPay()
        },
        closePaymentModal() {
            this.showPaymentSection = false
            this.qrCodeUrl = null
            this.currentChargeId = null
            this.paymentStatus = 'pending'
            this.stopPolling()
        },
    },
}
</script>

<style scoped>
.container {
    padding: 2rem;
}
.select.is-danger select {
    color: #363636;
}
.loader {
    border: 4px solid #f3f3f3; /* Light grey */
    border-top: 4px solid #3498db; /* Blue */
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 2s linear infinite;
    display: inline-block;
}
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
