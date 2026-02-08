<template>
    <div class="custom-pack-page pb-6">
        <!-- Floating Burger Menu (Specific to this page) -->
        <a 
            role="button" 
            class="navbar-burger floating-burger" 
            :class="{ 'is-active': isMenuActive }"
            @click="toggleMenu"
            aria-label="menu"
            aria-expanded="false"
        >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
        </a>

        <!-- Mobile Menu Overlay -->
        <div class="menu-overlay" :class="{ 'is-active': isMenuActive }">
            <div class="menu-content has-background-white p-6">
                <button class="delete is-large is-pulled-right" @click="toggleMenu"></button>
                <h3 class="title is-4 mb-6">Menu</h3>
                
                <div class="menu-items">
                    <router-link to="/" class="menu-item py-3 is-block border-bottom">Home</router-link>
                    <router-link to="/dashboard" v-if="authStore.user" class="menu-item py-3 is-block border-bottom">Dashboard</router-link>
                    <router-link to="/tracking" class="menu-item py-3 is-block border-bottom">Tracking</router-link>
                    <a v-if="authStore.user && !isLiffView" @click="authStore.logout" class="menu-item py-3 is-block has-text-danger">Logout</a>
                </div>
            </div>
        </div>

        <!-- Loader -->
        <div v-if="pageLoading" class="loader-overlay has-background-white">
            <div class="has-text-centered">
                <figure class="image is-128x128 is-inline-block mb-4">
                    <img src="https://cdn-icons-png.flaticon.com/512/837/837560.png" class="spinning-egg" alt="Loading">
                </figure>
                <p class="is-size-5 has-text-weight-bold has-text-primary">Preparing your carton...</p>
                <progress class="progress is-small is-primary mt-4 mx-auto" style="width: 200px;" :value="loadProgress" max="100"></progress>
            </div>
        </div>

        <template v-else>
            <!-- Sticky Header -->
            <div class="sticky-header has-background-white shadow-sm">
                <h1 class="title is-4 mb-3 has-text-centered" v-show="false">Order Your Eggs</h1>
                
                <!-- Pack Size Selector -->
                <div class="pack-selector-container mb-3 has-text-centered" v-show="false">
                    <div class="buttons is-centered">
                        <button 
                            class="button is-small is-rounded" 
                            :class="packSize === 8 ? 'is-primary' : 'is-light'"
                            @click="setPackSize(8)"
                        >8 Eggs Pack</button>
                        <button 
                            class="button is-small is-rounded" 
                            :class="packSize === 12 ? 'is-primary' : 'is-light'"
                            @click="setPackSize(12)"
                        >12 Eggs Pack</button>
                    </div>
                </div>

                <!-- Carton Simulator (Visual Progress) -->
                <div class="has-text-centered">
                    <div class="carton-wrapper">
                        <div class="carton-relative-container">
                            <!-- Background Image -->
                            <figure class="image m-0 p-0 carton-img">
                                <img :src="currentBg" :alt="`Carton Pack ${packSize}`">
                            </figure>
                            
                            <!-- Egg Overlays -->
                            <transition-group name="fade">
                                <img 
                                    v-for="(egg, index) in selectedEggs" 
                                    :key="`egg-${index}`"
                                    :src="getEggOverlay(egg, index)" 
                                    class="carton-overlay-img" 
                                    :style="{ zIndex: packSize - index }"
                                >
                            </transition-group>
                        </div>
                        
                        <!-- Status Text below carton -->
                        <div class="level is-mobile mt-3 mb-0 px-2" style="width: 100%; max-width: 400px; margin: 0 auto;" v-show="false">
                            <div class="level-left">
                                <span class="is-size-7 has-text-grey">
                                    Selected: <strong class="has-text-primary">{{ totalSelected }}/{{ packSize }}</strong>
                                </span>
                            </div>
                            <div class="level-right">
                                <span class="tag is-light is-warning is-rounded is-small">
                                    Save 10%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Scrollable Content -->
            <div class="container px-4 pt-4" style="padding-bottom: 120px;">
                <div class="columns is-mobile is-multiline">
                    <div v-for="egg in eggs" :key="egg.id" class="column is-6 mb-2">
                        <div class="card egg-card h-100">
                            <div class="card-content p-4">
                                <!-- 1. Image Icon with Badge -->
                                <div class="image-container mb-3">
                                    <figure class="image is-square">
                                        <img :src="egg.image" :alt="egg.name" style="object-fit: contain;">
                                    </figure>
                                    <!-- Quantity Badge -->
                                    <div class="quantity-badge" v-if="getItemCount(egg.id) > 0">
                                        {{ getItemCount(egg.id) }}
                                    </div>
                                </div>
                                
                                <!-- 2. Large Name (Thai) -->
                                <p class="title is-6 mb-1 has-text-weight-bold">{{ egg.name_th }}</p>
                                
                                <!-- 3. Small Description (English) -->
                                <p class="subtitle is-7 has-text-grey mb-4">{{ egg.name }}</p>
                                
                                <!-- 4. Price & 5. Buttons in same row -->
                                <div class="is-flex is-justify-content-between is-align-items-center mt-auto">
                                    <p class="has-text-weight-bold is-size-6">{{ egg.price.toFixed(2) }}฿</p>
                                    
                                    <div class="buttons-container is-flex ml-auto">
                                        <button 
                                            v-if="getItemCount(egg.id) > 0"
                                            class="button quantity-btn decrement mr-1"
                                            @click="decrement(egg.id)"
                                        >
                                            <i class="fas fa-minus"></i>
                                        </button>
                                        <button 
                                            class="button quantity-btn increment"
                                            @click="increment(egg)"
                                            :disabled="totalSelected >= packSize"
                                        >
                                            <i class="fas fa-plus"></i>
                                        </button>
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
                        <span class="tag is-success is-light">Save 10%</span>
                    </div>
                </div>
                <button 
                    class="button is-primary is-fullwidth is-rounded has-text-weight-bold" 
                    :disabled="!isComplete"
                    @click="goToCheckout"
                >
                    {{ isComplete ? 'Add to Cart' : `Select ${packSize - totalSelected} more` }}
                </button>
            </div>
        </template>

    </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { mapStores } from 'pinia'
