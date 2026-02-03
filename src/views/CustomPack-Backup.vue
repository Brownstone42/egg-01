<template>
    <div class="custom-pack-page pb-6">
        <!-- Sticky Header -->
        <div class="sticky-header has-background-white pt-4 pb-4 px-4 shadow-sm">
            <h1 class="title is-4 mb-3 has-text-centered">Order Your Eggs</h1>
            
            <!-- Pack Size Selector -->
            <div class="pack-selector-container mb-3 has-text-centered">
                <span class="mr-2 has-text-weight-bold is-size-7">Pack Size:</span>
                <div class="buttons are-small is-inline-flex mb-0">
                    <button 
                        v-for="size in [6, 8, 10, 12]" 
                        :key="size"
                        class="button is-rounded pack-btn"
                        :class="{ 'is-active-pack': selectedSize === size }"
                        @click="changeSize(size)"
                    >
                        {{ size }}
                    </button>
                </div>
            </div>

            <!-- Carton Simulator (Visual Progress) -->
            <div class="has-text-centered">
                <div class="carton-container has-text-centered mb-2" v-if="selectedSize">
                    <div class="carton-grid" :style="gridStyle">
                        <!-- Render Slots with Position Logic -->
                        <div 
                            v-for="(slot, index) in cartonSlots" 
                            :key="index" 
                            class="carton-slot"
                            :class="[getSlotPositionClass(index), { 'is-filled': slot.filled }]"
                        >
                            <!-- Debug Text (Optional: remove later) -->
                            <!-- <span class="is-size-7 has-text-white">{{ getSlotPositionClass(index) }}</span> -->

                            <transition name="fade-egg">
                                <figure v-if="slot.filled" class="image is-48x48 egg-in-carton">
                                    <img :src="slot.egg.image" :alt="slot.egg.name">
                                </figure>
                            </transition>
                        </div>
                    </div>
                    
                    <!-- Status Text below carton -->
                    <div class="level is-mobile mt-2 mb-0">
                        <div class="level-left">
                            <span class="is-size-7 has-text-grey">
                                Selected: <strong class="has-text-primary">{{ totalSelected }}/{{ selectedSize }}</strong>
                            </span>
                        </div>
                        <div class="level-right">
                            <span class="tag is-light is-warning is-rounded is-small" v-if="selectedSize">
                                Save {{ getDiscount(selectedSize) }}%
                            </span>
                        </div>
                    </div>
                </div>
                <div v-else class="py-2 has-text-grey-light is-size-7">
                    Select a size to see your carton
                </div>
            </div>

        </div>

        <!-- Scrollable Content -->
        <div class="container px-4 pt-4" style="padding-bottom: 120px;">
            <div v-if="!selectedSize" class="has-text-centered has-text-grey py-6">
                <span class="icon is-large mb-3"><i class="fas fa-box-open fa-3x"></i></span>
                <p>Please select a pack size to start.</p>
            </div>

            <div v-else>
                <div class="columns is-mobile is-multiline">
                    <!-- Column 1: Hen Eggs (Left) -->
                    <div class="column is-6">
                         <h3 class="subtitle is-6 has-text-grey has-text-weight-bold mb-3 has-text-centered">Hen Eggs</h3>
                         
                         <div v-for="egg in henEggs" :key="egg.id" class="mb-3">
                            <div class="card egg-card">
                                <div class="card-content px-2 py-3 has-text-centered">
                                    <figure class="image is-48x48 is-inline-block mb-2">
                                        <img :src="egg.image" :alt="egg.name">
                                    </figure>
                                    <p class="has-text-weight-bold is-size-7 mb-0">{{ egg.name }}</p>
                                    <p class="has-text-grey is-size-7 mb-2">฿{{ egg.price }}</p>
                                    
                                    <div class="field has-addons is-justify-content-center mb-0">
                                        <p class="control">
                                            <button 
                                                class="button is-small is-rounded is-danger is-light px-2"
                                                @click="decrement(egg.id)"
                                                :disabled="getItemCount(egg.id) === 0"
                                            >
                                                <i class="fas fa-minus"></i>
                                            </button>
                                        </p>
                                        <p class="control">
                                            <input 
                                                class="input is-small has-text-centered px-0" 
                                                type="text" 
                                                readonly 
                                                :value="getItemCount(egg.id)"
                                                style="width: 25px; border: none; background: transparent; font-weight: bold;"
                                            >
                                        </p>
                                        <p class="control">
                                            <button 
                                                class="button is-small is-rounded is-primary px-2"
                                                @click="increment(egg.id)"
                                                :disabled="totalSelected >= 12"
                                            >
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>

                    <!-- Column 2: Duck Eggs (Right) -->
                    <div class="column is-6">
                        <h3 class="subtitle is-6 has-text-grey has-text-weight-bold mb-3 has-text-centered">Duck Eggs</h3>
                        
                        <div v-for="egg in duckEggs" :key="egg.id" class="mb-3">
                            <div class="card egg-card">
                                <div class="card-content px-2 py-3 has-text-centered">
                                    <figure class="image is-48x48 is-inline-block mb-2">
                                        <img :src="egg.image" :alt="egg.name">
                                    </figure>
                                    <p class="has-text-weight-bold is-size-7 mb-0">{{ egg.name }}</p>
                                    <p class="has-text-grey is-size-7 mb-2">฿{{ egg.price }}</p>
                                    
                                    <div class="field has-addons is-justify-content-center mb-0">
                                         <p class="control">
                                            <button 
                                                class="button is-small is-rounded is-danger is-light px-2"
                                                @click="decrement(egg.id)"
                                                :disabled="getItemCount(egg.id) === 0"
                                            >
                                                <i class="fas fa-minus"></i>
                                            </button>
                                        </p>
                                        <p class="control">
                                            <input 
                                                class="input is-small has-text-centered px-0" 
                                                type="text" 
                                                readonly 
                                                :value="getItemCount(egg.id)"
                                                style="width: 25px; border: none; background: transparent; font-weight: bold;"
                                            >
                                        </p>
                                        <p class="control">
                                            <button 
                                                class="button is-small is-rounded is-primary px-2"
                                                @click="increment(egg.id)"
                                                :disabled="totalSelected >= 12"
                                            >
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sticky Footer -->
        <div class="sticky-footer box p-3 m-0">
             <div class="columns is-mobile is-vcentered mb-2">
                <div class="column py-0">
                    <p class="is-size-7 has-text-grey">Total</p>
                    <div class="is-flex is-align-items-baseline">
                         <h4 class="title is-4 has-text-primary mb-0 mr-2">฿{{ finalPrice }}</h4>
                         <span class="is-size-7 has-text-grey-light text-decoration-line-through" v-if="rawPrice > finalPrice">฿{{ rawPrice }}</span>
                    </div>
                </div>
                <div class="column is-narrow py-0 has-text-right">
                     <span class="tag is-success is-light" v-if="selectedSize">Save {{ getDiscount(selectedSize) }}%</span>
                </div>
            </div>
            <button 
                class="button is-primary is-fullwidth is-rounded has-text-weight-bold" 
                :disabled="!isComplete"
                @click="goToCheckout"
            >
                {{ isComplete ? 'Add to Cart' : `Select ${selectedSize ? selectedSize - totalSelected : ''} more` }}
            </button>
        </div>

        <!-- Confirm Change Size Modal -->
        <div class="modal" :class="{ 'is-active': isConfirmModalActive }">
            <div class="modal-background" @click="cancelChangeSize"></div>
            <div class="modal-card px-4">
                <div class="box has-text-centered">
                    <h3 class="title is-5">Change Pack Size?</h3>
                    <p class="mb-4">Changing pack size will reset your current selection. Are you sure?</p>
                    <div class="buttons is-centered">
                        <button class="button is-light is-rounded" @click="cancelChangeSize">Cancel</button>
                        <button class="button is-primary is-rounded" @click="confirmChangeSize">Yes, Change</button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
