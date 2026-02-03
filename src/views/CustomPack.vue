<template>
    <div class="custom-pack-page pb-6">
        
        <!-- Loading Overlay -->
        <div v-if="isLoadingResources" class="loading-overlay">
            <div class="loading-content has-text-centered">
                <!-- Simple Spinner -->
                <div class="spinner mb-3"></div>
                <h3 class="title is-6 has-text-grey">Preparing your carton...</h3>
                <p class="is-size-7 has-text-grey-light">Loading fresh eggs</p>
            </div>
        </div>

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
                    
                    <transition name="fade-carton" mode="out-in">
                        <!-- SPECIAL LAYOUT FOR CUSTOM PACKS (10 & 12) -->
                        <div v-if="isSupportedPack(selectedSize)" :class="`pack-${selectedSize}-container`">
                            <!-- Top Image -->
                            <img 
                                :src="getPartImage(selectedSize, 'top')" 
                                class="pack-top-image"
                                alt="carton top"
                            >

                            <div :class="`pack-${selectedSize}-grid`">
                                <div 
                                    v-for="(slot, index) in cartonSlots" 
                                    :key="index" 
                                    class="pack-slot"
                                >
                                    <!-- 
                                        INSTANT SWITCHING LOGIC (LAYERED) 
                                        1. Base Layer: 'noegg' (Always visible as base)
                                        2. Active Layer: 'hen' (Opacity toggles)
                                        3. Active Layer: 'duck' (Opacity toggles)
                                    -->
                                    
                                    <!-- Layer 1: Base (Empty Slot) -->
                                    <img 
                                        :src="getSlotImage(selectedSize, 'noegg', index + 1)" 
                                        class="pack-bg base-layer" 
                                        alt="carton slot empty"
                                    >

                                    <!-- Layer 2: Hen Egg (Preloaded, Toggled via Opacity) -->
                                    <img 
                                        :src="getSlotImage(selectedSize, 'hen', index + 1)" 
                                        class="pack-bg active-layer" 
                                        :class="{ 'is-visible': isHenSlot(slot) }"
                                        alt="carton slot hen"
                                    >

                                    <!-- Layer 3: Duck Egg (Preloaded, Toggled via Opacity) -->
                                    <img 
                                        :src="getSlotImage(selectedSize, 'duck', index + 1)" 
                                        class="pack-bg active-layer" 
                                        :class="{ 'is-visible': isDuckSlot(slot) }"
                                        alt="carton slot duck"
                                    >
                                    
                                    <!-- Layer 4: Overlay (For Other types only) -->
                                    <transition name="fade-egg">
                                        <div v-if="slot.filled && !isHenSlot(slot) && !isDuckSlot(slot)" class="pack-egg-overlay">
                                            <img :src="slot.egg.image" :alt="slot.egg.name">
                                        </div>
                                    </transition>
                                </div>
                            </div>

                            <!-- Bottom Image -->
                            <img 
                                :src="getPartImage(selectedSize, 'bottom')" 
                                class="pack-bottom-image"
                                alt="carton bottom"
                            >
                        </div>

                        <!-- STANDARD LAYOUT FOR OTHERS (6, 8) -->
                        <div v-else class="carton-grid" :style="gridStyle">
                            <!-- Render Slots with Position Logic -->
                            <div 
                                v-for="(slot, index) in cartonSlots" 
                                :key="index" 
                                class="carton-slot"
                                :class="[getSlotPositionClass(index), { 'is-filled': slot.filled }]"
                            >
                                <transition name="fade-egg">
                                    <figure v-if="slot.filled" class="image is-48x48 egg-in-carton">
                                        <img :src="slot.egg.image" :alt="slot.egg.name">
                                    </figure>
                                </transition>
                            </div>
                        </div>

                    </transition>                    
                    
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
            isLoadingResources: true, // Start in loading state
            selectedSize: 12,
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
    async mounted() {
        await this.preloadImages();
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
        // Calculate grid style dynamically based on pack size (Legacy for 6, 8, 10)
        gridStyle() {
            if (!this.selectedSize || this.isSupportedPack(this.selectedSize)) return {};
            
            let cols = 6;
            if (this.selectedSize === 6) cols = 3; 
            if (this.selectedSize === 8) cols = 4;
            // if (this.selectedSize === 10) cols = 5; // Now handled by custom pack logic
            
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
        isSupportedPack(size) {
            return [10, 12].includes(size);
        },
        async preloadImages() {
            const imagePromises = [];
            const packs = [10, 12];
            const types = ['noegg', 'hen', 'duck'];
            const parts = ['top', 'bottom'];

            for (const size of packs) {
                // Preload parts
                for (const part of parts) {
                    imagePromises.push(this.loadImage(this.getPartImage(size, part)));
                }

                // Preload slots
                for (const type of types) {
                    for (let i = 1; i <= size; i++) {
                        const src = this.getSlotImage(size, type, i);
                        imagePromises.push(this.loadImage(src));
                    }
                }
            }

            try {
                // Wait for all images to load
                await Promise.all(imagePromises);
            } catch (error) {
                console.warn("Some images failed to load:", error);
                // Continue anyway so app is not stuck
            } finally {
                // Hide loader
                this.isLoadingResources = false;
            }
        },
        loadImage(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(src);
                img.onerror = () => reject(src); // Rejecting allows us to catch it
                img.src = src;
            });
        },
        getSlotImage(size, type, index) {
            // General method for fetching pack-specific assets
            // e.g., ../assets/carton/pack12/hen/1.jpg
            return new URL(`../assets/carton/pack${size}/${type}/${index}.jpg`, import.meta.url).href;
        },
        getPartImage(size, part) {
            // e.g. ../assets/carton/pack12/top.jpg
            return new URL(`../assets/carton/pack${size}/${part}.jpg`, import.meta.url).href;
        },
        isHenSlot(slot) {
            return slot.filled && slot.egg && slot.egg.type === 'hen';
        },
        isDuckSlot(slot) {
            return slot.filled && slot.egg && slot.egg.type === 'duck';
        },
        getNoEggImage(index) {
            // Legacy/Fallback helper (can be refactored out eventually)
            // But we might need it if we call it directly somewhere else
            // For now, redirect to current selectedSize or default to 12
            const size = this.selectedSize || 12;
            if (this.isSupportedPack(size)) {
                return this.getSlotImage(size, 'noegg', index);
            }
             // Fallback for non-supported packs (6, 8) - pointing to old path or pack12?
             // Since we moved files, we must point to pack12 or similar as default if old files are gone.
             // The user said "pack10 added", "pack12 moved". 
             // Assuming 6/8 use legacy, but legacy files are likely gone from root 'carton/noegg'.
             // I will point to pack12's noegg as a safe fallback for 6/8 for now.
             return new URL(`../assets/carton/pack12/noegg/${index}.jpg`, import.meta.url).href;
        },
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
                    // Max size reached (12), do nothing
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
                const currentTotal = this.totalSelected; 
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
        // --- Slot Position Class (Legacy) ---
        getSlotPositionClass(index) {
            const cols = this.gridColumns;
            const total = this.selectedSize;
            
            // Top Row
            if (index < cols) {
                if (index === 0) return 'slot-top-left';
                if (index === cols - 1) return 'slot-top-right';
                return 'slot-top-mid';
            }
            // Bottom Row
            else {
                if (index === cols) return 'slot-bottom-left';
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

/* Loading Overlay */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: white;
    z-index: 9999; /* Highest priority */
    display: flex;
    justify-content: center;
    align-items: center;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3; /* Light grey */
    border-top: 4px solid #48c774; /* Primary color */
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

/* --- Carton Grid Styles (Shared/Legacy) --- */
.carton-container {
    background-color: transparent; 
    padding: 0; 
    display: inline-block;
    max-width: 100%;
    width: 100%; /* Ensure full width available for sizing */
    min-height: 350px;
}

/* --- SUPPORTED CUSTOM PACK STYLES (10 & 12) --- */
.pack-12-container, .pack-10-container {
    width: 60%; /* Consistent width */
    margin: 0 auto;
}

.pack-top-image, .pack-bottom-image {
    width: 100%;
    display: block;
    line-height: 0;
}

.pack-12-grid {
    display: grid;
    /* 
       Total 100%
       Left/Right Edge: 21.37% * 2 = 42.74%
       Middle 4: 14.32% * 4 = 57.28%
       Sum approx 100.02% (due to rounding request, will use fractional units to be precise if needed or percentages directly)
    */
    grid-template-columns: 21.37% 14.32% 14.32% 14.32% 14.32% 21.37%;
    gap: 0;
    line-height: 0;
}

.pack-10-grid {
    display: grid;
    /* 
       Pack 10 (2 rows of 5) Calculated based on user inputs:
       Edge: 200px -> ~24.39%
       Middle: 140px -> ~17.07%
       Total 820px
    */
    grid-template-columns: 24.39% 17.07% 17.07% 17.07% 24.39%;
    gap: 0;
    line-height: 0;
}

.pack-slot {
    position: relative;
    width: 100%;
}

/* Base Style for All Layers */
.pack-bg {
    width: 100%;
    height: auto;
    display: block;
    position: absolute; /* Changed to absolute to stack them */
    top: 0;
    left: 0;
    transition: opacity 0.2s ease-in-out;
}

/* Layer 1: Base (Always visible, but behind) */
.pack-bg.base-layer {
    position: relative; /* Base establishes the height */
    z-index: 1;
}

/* Layer 2: Active (Hidden by default, on top) */
.pack-bg.active-layer {
    z-index: 2;
    opacity: 0;
}

.pack-bg.active-layer.is-visible {
    opacity: 1;
}

.pack-egg-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -60%);
    width: 70%;
    z-index: 10;
}

