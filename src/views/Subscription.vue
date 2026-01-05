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

            <div class="field">
                <label class="label">Phone Number</label>
                <div class="control">
                    <input
                        class="input"
                        :class="{ 'is-danger': errors.phoneNumber }"
                        v-model="formData.phoneNumber"
                        type="tel"
                        placeholder="e.g. 0812345678"
                    />
                </div>
                <p class="help">We will use this for OTP verification in the future.</p>
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
                    <label class="radio">
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
                    <button class="button is-primary" @click="validateAndPay">
                        Proceed to Payment
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showPaymentSection" class="box">
            <h2 class="title is-4">Payment Section (Placeholder)</h2>
            <p>This is where the QR Code or Credit Card payment form will be displayed.</p>
            <p>Selected Payment Method: {{ formData.paymentOption }}</p>
        </div>
    </div>
</template>

<script>
import GoogleMap from '@/components/GoogleMap.vue'

export default {
    components: {
        GoogleMap,
    },
    data() {
        return {
            selectedPack: '',
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
            showPaymentSection: false,
        }
    },
    watch: {
        'formData.recipientName'(value) {
            if (value) this.errors.recipientName = false
        },
        'formData.phoneNumber'(value) {
            if (value) this.errors.phoneNumber = false
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
    },
    methods: {
        validateAndPay() {
            this.errorMessage = ''
            this.showPaymentSection = false
            let hasError = false

            // Reset errors before validation
            Object.keys(this.errors).forEach((key) => {
                this.errors[key] = false
            })

            // --- Validation from top to bottom ---
            if (!this.formData.recipientName) {
                this.errors.recipientName = true
                if (!this.errorMessage) this.errorMessage = 'Recipient Name is required.'
                hasError = true
            }

            if (!this.formData.phoneNumber) {
                this.errors.phoneNumber = true
                if (!this.errorMessage) this.errorMessage = 'Phone Number is required.'
                hasError = true
            }

            if (!this.formData.deliverySchedule) {
                this.errors.deliverySchedule = true
                if (!this.errorMessage) this.errorMessage = 'Delivery Schedule is required.'
                hasError = true
            }

            if (!this.formData.deliveryAddress) {
                this.errors.deliveryAddress = true
                if (!this.errorMessage) this.errorMessage = 'Delivery Address is required.'
                hasError = true
            }

            if (hasError) {
                return
            }

            // If all validations pass
            this.showPaymentSection = true
        },
    },
}
</script>

<style scoped>
.container {
    padding: 2rem;
}

/* By default, Bulma makes the text of a .select.is-danger red.
   This override sets the text color back to the default,
   while keeping the red border. */
.select.is-danger select {
    color: #363636; /* Bulma's default text color */
}
</style>
