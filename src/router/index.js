import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Subscription from '../views/Subscription.vue'
import Success from '../views/Success.vue'
import Dashboard from '../views/Dashboard.vue'
import LineAuthCallback from '../views/LineAuthCallback.vue' // Import the new component

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
            path: '/line-callback', // <-- CHANGED TO SIMPLER URL
            name: 'line-auth-callback',
            component: LineAuthCallback, 
        },
    ],
})

export default router
