<template>
    <section class="section is-medium has-background-white-ter">
        <div class="container">
            <div class="has-text-centered mb-6">
                <h2 class="title is-2">Happy Customers</h2>
                <p class="subtitle is-5 has-text-grey">
                    Join hundreds of families enjoying farm-fresh eggs
                </p>
            </div>

            <div class="columns is-variable is-6">
                <div class="column is-one-third" v-for="(review, index) in reviews" :key="index">
                    <div class="card testimonial-card">
                        <div class="card-content">
                            <div class="content has-text-centered">
                                <!-- Quote Icon -->
                                <span class="icon is-large has-text-primary mb-3">
                                    <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"
                                        />
                                    </svg>
                                </span>

                                <p class="is-size-5 is-italic mb-5">"{{ review.text }}"</p>

                                <div class="media">
                                    <div class="media-content has-text-centered">
                                        <p class="title is-5 mb-1">{{ review.name }}</p>
                                        <div class="rating has-text-warning">★★★★★</div>
                                    </div>
                                </div>
                            </div>
                        </div>
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
            reviews: [
                {
                    name: 'Sarah J.',
                    text: "The freshest eggs I've ever tasted! The yolk is so orange and creamy. Delivery is always on time, right to my condo.",
                },
                {
                    name: 'Mike T.',
                    text: 'Love the weekly subscription. No more running out of eggs for breakfast before work. Highly recommend for busy people!',
                },
                {
                    name: 'Emily R.',
                    text: 'Packaging is eco-friendly which I love. The eggs are huge and delicious. Great service and very polite delivery staff.',
                },
            ],
        }
    },
}
</script>

<style scoped>
.testimonial-card {
    height: 100%;
    border-radius: 12px;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease;
    border: none;
}

.testimonial-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.rating {
    letter-spacing: 2px;
    font-size: 1.2rem;
}
</style>