export default {
    data() {
        return {
            selectedSize: null,
            pendingSize: null,
            isConfirmModalActive: false,
            cart: {}, // { eggId: quantity }
            eggs: [
                { id: 'hen_fresh', name: 'Fresh Hen Egg', type: 'hen', price: 10, image: 'https://cdn-icons-png.flaticon.com/512/837/837560.png' },
                { id: 'duck_fresh', name: 'Fresh Duck Egg', type: 'duck', price: 10, image: 'https://cdn-icons-png.flaticon.com/512/1888/1888496.png' },
                { id: 'hen_boiled', name: 'Boiled Hen Egg', type: 'hen', price: 10, image: 'https://cdn-icons-png.flaticon.com/512/3063/3063073.png' },
                { id: 'duck_boiled', name: 'Boiled Duck Egg', type: 'duck', price: 10, image: 'https://cdn-icons-png.flaticon.com/512/3063/3063073.png' }, 
                { id: 'hen_soft', name: 'Soft Boiled Hen', type: 'hen', price: 10, image: 'https://cdn-icons-png.flaticon.com/512/1581/1581768.png' },
                { id: 'duck_soft', name: 'Soft Boiled Duck', type: 'duck', price: 10, image: 'https://cdn-icons-png.flaticon.com/512/1581/1581768.png' },
                { id: 'century', name: 'Century Egg', type: 'duck', price: 10, image: 'https://cdn-icons-png.flaticon.com/512/9183/9183060.png' },
            ]
        }
    },
    computed: {
        henEggs() {
            return this.eggs.filter(e => e.type === 'hen')
        },
        duckEggs() {
            return this.eggs.filter(e => e.type === 'duck')
        },
        totalSelected() {
            return Object.values(this.cart).reduce((a, b) => a + b, 0)
        },
        isComplete() {
            return this.selectedSize && this.totalSelected === this.selectedSize
        },
        rawPrice() {
            let total = 0;
            for (const [id, qty] of Object.entries(this.cart)) {
                const egg = this.eggs.find(e => e.id === id)
                if (egg) total += egg.price * qty
            }
            return total
        },
        finalPrice() {
            if (!this.selectedSize) return 0;
            const discount = this.getDiscount(this.selectedSize);
            const discountAmount = (this.rawPrice * discount) / 100;
            return Math.floor(this.rawPrice - discountAmount);
        },
        // Build the carton slots array based on cart state
        cartonSlots() {
            const slots = [];
            if (!this.selectedSize) return slots;

            // 1. Fill slots with selected eggs
            for (const [id, qty] of Object.entries(this.cart)) {
                const egg = this.eggs.find(e => e.id === id);
                if (egg) {
                    for (let i = 0; i < qty; i++) {
                        slots.push({ filled: true, egg: egg });
                    }
                }
            }

            // 2. Fill remaining slots with "empty"
            const remaining = this.selectedSize - slots.length;
            for (let i = 0; i < remaining; i++) {
                slots.push({ filled: false, egg: null });
            }

            return slots;
        },
        // Calculate grid style dynamically based on pack size
        gridStyle() {
            if (!this.selectedSize) return {};
            
            // Logic:
            // 6 -> 3 cols (2 rows)
            // 8 -> 4 cols (2 rows)
            // 10 -> 5 cols (2 rows)
            // 12 -> 6 cols (2 rows)
            
            let cols = 6;
            if (this.selectedSize === 6) cols = 3; 
            if (this.selectedSize === 8) cols = 4;
            if (this.selectedSize === 10) cols = 5;
            
            return {
                gridTemplateColumns: `repeat(${cols}, 1fr)`
            }
        },
        // Helper to determine column count (needed for slot logic)
        gridColumns() {
             if (this.selectedSize === 6) return 3; 
             if (this.selectedSize === 8) return 4;
             if (this.selectedSize === 10) return 5;
             return 6; // for 12
        }
    },
    methods: {
        getDiscount(size) {
            return size; // 6%, 8%, 10%, 12%
        },
        getItemCount(id) {
            return this.cart[id] || 0
        },
        increment(id) {
            // Auto Upgrade Logic
            if (this.totalSelected >= this.selectedSize) {
                // Determine next size
                let nextSize = null;
                if (this.selectedSize === 6) nextSize = 8;
                else if (this.selectedSize === 8) nextSize = 10;
                else if (this.selectedSize === 10) nextSize = 12;
                
                if (nextSize) {
                    // Upgrade!
                    this.selectedSize = nextSize;
                    // Add the item
                    this.cart[id] = (this.cart[id] || 0) + 1;
                } else {
                    // Max size reached (12), do nothing (or show toast)
                    // Button is disabled by UI logic anyway, but good to have safeguard
                }
            } else {
                // Normal increment
                this.cart[id] = (this.cart[id] || 0) + 1;
            }
        },
        decrement(id) {
            if (this.cart[id] > 0) {
                // 1. Decrease item count first
                this.cart[id]--;
                if (this.cart[id] === 0) delete this.cart[id];
                
                // 2. Check for Auto-Downgrade
                const currentTotal = this.totalSelected; // Computed property recalculates immediately
                let prevSize = null;

                if (this.selectedSize === 12 && currentTotal === 10) prevSize = 10;
                else if (this.selectedSize === 10 && currentTotal === 8) prevSize = 8;
                else if (this.selectedSize === 8 && currentTotal === 6) prevSize = 6;
                
                if (prevSize) {
                    this.selectedSize = prevSize;
                }
            }
        },
        changeSize(newSize) {
            if (this.selectedSize && this.totalSelected > 0 && this.selectedSize !== newSize) {
                this.pendingSize = newSize;
                this.isConfirmModalActive = true;
            } else {
                this.selectedSize = newSize;
            }
        },
        confirmChangeSize() {
            this.selectedSize = this.pendingSize;
            this.cart = {}; // Reset cart
            this.pendingSize = null;
            this.isConfirmModalActive = false;
        },
        cancelChangeSize() {
            this.pendingSize = null;
            this.isConfirmModalActive = false;
        },
        goToCheckout() {
            if (!this.isComplete) return;

            // Construct readable description
            const details = Object.entries(this.cart).map(([id, qty]) => {
                const egg = this.eggs.find(e => e.id === id)
                return `${qty}x ${egg.name}`
            }).join(', ');

            const packName = `Custom Pack (${this.selectedSize})`;

            this.$router.push({
                name: 'subscription',
                query: {
                    pack: packName,
                    cycle: 'weekly', // Default to weekly
                    price: this.finalPrice
                }
            })
        },
        // --- NEW LOGIC: Slot Position Class ---
        getSlotPositionClass(index) {
            const cols = this.gridColumns;
            const total = this.selectedSize;
            
            // NOTE: Removed special case for pack 6 single row.
            // Now all packs (6, 8, 10, 12) use the same 2-row logic.

            // Top Row
            if (index < cols) {
                if (index === 0) return 'slot-top-left';
                if (index === cols - 1) return 'slot-top-right';
                return 'slot-top-mid';
            }
            // Bottom Row
            else {
                // Bottom Left: First element of second row
                if (index === cols) return 'slot-bottom-left';
                // Bottom Right: Last element
                if (index === total - 1) return 'slot-bottom-right';
                return 'slot-bottom-mid';
            }
        }
    }
}
</script>

