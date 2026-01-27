<template>
    <div class="container is-max-desktop py-6">
        <div class="columns is-centered">
            <div class="column is-8">
                <!-- Header -->
                <div class="level mb-5">
                    <div class="level-left">
                        <h1 class="title is-2 has-text-weight-bold">Checkout</h1>
                    </div>
                </div>

                <!-- Customer Info Card -->
                <div class="box checkout-card mb-5">
                    <h3 class="title is-5 mb-4">Customer</h3>
                    <div class="columns">
                        <div class="column is-6">
                            <div class="field">
                                <label class="label">Name</label>
                                <div class="control">
                                    <input
                                        class="input"
                                        type="text"
                                        v-model="form.name"
                                        placeholder="Your name"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="column is-6">
                            <div class="field">
                                <label class="label">Phone</label>
                                <div class="control">
                                    <input
                                        class="input"
                                        type="tel"
                                        v-model="form.phone"
                                        placeholder="081-234-5678"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Delivery Details Card -->
                 <div class="box checkout-card mb-5">
                    <h3 class="title is-5 mb-4">Delivery Details</h3>
                    <div class="columns">
                        <div class="column is-6">
                            <div class="field">
                                <label class="label">Delivery Schedule</label>
                                <div class="control has-icons-left">
                                    <div class="select is-fullwidth">
                                        <select v-model="form.deliverySchedule">
                                            <option value="" disabled>Select delivery time</option>
                                            <option value="Wednesday Morning">Wednesday Morning (08:00 - 12:00)</option>
                                            <option value="Wednesday Evening">Wednesday Evening (17:00 - 20:00)</option>
                                            <option value="Sunday Morning">Sunday Morning (08:00 - 12:00)</option>
                                            <option value="Sunday Evening">Sunday Evening (17:00 - 20:00)</option>
                                        </select>
                                    </div>
                                    <div class="icon is-small is-left">
                                        <i class="fas fa-clock"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                         <div class="column is-6">
                            <div class="field">
                                <label class="label">Note to Driver</label>
                                <div class="control has-icons-left">
                                    <div class="select is-fullwidth">
                                        <select v-model="form.noteToDriver">
                                            <option value="" disabled>Select instruction</option>
                                            <option value="Hang on the fence (แขวนไว้ที่รั้ว)">Hang on the fence (แขวนไว้ที่รั้ว)</option>
                                            <option value="Leave on the table (วางไว้ที่โต๊ะ)">Leave on the table (วางไว้ที่โต๊ะ)</option>
                                            <option value="Someone will receive (มีคนรอรับ)">Someone will receive (มีคนรอรับ)</option>
                                        </select>
                                    </div>
                                     <div class="icon is-small is-left">
                                        <i class="fas fa-comment-alt"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <!-- Address Section Card -->
                <div class="box checkout-card mb-5">
                    <h3 class="title is-5 mb-4">Address</h3>

                    <!-- Pin Button -->
                    <div class="field mb-4">
                        <label class="label">Address (pin)</label>
                        <div class="control" @click="openMapModal">
                            <div
                                class="button is-white is-fullwidth has-text-left is-justify-content-start pin-button"
                            >
                                <span class="icon is-medium has-text-danger mr-2">
                                    <i class="fas fa-map-marker-alt"></i>
                                </span>
                                <span class="is-clipped">
                                    {{
                                        hasLocation
                                            ? form.address || 'Location Selected'
                                            : 'Tap to select location on map'
                                    }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Address Text Area -->
                    <div class="field">
                        <label class="label">Address (text)</label>
                        <div class="control">
                            <textarea
                                class="textarea"
                                v-model="form.address"
                                placeholder="House no., street, subdistrict, district, province, postal code"
                                rows="3"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <!-- Items Section Card -->
                <div class="box checkout-card mb-5">
                    <div class="level is-mobile mb-4">
                        <div class="level-left">
                            <h3 class="title is-5 mb-0">Items</h3>
                        </div>
                        <div class="level-right">
                            <span class="tag is-rounded is-light">{{ items.length }} item{{ items.length > 1 ? 's' : '' }}</span>
                        </div>
                    </div>

                    <!-- Selected Plan Items -->
                    <div v-if="items.length > 0">
                        <div class="plan-item-row mb-3" v-for="(item, index) in items" :key="index">
                            <div class="columns is-mobile is-vcentered">
                                <!-- Radio/Checkbox Placeholder -->
                                <div class="column is-narrow">
                                    <div class="item-radio is-selected">
                                        <span class="icon is-small has-text-white">
                                            <i class="fas fa-check"></i>
                                        </span>
                                    </div>
                                </div>

                                <!-- Item Details -->
                                <div class="column">
                                    <h4 class="title is-6 mb-1">{{ item.name }}</h4>
                                    <p class="is-size-7 has-text-grey">
                                        {{
                                            item.cycle === 'weekly'
                                                ? 'Weekly Plan'
                                                : 'Monthly Plan'
                                        }}
                                    </p>
                                </div>

                                <!-- Price -->
                                <div class="column is-narrow has-text-right">
                                    <p class="title is-6 mb-1">฿{{ item.price }}</p>
                                    <p class="is-size-7 has-text-grey">per item</p>
                                </div>
                                
                                <!-- Delete Button -->
                                <div class="column is-narrow">
                                    <button 
                                        class="button is-small is-danger is-light is-rounded" 
                                        @click="removeItem(index)"
                                        :disabled="items.length <= 1"
                                        title="Remove item"
                                    >
                                        <span class="icon is-small">
                                            <i class="fas fa-trash"></i>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Add Pack Button -->
                         <div class="has-text-centered mt-4">
                            <button class="button is-ghost has-text-primary" @click="openPlanModal">
                                <span class="icon"><i class="fas fa-plus"></i></span>
                                <span>Add Pack</span>
                            </button>
                        </div>
                    </div>
                     <div v-else class="has-text-centered py-4 has-text-grey">
                        No plan selected. <router-link to="/">Go back to Home</router-link>
                    </div>
                </div>

                <!-- Order Summary -->
                <div class="box checkout-card mb-5">
                    <div class="columns is-mobile mb-2">
                        <div class="column"><strong>Subtotal</strong></div>
                        <div class="column has-text-right">฿{{ subtotal }}</div>
                    </div>
                    <!-- Delivery Fee Removed -->
                    <hr class="my-3">
                    <div class="columns is-mobile">
                         <div class="column"><h4 class="title is-5">Total</h4></div>
                         <div class="column has-text-right"><h4 class="title is-5">฿{{ total }}</h4></div>
                    </div>

                     <button 
                        class="button is-primary is-fullwidth is-large is-rounded mt-4 font-weight-bold" 
                        :class="{ 'is-loading': isLoading }"
                        @click="placeOrder"
                    >
                        Place order
                    </button>
                </div>

            </div>
        </div>

        <!-- Map Modal -->
        <div class="modal" :class="{ 'is-active': isMapModalActive }">
            <div class="modal-background" @click="closeMapModal"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Select Location</p>
                </header>
                <section class="modal-card-body p-0" style="height: 400px; position: relative">
                    <GoogleMap
                        v-if="isMapModalActive"
                        :initial-location="form.location"
                        @location-selected="onLocationSelected"
                    />
                </section>
                <footer class="modal-card-foot is-justify-content-flex-end">
                    <button class="button mr-2" @click="closeMapModal">Cancel</button>
                    <button class="button is-primary" @click="confirmLocation">
                        Confirm Location
                    </button>
                </footer>
            </div>
        </div>

        <!-- Plan Selection Modal -->
        <div class="modal" :class="{ 'is-active': isPlanModalActive }">
            <div class="modal-background" @click="closePlanModal"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Select Additional Plan</p>
                    <button class="delete" aria-label="close" @click="closePlanModal"></button>
                </header>
                <section class="modal-card-body">
                    <!-- Billing Cycle Toggle inside Modal -->
                    <div class="has-text-centered mb-4">
                         <div class="billing-toggle">
                            <span
                                class="toggle-item"
                                :class="{ 'is-active': modalBillingCycle === 'weekly' }"
                                @click="modalBillingCycle = 'weekly'"
                            >
                                Weekly
                            </span>
                            <span
                                class="toggle-item"
                                :class="{ 'is-active': modalBillingCycle === 'monthly' }"
                                @click="modalBillingCycle = 'monthly'"
                            >
                                Monthly
                            </span>
                        </div>
                    </div>

                    <div class="columns is-multiline">
                        <div class="column is-12" v-for="plan in plansStore.plans" :key="plan.id">
                            <div class="box plan-selection-box" @click="addPlanFromModal(plan)">
                                <div class="level is-mobile">
                                    <div class="level-left">
                                        <div>
                                            <p class="title is-5 mb-1">{{ plan.name }}</p>
                                            <p class="subtitle is-7 has-text-grey">{{ plan.description }}</p>
                                        </div>
                                    </div>
                                    <div class="level-right has-text-right">
                                        <div>
                                            <p class="title is-5 has-text-primary mb-0">
                                                ฿{{ modalBillingCycle === 'weekly' ? plan.priceWeekly : plan.priceMonthly }}
                                            </p>
                                            <p class="is-size-7">/ {{ modalBillingCycle === 'weekly' ? 'week' : 'month' }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>

        <!-- Payment QR Modal -->
        <div class="modal" :class="{ 'is-active': isPaymentModalActive }">
            <div class="modal-background"></div>
            <div class="modal-content has-text-centered">
                <div class="box">
                    <h3 class="title is-4">Scan to Pay</h3>
                    <p class="subtitle is-6 mb-4">Please scan the QR code to complete your payment.</p>
                    
                    <figure class="image is-inline-block" v-if="qrCodeUrl">
                        <img :src="qrCodeUrl" alt="PromptPay QR Code" style="max-height: 300px;">
                    </figure>
                    <div v-else class="p-6">
                        <button class="button is-loading is-white is-large" style="border: none;"></button>
                    </div>
                    
                    <!-- Manual Check Button Removed -->

                    <p class="has-text-grey is-size-7 mt-2">Checking payment status automatically...</p>
                    <p class="has-text-danger mt-3 mb-2" v-if="paymentError">{{ paymentError }}</p>

                    <button class="button is-light mt-4" @click="closePaymentModal">Cancel Payment</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import GoogleMap from '../components/GoogleMap.vue'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { usePlansStore } from '../stores/plans'
import axios from 'axios'

export default {
    components: {
        GoogleMap,
    },
    setup() {
        const plansStore = usePlansStore()
        return { plansStore }
    },
    data() {
        return {
            form: {
                name: '',
                phone: '',
                address: '',
                location: null,
                deliverySchedule: '', 
                noteToDriver: '', 
            },
            items: [], 
            // deliveryFee: 0, // Removed
            tempLocation: null,
            tempAddress: '',
            isMapModalActive: false,
            isPlanModalActive: false,
            isPaymentModalActive: false,
            modalBillingCycle: 'weekly',
            user: null,
            isLoading: false,
            qrCodeUrl: null,
            paymentError: null,
            // OMISE CONFIG - Replace with your Actual Public Key
            omisePublicKey: 'pkey_test_63bghetmlex6v6n314d',
            currentOrderId: null,
            currentChargeId: null, 
            unsubscribeOrderListener: null,
            paymentPollingInterval: null,
            isCheckingStatus: false, 
        }
    },
    computed: {
        hasLocation() {
            return this.form.location !== null
        },
        subtotal() {
            return this.items.reduce((sum, item) => sum + Number(item.price), 0)
        },
        total() {
             return this.subtotal // No delivery fee added
        }
    },
    async created() {
        // Load Omise.js Script
        this.loadOmiseScript();

        // Retrieve Query Params
        const { pack, cycle, price } = this.$route.query
        if (pack && cycle && price) {
            this.items.push({
                name: pack,
                cycle: cycle,
                price: price
            })
            this.modalBillingCycle = cycle;
        }

        const auth = getAuth()
        this.user = auth.currentUser
        if (this.user) {
            this.form.name = this.user.displayName || ''
            try {
                const db = getFirestore()
                const docRef = doc(db, 'users', this.user.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    const userData = docSnap.data()
                    if (userData.phoneNumber) this.form.phone = userData.phoneNumber
                    if (userData.address) this.form.address = userData.address
                }
            } catch (e) {
                console.error('Error fetching user data', e)
            }
        }
    },
    // Cleanup listener on destroy
    beforeUnmount() {
        this.cleanupListeners();
    },
    methods: {
        loadOmiseScript() {
            const script = document.createElement('script');
            script.src = 'https://cdn.omise.co/omise.js';
            script.onload = () => {
                window.Omise.setPublicKey(this.omisePublicKey);
            };
            document.head.appendChild(script);
        },
        openMapModal() {
            this.isMapModalActive = true
        },
        closeMapModal() {
            this.isMapModalActive = false
            this.tempLocation = null
            this.tempAddress = ''
        },
        onLocationSelected(locationData) {
            this.tempLocation = { lat: locationData.lat, lng: locationData.lng }
            this.tempAddress = locationData.address
        },
        confirmLocation() {
            if (this.tempLocation) {
                this.form.location = this.tempLocation
                if (this.tempAddress) {
                    this.form.address = this.tempAddress
                }
                this.isMapModalActive = false 
            } else {
                alert('Please wait for the map to load or select a location.')
            }
        },
        removeItem(index) {
            if (this.items.length > 1) {
                this.items.splice(index, 1)
            }
        },
        openPlanModal() {
            this.isPlanModalActive = true
        },
        closePlanModal() {
            this.isPlanModalActive = false
        },
        addPlanFromModal(plan) {
            const price = this.modalBillingCycle === 'weekly' ? plan.priceWeekly : plan.priceMonthly
            this.items.push({
                name: plan.name,
                cycle: this.modalBillingCycle,
                price: price
            })
            this.closePlanModal()
        },
        
        async placeOrder() {
            // Validation for new fields
            if (!this.form.name || !this.form.phone || !this.form.address) {
                alert('Please fill in all delivery details.')
                return
            }
            if (!this.form.deliverySchedule) {
                 alert('Please select a delivery schedule.')
                return
            }
            if (!this.form.noteToDriver) {
                 alert('Please select instructions for the driver.')
                return
            }
            if (this.items.length === 0) {
                alert('No plan selected.')
                return
            }

            this.isLoading = true;
            this.paymentError = null;

            try {
                const db = getFirestore()
                // 1. Create Order in Firestore First (Status: waiting_for_payment)
                const orderData = {
                    userId: this.user ? this.user.uid : 'guest',
                    customer: {
                        name: this.form.name,
                        phone: this.form.phone,
                        address: this.form.address,
                        location: this.form.location,
                        note: this.form.noteToDriver 
                    },
                    items: this.items.map(item => ({
                        name: item.name,
                        cycle: item.cycle,
                        price: Number(item.price),
                        quantity: 1
                    })),
                    
                    deliverySchedule: this.form.deliverySchedule,
                    noteToDriver: this.form.noteToDriver, 
                    
                    subtotal: this.subtotal,
                    // deliveryFee removed
                    total: this.total,
                    status: 'waiting_for_payment',
                    createdAt: serverTimestamp()
                }

                const docRef = await addDoc(collection(db, 'orders'), orderData)
                this.currentOrderId = docRef.id;
                console.log("Order placed with ID: ", this.currentOrderId);

                // Start listening to order status change immediately
                this.listenForPaymentSuccess(this.currentOrderId);

                // 2. Call Omise to Create Source (PromptPay)
                if (!window.Omise) {
                    throw new Error("Omise JS not loaded");
                }

                const amountInSatang = this.total * 100; // Omise uses Satang

                window.Omise.createSource('promptpay', {
                    amount: amountInSatang,
                    currency: 'THB'
                }, async (statusCode, response) => {
                    if (statusCode !== 200) {
                        this.paymentError = response.message;
                        this.isLoading = false;
                        alert('Payment Error: ' + response.message);
                        return;
                    }

                    const sourceId = response.id;

                    // 3. Call Cloud Function to Create Charge
                    try {
                        // REPLACE WITH YOUR ACTUAL CLOUD FUNCTION URL
                        const createChargeUrl = 'https://asia-southeast1-egg-01-ca15a.cloudfunctions.net/createCharge'; 
                        
                        const chargeResponse = await axios.post(createChargeUrl, {
                            amount: amountInSatang,
                            currency: 'thb',
                            source: sourceId,
                            metadata: {
                                orderId: this.currentOrderId,
                                customerName: this.form.name,
                                deliverySchedule: this.form.deliverySchedule 
                            }
                        });

                        const charge = chargeResponse.data;
                        this.currentChargeId = charge.id; // STORE CHARGE ID
                        
                        // 4. Display QR Code
                        if (charge.status === 'pending' && charge.source.scannable_code) {
                            this.qrCodeUrl = charge.source.scannable_code.image.download_uri;
                            this.isPaymentModalActive = true;
                            
                            // *** Start Active Polling (Calling Cloud Function) ***
                            this.startActivePolling();

                        } else if (charge.status === 'successful') {
                            this.handlePaymentSuccess();
                        } else {
                             // Some other status
                             this.paymentError = "Unexpected charge status: " + charge.status;
                        }

                    } catch (err) {
                        console.error("Charge API Error:", err);
                        this.paymentError = "Failed to create payment charge.";
                    } finally {
                        this.isLoading = false;
                    }
                });

            } catch (e) {
                console.error("Error placing order: ", e);
                alert("Failed to place order. Please try again.")
                this.isLoading = false;
            }
        },
        listenForPaymentSuccess(orderId) {
            const db = getFirestore();
            this.cleanupListeners(); // Cleanup any existing listeners
            
            console.log("Starting to listen for order:", orderId);

            // Method 1: Realtime Listener (Still good to have if Webhook works)
            this.unsubscribeOrderListener = onSnapshot(doc(db, "orders", orderId), (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    console.log("Realtime Update - Order Status:", data.status);
                    if (data.status === 'paid' || data.status === 'successful') {
                        this.handlePaymentSuccess();
                    }
                }
            }, (error) => {
                console.error("Listener Error:", error);
            });
        },
        // *** NEW: Active Polling using Cloud Function ***
        startActivePolling() {
            if (this.paymentPollingInterval) clearInterval(this.paymentPollingInterval);

            // Poll every 5 seconds
            this.paymentPollingInterval = setInterval(async () => {
                if (!this.currentChargeId) return;
                
                try {
                     console.log("Auto-polling status via Cloud Function...");
                     const checkStatusUrl = 'https://asia-southeast1-egg-01-ca15a.cloudfunctions.net/checkChargeStatus';
                     const response = await axios.post(checkStatusUrl, {
                        chargeId: this.currentChargeId
                     });
                     
                     const status = response.data.status;
                     if (status === 'successful' || status === 'paid') {
                         this.handlePaymentSuccess();
                     }
                } catch (e) {
                    console.error("Auto-polling error (ignoring):", e);
                }
            }, 5000);
        },
        // Manual Check Function removed as requested
        
        handlePaymentSuccess() {
             if (this.isPaymentModalActive) {
                console.log("Payment confirmed! Redirecting...");
                this.isPaymentModalActive = false;
                this.cleanupListeners();
                
                // Prepare data for Success page
                const packSummary = this.items.map(i => `${i.name} (${i.cycle})`).join(', ');

                this.$router.push({
                    name: 'success', // Assuming the route name is 'success'
                    state: {
                        orderDetails: {
                            orderId: this.currentOrderId,
                            pack: packSummary,
                            recipientName: this.form.name,
                            phoneNumber: this.form.phone,
                            deliveryAddress: this.form.address,
                            amount: this.total,
                            deliverySchedule: this.form.deliverySchedule, // Pass schedule
                            noteToDriver: this.form.noteToDriver // Pass note
                        }
                    }
                });
            }
        },
        cleanupListeners() {
            if (this.unsubscribeOrderListener) {
                this.unsubscribeOrderListener();
                this.unsubscribeOrderListener = null;
            }
            if (this.paymentPollingInterval) {
                clearInterval(this.paymentPollingInterval);
                this.paymentPollingInterval = null;
            }
        },
        closePaymentModal() {
            this.isPaymentModalActive = false;
            this.cleanupListeners();
        }
    },
}
</script>

<style scoped>
.checkout-card {
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f0f0;
}

.pin-button {
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    height: auto;
    padding: 12px 16px;
    transition: all 0.2s;
}

.pin-button:hover {
    border-color: #b5b5b5;
    background-color: #f9f9f9;
}

.modal-card {
    width: 90%;
    max-width: 600px;
    border-radius: 16px;
    overflow: hidden;
}

.input,
.textarea {
    border-radius: 8px;
    box-shadow: none;
    border-color: #dbdbdb;
}

.input:focus,
.textarea:focus {
    border-color: #48c774;
    box-shadow: 0 0 0 0.125em rgba(72, 199, 116, 0.25);
}

/* Margin helper */
.mr-2 {
    margin-right: 0.75rem !important;
}

/* Item Styles */
.plan-item-row {
    padding: 1rem;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
}

.item-radio {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid #dbdbdb;
    display: flex;
    align-items: center;
    justify-content: center;
}

.item-radio.is-selected {
    background-color: #48c774;
    border-color: #48c774;
}

.font-weight-bold {
    font-weight: bold;
}

/* Billing Toggle Styling in Modal */
.billing-toggle {
    background: #e0e0e0;
    display: inline-flex;
    padding: 4px;
    border-radius: 50px;
    position: relative;
    cursor: pointer;
}

.toggle-item {
    padding: 8px 24px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 0.9rem;
    color: #666;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
}

.toggle-item.is-active {
    background: white;
    color: #000;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Plan Selection Box inside Modal */
.plan-selection-box {
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s;
}

.plan-selection-box:hover {
    border-color: #48c774;
    background-color: #f9fdfa;
}

/* Payment Modal */
.modal-content .box {
    border-radius: 16px;
    padding: 2rem;
}
</style>