import { isInLiff } from '../liff'

// Pack 8 Assets
import pack8Bg from '@/assets/carton/pack8/bg.png'
import hen8_1 from '@/assets/carton/pack8/hen/1.png'
import hen8_2 from '@/assets/carton/pack8/hen/2.png'
import hen8_3 from '@/assets/carton/pack8/hen/3.png'
import hen8_4 from '@/assets/carton/pack8/hen/4.png'
import hen8_5 from '@/assets/carton/pack8/hen/5.png'
import hen8_6 from '@/assets/carton/pack8/hen/6.png'
import hen8_7 from '@/assets/carton/pack8/hen/7.png'
import hen8_8 from '@/assets/carton/pack8/hen/8.png'
import duck8_1 from '@/assets/carton/pack8/duck/1.png'
import duck8_2 from '@/assets/carton/pack8/duck/2.png'
import duck8_3 from '@/assets/carton/pack8/duck/3.png'
import duck8_4 from '@/assets/carton/pack8/duck/4.png'
import duck8_5 from '@/assets/carton/pack8/duck/5.png'
import duck8_6 from '@/assets/carton/pack8/duck/6.png'
import duck8_7 from '@/assets/carton/pack8/duck/7.png'
import duck8_8 from '@/assets/carton/pack8/duck/8.png'