.pack-egg-overlay img {
    width: 100%;
    height: auto;
}

/* --- Legacy Styles for 6, 8 (Fallback) --- */
.carton-grid {
    display: grid;
    gap: 0;
    justify-content: center;
    margin: 0 auto;
}

.carton-slot {
    width: 60px;
    height: 60px;
    background-color: #e3c4a8; 
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
}

/* --- 6 COLORS LOGIC (Legacy) --- */
.slot-top-left { background-color: #dcbfa6; border-top-left-radius: 12px; }
.slot-top-right { background-color: #e3c4a8; border-top-right-radius: 12px; }
.slot-bottom-left { background-color: #e3c4a8; border-bottom-left-radius: 12px; }
.slot-bottom-right { background-color: #dcbfa6; border-bottom-right-radius: 12px; }
.slot-top-mid { background-color: #ead0b8; }
.slot-bottom-mid { background-color: #ead0b8; }
.slot-mid { background-color: #ead0b8; }

.egg-in-carton {
    position: relative;
    z-index: 10;
    margin-top: -4px;
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

/* Carton Fade Transition (Added) */
.fade-carton-enter-active,
.fade-carton-leave-active {
    transition: opacity 0.2s ease-out;
}
.fade-carton-enter-from,
.fade-carton-leave-to {
    opacity: 0;
}

.egg-card {
    border-radius: 12px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
    border: 1px solid #f0f0f0;
    transition: transform 0.2s;
}

.egg-card img {
    max-height: 64px;
    object-fit: contain;
}


</style>
