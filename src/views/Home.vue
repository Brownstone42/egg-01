<template>
    <div>
        <HomeVideoBanner />
        <HomeSubscription />
        <HomeTestimonials />
    </div>
</template>

<script>
import HomeVideoBanner from '../components/Home/VideoBanner.vue'
import HomeSubscription from '../components/Home/Subscription.vue'
import HomeTestimonials from '../components/Home/Testimonials.vue'

export default {
    components: {
        HomeVideoBanner,
        HomeSubscription,
        HomeTestimonials,
    },
}
</script>
