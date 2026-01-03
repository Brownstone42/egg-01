<template>
  <section class="hero is-large hero-banner">
    <div class="hero-body">
      <div class="container has-text-centered">
        <h1 class="title has-text-white">
          Fresh Eggs, Delivered Weekly.
        </h1>
        <h2 class="subtitle has-text-white">
          The best quality eggs from local farms, right to your doorstep.
        </h2>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <h1 class="title has-text-centered">Choose Your Egg Subscription</h1>
      <div class="columns is-centered">
        <div class="column is-one-third">
          <div class="box has-text-centered">
            <h2 class="subtitle">10 Eggs / Week</h2>
            <p class="is-size-4 has-text-weight-bold">$10</p>
            <p class="is-size-7 has-text-grey">Billed weekly</p>
            <button class="button is-primary is-fullwidth mt-4">Subscribe</button>
          </div>
        </div>
        <div class="column is-one-third">
          <div class="box has-text-centered">
            <h2 class="subtitle">20 Eggs / Week</h2>
            <p class="is-size-4 has-text-weight-bold">$18</p>
            <p class="is-size-7 has-text-grey">Billed weekly</p>
            <button class="button is-primary is-fullwidth mt-4">Subscribe</button>
          </div>
        </div>
        <div class="column is-one-third">
          <div class="box has-text-centered">
            <h2 class="subtitle">30 Eggs / Week</h2>
            <p class="is-size-4 has-text-weight-bold">$25</p>
            <p class="is-size-7 has-text-grey">Billed weekly</p>
            <button class="button is-primary is-fullwidth mt-4">Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-banner {
  background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1627461245221-7341b6fb2b76?q=80&w=1920&auto=format&fit=crop');
  background-position: center;
  background-size: cover;
}

.has-text-white {
    color: #fff;
}
</style>