// Pack 12 Assets
import pack12Bg from '@/assets/carton/pack12/bg.png'
import hen12_1 from '@/assets/carton/pack12/hen/1.png'
import hen12_2 from '@/assets/carton/pack12/hen/2.png'
import hen12_3 from '@/assets/carton/pack12/hen/3.png'
import hen12_4 from '@/assets/carton/pack12/hen/4.png'
import hen12_5 from '@/assets/carton/pack12/hen/5.png'
import hen12_6 from '@/assets/carton/pack12/hen/6.png'
import hen12_7 from '@/assets/carton/pack12/hen/7.png'
import hen12_8 from '@/assets/carton/pack12/hen/8.png'
import hen12_9 from '@/assets/carton/pack12/hen/9.png'
import hen12_10 from '@/assets/carton/pack12/hen/10.png'
import hen12_11 from '@/assets/carton/pack12/hen/11.png'
import hen12_12 from '@/assets/carton/pack12/hen/12.png'
import duck12_1 from '@/assets/carton/pack12/duck/1.png'
import duck12_2 from '@/assets/carton/pack12/duck/2.png'
import duck12_3 from '@/assets/carton/pack12/duck/3.png'
import duck12_4 from '@/assets/carton/pack12/duck/4.png'
import duck12_5 from '@/assets/carton/pack12/duck/5.png'
import duck12_6 from '@/assets/carton/pack12/duck/6.png'
import duck12_7 from '@/assets/carton/pack12/duck/7.png'
import duck12_8 from '@/assets/carton/pack12/duck/8.png'
import duck12_9 from '@/assets/carton/pack12/duck/9.png'
import duck12_10 from '@/assets/carton/pack12/duck/10.png'
import duck12_11 from '@/assets/carton/pack12/duck/11.png'
import duck12_12 from '@/assets/carton/pack12/duck/12.png'

import hen_icon from '@/assets/hen_icon.png'
import duck_icon from '@/assets/duck_icon.jpg'

export default {
    data() {
        return {
            pageLoading: true,
            loadedCount: 0,
            isMenuActive: false,
            isLiffView: isInLiff(),
            packSize: 12,
            assets: {
                8: {
                    bg: pack8Bg,
                    hen: [hen8_1, hen8_2, hen8_3, hen8_4, hen8_5, hen8_6, hen8_7, hen8_8],
                    duck: [duck8_1, duck8_2, duck8_3, duck8_4, duck8_5, duck8_6, duck8_7, duck8_8]
                },
                12: {
                    bg: pack12Bg,
                    hen: [hen12_1, hen12_2, hen12_3, hen12_4, hen12_5, hen12_6, hen12_7, hen12_8, hen12_9, hen12_10, hen12_11, hen12_12],
                    duck: [duck12_1, duck12_2, duck12_3, duck12_4, duck12_5, duck12_6, duck12_7, duck12_8, duck12_9, duck12_10, duck12_11, duck12_12]
                }
            },
            selectedEggs: [], // [{ id, type, name, price }]
            eggs: [
                { id: 'hen_fresh', name: 'Fresh Hen Egg', name_th: 'ไข่ไก่สดอย่างดี', type: 'hen', price: 10, image: hen_icon },
                { id: 'duck_fresh', name: 'Fresh Duck Egg', name_th: 'ไข่เป็ดสดอย่างดี', type: 'duck', price: 10, image: duck_icon },
                { id: 'hen_boiled', name: 'Boiled Hen Egg', name_th: 'ไข่ไก่ต้มสดใหม่', type: 'hen', price: 10, image: 'https://cdn-icons-png.flaticon.com/512/3063/3063073.png' },
                { id: 'duck_boiled', name: 'Boiled Duck Egg', name_th: 'ไข่เป็ดต้มสดใหม่', type: 'duck', price: 10, image: 'https://cdn-icons-png.flaticon.com/512/3063/3063073.png' }, 
                { id: 'hen_soft', name: 'Soft Boiled Hen', name_th: 'ไข่ไก่ลวกกึ่งสุก', type: 'hen', price: 10, image: 'https://cdn-icons-png.flaticon.com/512/1581/1581768.png' },
                { id: 'duck_soft', name: 'Soft Boiled Duck', name_th: 'ไข่เป็ดลวกกึ่งสุก', type: 'duck', price: 10, image: 'https://cdn-icons-png.flaticon.com/512/1581/1581768.png' },
                { id: 'century', name: 'Century Egg', name_th: 'ไข่เยี่ยวม้า', type: 'duck', price: 10, image: 'https://cdn-icons-png.flaticon.com/512/9183/9183060.png' },
            ]
        }
    },
    computed: {
        ...mapStores(useAuthStore),
        totalSelected() { return this.selectedEggs.length },
        isComplete() { return this.totalSelected === this.packSize },
        currentBg() { return this.assets[this.packSize].bg },
        currentHenAssets() { return this.assets[this.packSize].hen },
        currentDuckAssets() { return this.assets[this.packSize].duck },
        totalImagesToLoad() {
            return 49;
        },
        loadProgress() {
            return (this.loadedCount / this.totalImagesToLoad) * 100;
        },
        rawPrice() {
            return this.selectedEggs.reduce((total, egg) => total + egg.price, 0);
        },
        finalPrice() {
            const discount = 10;
            const discountAmount = (this.rawPrice * discount) / 100;
            return Math.floor(this.rawPrice - discountAmount);
        }
    },
    methods: {
        toggleMenu() {
            this.isMenuActive = !this.isMenuActive
        },
        async preloadImages() {
            const imageUrls = [
                // Pack 8
                this.assets[8].bg,
                ...this.assets[8].hen,
                ...this.assets[8].duck,
                // Pack 12
                this.assets[12].bg,
                ...this.assets[12].hen,
                ...this.assets[12].duck,
                // Egg icons
                ...this.eggs.map(e => e.image)
            ];

            const promises = imageUrls.map(url => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = url;
                    img.onload = () => {
                        this.loadedCount++;
                        resolve();
                    };
                    img.onerror = () => {
                        this.loadedCount++;
                        resolve();
                    };
                });
            });

            await Promise.all(promises);
            setTimeout(() => {
                this.pageLoading = false;
            }, 500);
        },
        setPackSize(size) {
            this.packSize = size;
            if (this.selectedEggs.length > size) {
                this.selectedEggs = this.selectedEggs.slice(0, size);
            }
        },
        getEggOverlay(egg, index) {
            const assets = egg.type === 'hen' ? this.currentHenAssets : this.currentDuckAssets;
            return assets[index];
        },
        getItemCount(id) {
            return this.selectedEggs.filter(e => e.id === id).length;
        },
        increment(egg) {
            if (this.totalSelected < this.packSize) {
                this.selectedEggs.push({ ...egg });
            }
        },
        decrement(id) {
            const index = [...this.selectedEggs].reverse().findIndex(e => e.id === id);
            if (index !== -1) {
                const actualIndex = this.selectedEggs.length - 1 - index;
                this.selectedEggs.splice(actualIndex, 1);
            }
        },
        goToCheckout() {
            if (!this.isComplete) return;
            this.$router.push({
                name: 'subscription',
                query: {
                    pack: `Custom Pack (${this.packSize})`,
                    cycle: 'weekly',
                    price: this.finalPrice
                }
            })
        }
    },
    mounted() {
        this.preloadImages();
    }
}
</script>

