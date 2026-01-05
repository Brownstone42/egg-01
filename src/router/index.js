import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Subscription from '../views/Subscription.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
        },
        {
            path: '/subscription',
            name: 'subscription',
            component: Subscription,
        },
    ],
})

export default router
