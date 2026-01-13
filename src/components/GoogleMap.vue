<template>
    <div class="field">
        <label class="label">Delivery Address</label>

        <!-- Search Box -->
        <div class="control mb-3">
            <input
                ref="searchInput"
                class="input"
                type="text"
                placeholder="Search for a location..."
            />
        </div>

        <!-- Map Container -->
        <div class="map-container mb-3" style="position: relative; height: 400px">
            <GMap
                ref="mapRef"
                :api-key="apiKey"
                style="width: 100%; height: 100%"
                :center="center"
                :zoom="15"
                :disable-default-ui="false"
                @center_changed="onCenterChanged"
                @idle="onIdle"
            >
                <!-- เราไม่ใช้ Marker ปกติ แต่จะใช้หมุดลอยอยู่ตรงกลาง (Fixed Center Pin) -->
            </GMap>

            <!-- หมุดกลางจอ (Center Pin) -->
            <div class="center-marker">
                <span class="icon is-large has-text-danger">
                    <i class="fas fa-map-marker-alt fa-3x"></i>
                </span>
            </div>
        </div>

        <!-- Address Output (Read-only or editable) -->
        <div class="control">
            <input
                class="input"
                :class="{ 'is-danger': error }"
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
                type="text"
                placeholder="Address will appear here..."
                readonly
            />
        </div>
        <p v-if="error" class="help is-danger">Please select a valid address.</p>
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
        modelValue: {
            type: String,
            default: '',
        },
        error: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:modelValue', 'update:coordinates'],
    data() {
        return {
            apiKey: 'AIzaSyA5kC8KaF_zYamu764W4vHrsx0vFqnV-BU',
            center: { lat: 13.7563, lng: 100.5018 }, // Default Bangkok
            currentCenter: { lat: 13.7563, lng: 100.5018 },
        }
    },
    methods: {
        onCenterChanged() {
            const mapInstance = this.$refs.mapRef?.map
            if (mapInstance) {
                const c = mapInstance.getCenter()
                this.currentCenter = { lat: c.lat(), lng: c.lng() }
            }
        },
        async onIdle() {
            const mapInstance = this.$refs.mapRef?.map
            if (!mapInstance) return

            // Update final coordinates to parent
            this.$emit('update:coordinates', this.currentCenter)

            // Reverse Geocoding
            try {
                if (window.google && window.google.maps) {
                    const geocoder = new google.maps.Geocoder()
                    const response = await geocoder.geocode({ location: this.currentCenter })

                    if (response.results[0]) {
                        const address = response.results[0].formatted_address
                        this.$emit('update:modelValue', address)
                    }
                }
            } catch (e) {
                console.error('Geocoder failed:', e)
            }
        },
        initAutocomplete() {
            if (!window.google || !window.google.maps || !window.google.maps.places) {
                setTimeout(this.initAutocomplete, 500)
                return
            }

            const searchInput = this.$refs.searchInput
            const autocomplete = new google.maps.places.Autocomplete(searchInput, {
                fields: ['geometry', 'formatted_address'],
            })

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace()

                if (!place.geometry || !place.geometry.location) {
                    return // User entered name but didn't select suggestion
                }

                const mapInstance = this.$refs.mapRef.map
                // ย้ายแผนที่ไปจุดที่เลือก
                if (place.geometry.viewport) {
                    mapInstance.fitBounds(place.geometry.viewport)
                } else {
                    mapInstance.setCenter(place.geometry.location)
                    mapInstance.setZoom(17)
                }

                // อัปเดตค่าทันทีจากผล Search
                this.$emit('update:modelValue', place.formatted_address)
            })
        },
    },
    mounted() {
        this.initAutocomplete()
    },
}
</script>

<style scoped>
.map-container {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #dbdbdb;
}

.center-marker {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -100%); /* ยกหัวหมุดให้ชี้ที่จุดกึ่งกลางพอดี */
    z-index: 10;
    pointer-events: none; /* ให้คลิกทะลุไปโดนแผนที่ได้ */
}

/* ปรับสี input เวลา error แต่ยังให้อ่านง่าย */
.input.is-danger {
    color: #363636;
}
</style>