<style scoped>
.custom-pack-page {
    background-color: #fcfcfc;
    min-height: 100vh;
}

/* Floating Burger Menu */
.floating-burger {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 40;
    background: transparent;
    width: 45px;
    height: 45px;
}

.floating-burger span {
    width: 20px;
    height: 2px;
}

/* Menu Overlay */
.menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    background: rgba(0,0,0,0.5);
    display: none;
}

.menu-overlay.is-active {
    display: block;
}

.menu-content {
    width: 280px;
    height: 100%;
    position: absolute;
    right: 0;
    top: 0;
    box-shadow: -2px 0 15px rgba(0,0,0,0.1);
}

.menu-item {
    font-size: 1.1rem;
    color: #4a4a4a;
    font-weight: 500;
}

.border-bottom {
    border-bottom: 1px solid #f0f0f0;
}

.loader-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
}

.spinning-egg {
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.1); }
    100% { transform: rotate(360deg) scale(1); }
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

.carton-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 auto;
    width: 100%;
}

.carton-relative-container {
    position: relative;
    width: 100%;
}

.carton-img { 
    width: 100%; 
}
.carton-img img {
    width: 100%;
    height: auto;
    display: block;
}

.carton-overlay-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    pointer-events: none;
}

/* Fade animation for adding/removing eggs */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.egg-card {
    border-radius: 20px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
    border: 1px solid #f5f5f5;
    overflow: hidden;
}

.image-container {
    position: relative;
}

.quantity-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #ff3860;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 2;
}

.quantity-btn {
    border: none;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.quantity-btn.increment {
    background-color: #3273dc; /* Blue */
    color: white;
    border-radius: 10px;
}

.quantity-btn.decrement {
    background-color: #ff9f5a; /* Orange */
    color: white;
    border-radius: 10px;
}

.quantity-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.h-100 {
    height: 100%;
}
</style>
