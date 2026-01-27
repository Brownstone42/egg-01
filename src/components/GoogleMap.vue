<template>
    <div class="map-layout">
        <!-- Search Box (Placed above map) -->
        <div class="search-container">
            <input
                ref="searchInput"
                class="input is-rounded search-input"
                type="text"
                placeholder="Search for a location..."
            />
        </div>

        <!-- Map Container -->
        <div class="map-container">
            <GMap
                ref="mapRef"
                :api-key="apiKey"
                class="google-map"
                :center="center"
                :zoom="15"
                :disable-default-ui="true"
                @center_changed="onCenterChanged"
                @idle="onIdle"
            >
            </GMap>

            <!-- Center Pin -->
            <div class="center-pin">
                <span class="icon is-large has-text-danger">
                    <i class="fas fa-map-marker-alt fa-3x"></i>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import { GoogleMap as GMap } from 'vue3-google-map'

export default {
    name: 'GoogleMapPicker',
    components: {
        GMap,
    },
    props: {
        initialLocation: {
            type: Object,
            default: null,
        },
    },
    emits: ['location-selected'],
    data() {
        return {
            apiKey: 'AIzaSyA5kC8KaF_zYamu764W4vHrsx0vFqnV-BU',
            center: this.initialLocation || { lat: 13.7563, lng: 100.5018 }, // Default Bangkok
            geocoder: null,
            isDragging: false,
        }
    },
    mounted() {
        this.waitForGoogleMaps()
    },
    methods: {
        waitForGoogleMaps() {
            const interval = setInterval(() => {
                if (window.google && window.google.maps) {
                    clearInterval(interval)
                    this.initServices()
                }
            }, 100)
        },
        initServices() {
            this.geocoder = new google.maps.Geocoder()
            const input = this.$refs.searchInput
            const searchBox = new google.maps.places.SearchBox(input)

            searchBox.addListener('places_changed', () => {
                const places = searchBox.getPlaces()
                if (places.length == 0) return

                const place = places[0]
                if (!place.geometry || !place.geometry.location) return

                if (this.$refs.mapRef && this.$refs.mapRef.map) {
                    const map = this.$refs.mapRef.map
                    if (place.geometry.viewport) {
                        map.fitBounds(place.geometry.viewport)
                    } else {
                        map.setCenter(place.geometry.location)
                        map.setZoom(17)
                    }
                }
            })

            // เพิ่มบรรทัดนี้: ส่งค่า Location เริ่มต้นออกไปทันทีที่โหลดเสร็จ
            this.updateLocationInfo(this.center.lat, this.center.lng)
        },
        onCenterChanged() {
            this.isDragging = true
        },
        onIdle() {
            this.isDragging = false
            if (this.$refs.mapRef && this.$refs.mapRef.map) {
                const map = this.$refs.mapRef.map
                const center = map.getCenter()
                const lat = center.lat()
                const lng = center.lng()

                this.updateLocationInfo(lat, lng)
            }
        },
        updateLocationInfo(lat, lng) {
            if (!this.geocoder) return

            this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const address = results[0].formatted_address
                    this.$emit('location-selected', { lat, lng, address })
                } else {
                    this.$emit('location-selected', {
                        lat,
                        lng,
                        address: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`,
                    })
                }
            })
        },
    },
}
</script>

<style scoped>
.map-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: #fff;
}

.search-container {
    padding: 10px 0;
    display: flex;
    justify-content: center;
    background-color: #fff;
    z-index: 2;
}

.search-input {
    width: 90%; /* ไม่เต็มจอ ตามที่ขอ */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    border-color: #dbdbdb;
}

.map-container {
    position: relative;
    flex-grow: 1;
    overflow: hidden;
}

.google-map {
    width: 100%;
    height: 100%;
}

.center-pin {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -100%);
    z-index: 5;
    pointer-events: none;
    margin-top: 18px;
}
</style>
