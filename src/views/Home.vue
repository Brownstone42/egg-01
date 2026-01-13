<template>
    <section class="hero is-large hero-banner">
        <div class="hero-body has-text-centered">
            <h1 class="title has-text-white">Fresh Eggs, Delivered Weekly.</h1>
            <h2 class="subtitle has-text-white">
                The best quality eggs from local farms, right to your doorstep.
            </h2>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <h1 class="title has-text-centered">Choose Your Egg Subscription</h1>
            <div class="columns is-centered">
                <div class="column is-one-third" v-for="pack in subscriptionPacks" :key="pack.name">
                    <div class="box has-text-centered">
                        <h2 class="subtitle">{{ pack.name }}</h2>
                        <p class="is-size-4 has-text-weight-bold">${{ pack.price }}</p>
                        <p class="is-size-7 has-text-grey">Billed weekly</p>
                        <button
                            class="button is-primary is-fullwidth mt-4"
                            @click="subscribe(pack.name)"
                        >
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    data() {
        return {
            subscriptionPacks: [
                { name: '10 Eggs / Week', price: 10 },
                { name: '20 Eggs / Week', price: 18 },
                { name: '30 Eggs / Week', price: 25 },
            ],
        }
    },
    methods: {
        subscribe(packName) {
            this.$router.push({ name: 'subscription', query: { pack: packName } })
        },
    },
}
</script>

<style scoped>
.hero-banner {
    background-image:
        linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
        url('https://images.unsplash.com/photo-1627461245221-7341b6fb2b76?q=80&w=1920&auto=format&fit=crop');
    background-position: center;
    background-size: cover;
}

.has-text-white {
    color: #fff;
}
</style>
