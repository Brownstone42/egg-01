<template>
    <section class="section subscription-section" id="plans">
        <div class="container">
            <div class="header-content has-text-centered mb-6">
                <h2 class="title is-2">Select a Plan</h2>
                <p class="subtitle is-5 has-text-grey-light">
                    Choose the perfect egg supply for your needs
                </p>

                <!-- Billing Toggle -->
                <div class="billing-toggle mt-4">
                    <span
                        class="toggle-item"
                        :class="{ 'is-active': billingCycle === 'weekly' }"
                        @click="billingCycle = 'weekly'"
                    >
                        Weekly
                    </span>
                    <span
                        class="toggle-item"
                        :class="{ 'is-active': billingCycle === 'monthly' }"
                        @click="billingCycle = 'monthly'"
                    >
                        Monthly
                        <span class="tag is-warning is-light is-rounded ml-1 is-size-7">-10%</span>
                    </span>
                </div>
            </div>

            <!-- Standard Plans -->
            <div class="columns is-centered is-variable is-4 mb-6">
                <div class="column is-one-third" v-for="(plan, index) in plansStore.plans" :key="plan.id">
                    <!-- Card Component -->
                    <div
                        class="card plan-card"
                        :class="{
                            'is-featured': index === 1,
                            'is-mobile-expanded': activeMobileIndex === index,
                        }"
                        @click="setActiveMobile(index)"
                    >
                        <div class="card-content has-text-centered">
                            <!-- Plan Header -->
                            <h3 class="title is-4 mb-2">{{ plan.name }}</h3>
                            <p class="subtitle is-6 has-text-grey">{{ plan.description }}</p>

                            <!-- Price Display -->
                            <div class="price-block my-4">
                                <span class="currency">฿</span>
                                <span class="amount">{{
                                    billingCycle === 'weekly' ? plan.priceWeekly : plan.priceMonthly
                                }}</span>
                                <span class="period has-text-grey"
                                    >/ {{ billingCycle === 'weekly' ? 'week' : 'month' }}</span
                                >
                            </div>

                            <!-- Features List (Hidden on mobile unless active) -->
                            <div class="features-list has-text-left mt-4">
                                <ul class="feature-items">
                                    <li
                                        v-for="(feature, fIndex) in plan.features"
                                        :key="fIndex"
                                        class="mb-2"
                                    >
                                        <span class="icon has-text-success mr-2">
                                            <i class="fas fa-check">✓</i>
                                        </span>
                                        {{ feature }}
                                    </li>
                                </ul>
                            </div>

                            <!-- Action Button -->
                            <button
                                class="button is-primary is-fullwidth mt-5 is-medium is-rounded"
                                @click.stop="subscribe(plan)"
                            >
                                Buy me
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Divider with OR -->
            <div class="is-relative mb-6">
                <div class="divider-line"></div>
                <div class="or-text-container has-text-centered">
                    <span class="or-text has-background-light px-4 py-2 has-text-weight-bold has-text-grey">OR</span>
                </div>
            </div>

            <!-- Custom Pack Banner/Link (Moved to bottom) -->
            <div class="columns is-centered">
                <div class="column is-8">
                    <div class="box custom-pack-banner has-background-white has-text-centered is-clickable" @click="goToCustomPack">
                        <div class="columns is-vcentered">
                            <div class="column">
                                <span class="icon is-large has-text-primary mb-2">
                                    <i class="fas fa-magic fa-2x"></i>
                                </span>
                                <h3 class="title is-4 mb-1">Create Your Own Mix!</h3>
                                <p class="subtitle is-6">Select specific eggs and quantity. Get exactly what you need.</p>
                            </div>
                            <div class="column is-narrow">
                                <button class="button is-primary is-rounded is-outlined">
                                    Customize Now <i class="fas fa-arrow-right ml-2"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import { usePlansStore } from '../../stores/plans'

export default {
    setup() {
        const plansStore = usePlansStore()
        return { plansStore }
    },
    data() {
        return {
            billingCycle: 'weekly', // 'weekly' or 'monthly'
            activeMobileIndex: 1, // Default to middle plan (index 1) on mobile
        }
    },
    methods: {
        subscribe(plan) {
            // Pass both pack name and chosen cycle
            this.$router.push({
                name: 'subscription',
                query: {
                    pack: plan.name,
                    cycle: this.billingCycle,
                    price: this.billingCycle === 'weekly' ? plan.priceWeekly : plan.priceMonthly,
                },
            })
        },
        setActiveMobile(index) {
            // Only relevant for mobile UX to expand/collapse
            this.activeMobileIndex = index
        },
        goToCustomPack() {
            this.$router.push({ name: 'custom-pack' })
        }
    },
}
</script>

<style scoped>
.subscription-section {
    background-color: #f9f9f9;
}

/* Billing Toggle Styling */
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

/* Card Styling */
.plan-card {
    border-radius: 16px;
    border: 2px solid transparent;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    height: 100%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.plan-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

/* Featured/Middle Card Styling */
.plan-card.is-featured {
    border-color: #48c774; /* Primary color border */
    position: relative;
    z-index: 1;
}

/* Price Typography */
.price-block .currency {
    font-size: 1.5rem;
    vertical-align: top;
    font-weight: bold;
}

.price-block .amount {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1;
    color: #333;
}

.price-block .period {
    font-size: 1rem;
    font-weight: 500;
}

/* Feature List Styling */
.feature-items li {
    font-size: 0.95rem;
    color: #555;
    display: flex;
    align-items: center;
}

/* Divider Styling */
.divider-line {
    border-top: 1px solid #dbdbdb;
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 0;
}

.or-text-container {
    position: relative;
    z-index: 1;
}

.or-text {
    font-size: 1.2rem;
    color: #888;
    background-color: #f9f9f9; /* Match section bg */
    border-radius: 50px;
    border: 1px solid #dbdbdb;
}

/* Custom Pack Banner */
.custom-pack-banner {
    border: 2px dashed #48c774;
    border-radius: 16px;
    transition: all 0.2s;
}
.custom-pack-banner:hover {
    background-color: #fff;
    border-style: solid;
    box-shadow: 0 4px 15px rgba(72, 199, 116, 0.2);
    transform: scale(1.02);
}
.is-clickable {
    cursor: pointer;
}

/* --- Mobile Specific Logic --- */
@media screen and (max-width: 768px) {
    .columns {
        display: flex;
        flex-direction: column;
    }

    .column {
        padding-bottom: 0.5rem;
    }

    .plan-card {
        cursor: pointer; /* Indicate clickable on mobile */
    }

    /* By default on mobile, hide details and button */
    .features-list,
    .plan-card button {
        display: none;
    }

    /* Except for the active/expanded one */
    .plan-card.is-mobile-expanded .features-list,
    .plan-card.is-mobile-expanded button {
        display: block;
        animation: fadeIn 0.4s ease;
    }

    .plan-card.is-mobile-expanded {
        border-color: #48c774;
        background-color: white;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
}

/* --- Desktop Specific Override --- */
@media screen and (min-width: 769px) {
    /* Always show features on desktop regardless of active state */
    .features-list,
    .plan-card button {
        display: block !important;
    }

    /* Center card slightly larger visually on desktop */
    .plan-card.is-featured {
        transform: scale(1.05);
    }
    .plan-card.is-featured:hover {
        transform: scale(1.08);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
