<template>
    <div class="wrapper">
        <!-- Header is now always visible for navigation, except for Custom Pack page -->
        <Header v-if="!isCustomPackPage" :isTransparent="isHomePage && isHeaderTransparent" />

        <!-- Apply fixed header padding class permanently, except for Custom Pack page and Home Page -->
        <main class="main-content" :class="{ 'has-fixed-header': !isCustomPackPage && !isHomePage }">
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
    data() {
        return {
            isHeaderTransparent: true
        }
    },
    computed: {
        // We still need this to map the store
        ...mapStores(useAuthStore),
        isHomePage() {
            return this.$route.name === 'home'
        },
        isCustomPackPage() {
            return this.$route.name === 'custom-pack'
        }
    },
    watch: {
        // Correctly handle state when navigating between pages
        $route(to) {
            if (to.name === 'home') {
                this.handleScroll();
            } else {
                this.isHeaderTransparent = false;
            }
        }
    },
    methods: {
        handleScroll() {
            if (this.$route.name === 'home') {
                this.isHeaderTransparent = window.scrollY < 500;
            } else {
                this.isHeaderTransparent = false;
            }
        }
    },
    mounted() {
        // We still need to initialize auth and attempt LIFF login
        this.authStore.init()
        if (isInLiff()) {
            // Logic for LIFF initialization if needed
        }
        window.addEventListener('scroll', this.handleScroll);
        // Ensure initial state is set correctly on mount
        setTimeout(() => {
            this.handleScroll();
        }, 100);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }
}
</script>

<style>
/* Global Styles */
html,
body {
    height: 100%;
    margin: 0;
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
