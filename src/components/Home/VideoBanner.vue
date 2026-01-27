<template>
    <section class="hero is-fullheight-with-navbar hero-banner">
        <video autoplay loop muted playsinline class="hero-video">
            <source src="../../assets/egg.mp4" type="video/mp4" />
        </video>
    </section>
</template>

<style scoped>
.hero-banner {
    position: relative;
    overflow: hidden;
    background-color: black;
}
.hero-video {
    position: absolute;
    top: 50%;
    left: 50%;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    transform: translateX(-50%) translateY(-50%);
    z-index: 0;
    object-fit: cover;
}
</style>
