<template>
    <section class="hero-banner">
        <div class="video-container">
            <video 
                autoplay 
                loop 
                muted 
                playsinline 
                webkit-playsinline
                class="hero-video"
            >
                <source src="../../assets/egg.mp4" type="video/mp4" />
            </video>
            <div class="overlay"></div>
        </div>
    </section>
</template>

<style scoped>
.hero-banner {
    position: relative;
    width: 100%;
    /* Use dvh for mobile browsers handling address bar, fallback to vh */
    height: 100vh;
    height: 100dvh; 
    overflow: hidden;
    background-color: #000;
}

.video-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.hero-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block; /* Removes potential bottom space */
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.2);
    pointer-events: none;
}
</style>
