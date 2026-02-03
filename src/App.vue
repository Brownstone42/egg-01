<template>
    <div class="wrapper">
        <!-- Header is now always visible for navigation -->
        <Header />

        <!-- Apply fixed header padding class permanently -->
        <main class="main-content has-fixed-header">
            <RouterView />
        </main>

        <!-- Footer is only visible on Home page -->
        <Footer v-if="isHomePage" />
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
        isHomePage() {
            return this.$route.name === 'home'
        }
    },
    mounted() {
        // We still need to initialize auth and attempt LIFF login
        this.authStore.init()
        if (isInLiff()) {
            // Logic for LIFF initialization if needed
        }
    }
}
</script>

<style>
/* Global Styles */
html,
body {
    height: 100%;
    margin: 0;
    background-color: #f9f9f9;
}

.wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.main-content {
    flex: 1;
}

/* Add padding to prevent content from being hidden behind fixed header */
.has-fixed-header {
    padding-top: 3.25rem; /* Adjust based on your header height */
}
</style>
