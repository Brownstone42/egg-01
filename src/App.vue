<template>
  <Header />
  <div class="main-content">
    <router-view />
  </div>
  <Footer />
</template>

<script>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

export default {
  components: {
    Header,
    Footer
  }
}
</script>

<style scoped>
.main-content {
  padding-top: 52px; /* Same as navbar height */
}
</style>
