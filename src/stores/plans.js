import { defineStore } from 'pinia'

export const usePlansStore = defineStore('plans', {
    state: () => ({
        plans: [
            {
                id: 'solo',
                name: 'Plan 1 (Solo)',
                description: 'For individuals',
                priceWeekly: 119,
                priceMonthly: 450,
                features: [
                    '10 Premium Eggs / delivery',
                    'Farm to Table in 24 hrs',
                    'Antibiotic Free',
                    'Sustainable Packaging',
                    'Free Delivery',
                    'Cancel Anytime',
                ],
            },
            {
                id: 'couple',
                name: 'Plan 2 (Couple)',
                description: 'Best Value',
                priceWeekly: 199,
                priceMonthly: 750,
                features: [
                    '20 Premium Eggs / delivery',
                    'Farm to Table in 24 hrs',
                    'Antibiotic Free',
                    'Sustainable Packaging',
                    'Priority Delivery',
                    'Cancel Anytime',
                ],
            },
            {
                id: 'family',
                name: 'Plan 3 (Family)',
                description: 'For big families',
                priceWeekly: 289,
                priceMonthly: 1100,
                features: [
                    '30 Premium Eggs / delivery',
                    'Farm to Table in 24 hrs',
                    'Antibiotic Free',
                    'Sustainable Packaging',
                    'Priority Delivery + Gifts',
                    'Cancel Anytime',
                ],
            },
        ]
    })
})
