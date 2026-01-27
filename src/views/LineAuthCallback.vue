<template>
    <div class="container has-text-centered">
        <div v-if="isLoading" class="mt-6">
            <p class="is-size-4">Logging you in with LINE...</p>
            <progress class="progress is-large is-info mt-4" max="100">60%</progress>
        </div>
        <div v-if="error" class="notification is-danger is-light mt-6">
            <h2 class="is-size-4">Login Failed</h2>
            <p>{{ error }}</p>
            <router-link to="/" class="button is-primary mt-4">Go to Homepage</router-link>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { mapStores } from 'pinia'

export default {
    data() {
        return {
            isLoading: true,
            error: null,
        }
    },
    computed: {
        ...mapStores(useAuthStore),
    },
    async created() {
        const query = this.$route.query

        if (query.error) {
            this.error = `${query.error}: ${query.error_description}`
            this.isLoading = false
            return
        }

        if (!query.code || !query.state) {
            this.error = 'Invalid callback from LINE. Missing code or state.'
            this.isLoading = false
            return
        }

        try {
            await this.authStore.finishDesktopLineLogin(query.code, query.state)
            // On successful login, the authStore's onAuthStateChanged listener
            // will set the user, and we can navigate to the dashboard.
            this.$router.push('/dashboard')
        } catch (err) {
            this.error = `An error occurred during login: ${err.message}`
            this.isLoading = false
        }
    },
}
</script>

<style scoped>
.container {
    padding-top: 5rem;
}
</style>
