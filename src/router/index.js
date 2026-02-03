import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Subscription from '../views/Subscription.vue'
import CustomPack from '../views/CustomPack.vue'
import Success from '../views/Success.vue'
import Dashboard from '../views/Dashboard.vue'
import LineAuthCallback from '../views/LineAuthCallback.vue'
import PublicTracking from '../views/PublicTracking.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior(to, from, savedPosition) {
        // Always scroll to top
        return { top: 0 }
    },
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
        {
            path: '/custom-pack',
            name: 'custom-pack',
            component: CustomPack,
        },
        {
            path: '/success',
            name: 'success',
            component: Success,
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: Dashboard,
        },
        {
            path: '/line-callback',
            name: 'line-auth-callback',
            component: LineAuthCallback,
        },
        {
            path: '/tracking',
            name: 'tracking',
            component: PublicTracking,
        },
    ],
})

export default router