<style scoped>
.custom-pack-page {
    background-color: #fcfcfc;
    min-height: 100vh;
}

.sticky-header {
    position: sticky;
    top: 0;
    z-index: 20;
    border-bottom: 1px solid #f0f0f0;
}

.sticky-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 20;
    border-top: 1px solid #f0f0f0;
    box-shadow: 0 -4px 10px rgba(0,0,0,0.05);
}

.pack-btn {
    border: 1px solid #dbdbdb;
    color: #666;
    transition: all 0.2s;
    min-width: 40px;
}

.pack-btn.is-active-pack {
    background-color: #48c774; /* Primary Color */
    border-color: #48c774;
    color: white;
    font-weight: bold;
    transform: scale(1.1);
}

/* --- Carton Grid Styles --- */
.carton-container {
    background-color: transparent; /* Changed from f5f5f5 to show slot borders cleanly */
    padding: 0; /* Remove padding to let slots define shape */
    display: inline-block;
    max-width: 100%;
}

.carton-grid {
    display: grid;
    gap: 0; /* NO GAP: Connect the pieces */
    justify-content: center;
    margin: 0 auto;
}

.carton-slot {
    width: 60px; /* Increased from 40px */
    height: 60px; /* Increased from 40px */
    /* Default fallback color (Cardboard brown) */
    background-color: #e3c4a8; 
    
    /* Center Content */
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    /* Removed negative margin */
    /* margin: -0.5px; */
    z-index: 1;

    /* Debug Border - remove later if using images */
    /* border: 1px solid rgba(0,0,0,0.05); */
}

