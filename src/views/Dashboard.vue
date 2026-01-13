<template>
    <div class="container py-5">
        <h1 class="title is-3 mb-5">Dashboard</h1>

        <div class="columns">
            <!-- Sidebar / Tabs -->
            <div class="column is-3">
                <aside class="menu">
                    <p class="menu-label">General</p>
                    <ul class="menu-list">
                        <li>
                            <a
                                :class="{ 'is-active': activeTab === 'tracking' }"
                                @click="activeTab = 'tracking'"
                            >
                                <span class="icon-text">
                                    <span class="icon"><i class="fas fa-box-open"></i></span>
                                    <span>My Subscription</span>
                                </span>
                            </a>
                        </li>
                        <li>
                            <a
                                :class="{ 'is-active': activeTab === 'profile' }"
                                @click="activeTab = 'profile'"
                            >
                                <span class="icon-text">
                                    <span class="icon"><i class="fas fa-user"></i></span>
                                    <span>Update My Info</span>
                                </span>
                            </a>
                        </li>
                    </ul>
                </aside>
            </div>

            <!-- Content -->
            <div class="column is-9">
                <!-- Tab 1: Tracking Subscription -->
                <SubscriptionTracking v-if="activeTab === 'tracking'" :user="user" />

                <!-- Tab 2: Update My Info (Account Linking) -->
                <UpdateMyInfo v-if="activeTab === 'profile'" :user="user" />
            </div>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { mapState, mapActions } from 'pinia'
import SubscriptionTracking from '@/components/Dashboard/SubscriptionTracking.vue'
import UpdateMyInfo from '@/components/Dashboard/UpdateMyInfo.vue'

export default {
    components: {
        SubscriptionTracking,
        UpdateMyInfo,
    },
    data() {
        return {
            activeTab: 'tracking',
        }
    },
    computed: {
        ...mapState(useAuthStore, ['user']),
    },
    methods: {
        ...mapActions(useAuthStore, ['init']),
    },
    mounted() {
        // init is called in App.vue or Header mostly, but safe to ensure here or rely on store state persistence
    },
}
</script>
