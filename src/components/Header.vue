<template>
  <nav class="navbar is-fixed-top" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link to="/" class="navbar-item">
        <h1 class="title">Egg Subscription</h1>
      </router-link>

      <a role="button" class="navbar-burger" :class="{ 'is-active': isMenuActive }" @click="toggleMenu" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbarBasicExample" class="navbar-menu" :class="{ 'is-active': isMenuActive }">
      <div class="navbar-end">
        <div class="navbar-item" v-if="!authStore.user">
          <div class="buttons">
            <a class="button is-primary" @click="authStore.loginWithGoogle">
              <strong>Login</strong>
            </a>
          </div>
        </div>

        <template v-if="authStore.user">
          <div class="navbar-item is-flex is-align-items-center">
            <figure class="image is-24x24 mr-2">
              <img class="is-rounded" :src="authStore.user.photoURL" alt="User avatar">
            </figure>
            <span>{{ authStore.user.displayName }}</span>
          </div>
          <div class="navbar-item">
            <div class="buttons">
              <a class="button is-light" @click="authStore.logout">
                Logout
              </a>
            </div>
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
import { useAuthStore } from '../stores/auth';

export default {
  setup() {
    const authStore = useAuthStore();
    authStore.init(); // Initialize listener

    return { authStore };
  },
  data() {
    return {
      isMenuActive: false,
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuActive = !this.isMenuActive
    }
  }
}
</script>