/* --- 6 COLORS LOGIC (PLACEHOLDER FOR IMAGES) --- */
.slot-top-left {
    background-color: #dcbfa6; /* Darker Brown */
    border-top-left-radius: 12px;
}
.slot-top-right {
    background-color: #e3c4a8; /* Medium Brown */
    border-top-right-radius: 12px;
}
.slot-bottom-left {
    background-color: #e3c4a8;
    border-bottom-left-radius: 12px;
}
.slot-bottom-right {
    background-color: #dcbfa6;
    border-bottom-right-radius: 12px;
}
.slot-top-mid {
    background-color: #ead0b8; /* Lighter Brown */
}
.slot-bottom-mid {
    background-color: #ead0b8;
}

/* Special case for single row (Pack 6) to look rounded */
.slot-mid {
    background-color: #ead0b8;
}

/* --- Once you have images, replace background-color above with: --- */
/* 
.slot-top-left { background-image: url('@/assets/carton/slot-top-left.png'); }
.slot-top-right { background-image: url('@/assets/carton/slot-top-right.png'); }
... etc ...
*/


.egg-in-carton {
    position: relative;
    z-index: 10;
    margin-top: -4px; /* Adjust based on image perspective */
}

/* --- Transition --- */
.fade-egg-enter-active,
.fade-egg-leave-active {
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fade-egg-enter-from,
.fade-egg-leave-to {
    opacity: 0;
    transform: scale(0.5) translateY(-10px);
}

/* --- End Carton Styles --- */

.egg-card {
    border-radius: 12px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
    border: 1px solid #f0f0f0;
    transition: transform 0.2s;
}

/* Card image styling */
.egg-card img {
    max-height: 64px;
    object-fit: contain;
}
</style>
