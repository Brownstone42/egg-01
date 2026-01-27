<template>
    <div class="wrapper">
        <!-- Header is now always visible for navigation -->
        <Header />

        <!-- Apply fixed header padding class permanently -->
        <main class="main-content has-fixed-header">
            <RouterView />
        </main>

        <!-- Footer is now always visible -->
        <Footer />
    </div>
</template>

<script>
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import { useAuthStore } from '@/stores/auth'
import { isInLiff } from './liff'
import { mapStores } from 'pinia'

export default {
    name: 'App',
    components: { Header, Footer, RouterView },
    computed: {
        // We still need this to map the store
        ...mapStores(useAuthStore),
    },
    mounted() {
        // We still need to initialize auth and attempt LIFF login
        this.authStore.init()

        // The logic to decide if login is needed is inside the store now.
        if (isInLiff()) {
            console.log('App.vue: mounted() - In LIFF, attempting auto-login...')
            this.authStore.loginWithLiff()
        }
    },
}
</script>

<style>
/* No more debug box styles */

.wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.main-content {
    flex: 1;
}

/* This class was conditional, now it's permanent */
.main-content.has-fixed-header {
    /* Adjust this value based on your actual header height */
    padding-top: 56px;
}
</style>
