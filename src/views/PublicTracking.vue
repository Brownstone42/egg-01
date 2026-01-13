<template>
  <div class="public-tracking-page section">
    <div class="container">
      <h1 class="title">Track Your Order</h1>
      <p class="subtitle">Enter your Order ID to see the status of your subscription.</p>

      <div class="field has-addons">
        <div class="control is-expanded">
          <input
            v-model="searchOrderId"
            class="input is-medium"
            type="text"
            placeholder="Enter your Order ID (e.g., ONL-172...)"
            @keyup.enter="searchOrder"
          />
        </div>
        <div class="control">
          <button
            class="button is-primary is-medium"
            :class="{ 'is-loading': isLoading }"
            @click="searchOrder"
          >
            Search
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="notification is-light mt-5">
        <p>Searching for your order...</p>
      </div>

      <div v-if="error" class="notification is-danger mt-5">
        <p>{{ error }}</p>
      </div>

      <!-- Order Details Component -->
      <div v-if="orderData" class="mt-5">
        <OrderDetailDisplay :order="orderData" />
      </div>

      <div v-if="searchAttempted && !orderData && !isLoading && !error" class="notification is-warning mt-5">
        <p>No order found with the ID '{{ lastSearchedId }}'. Please check the ID and try again.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import OrderDetailDisplay from '@/components/OrderDetailDisplay.vue';

export default {
  name: 'PublicTracking',
  components: {
    OrderDetailDisplay,
  },
  data() {
    return {
      searchOrderId: '',
      lastSearchedId: '',
      orderData: null,
      isLoading: false,
      error: null,
      searchAttempted: false,
    };
  },
  mounted() {
    // Check for orderId in the query string when the page loads
    const orderIdFromUrl = this.$route.query.orderId;
    if (orderIdFromUrl) {
      this.searchOrderId = orderIdFromUrl;
      this.searchOrder();
    }
  },
  methods: {
    async searchOrder() {
      if (!this.searchOrderId.trim()) {
        this.error = 'Please enter an Order ID.';
        this.orderData = null;
        return;
      }

      this.isLoading = true;
      this.error = null;
      this.orderData = null;
      this.searchAttempted = true;
      this.lastSearchedId = this.searchOrderId.trim();

      try {
        const orderRef = doc(db, 'orders', this.lastSearchedId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          // Include the ID in the data passed to the component
          this.orderData = { id: orderSnap.id, ...orderSnap.data() };
        } else {
          console.log('No such document!');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        this.error = 'There was an error fetching your order. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.public-tracking-page {
  padding-top: 40px;
  padding-bottom: 40px;
}
.container {
    max-width: 768px;
}
</style>
