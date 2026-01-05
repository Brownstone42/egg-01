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
            <GoogleMap
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
            </GoogleMap>

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

<script setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue'
import { GoogleMap } from 'vue3-google-map'

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    error: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['update:modelValue', 'update:coordinates'])

// *** ใส่ API KEY ของคุณที่นี่ ***
const apiKey = 'AIzaSyA5kC8KaF_zYamu764W4vHrsx0vFqnV-BU'

const mapRef = ref(null)
const searchInput = ref(null)
const center = ref({ lat: 13.7563, lng: 100.5018 }) // Default Bangkok
const currentCenter = ref(center.value)

// ฟังก์ชันเมื่อแผนที่ถูกเลื่อน (เก็บพิกัดกลางจอปัจจุบันไว้ตลอด)
const onCenterChanged = () => {
    if (mapRef.value?.map) {
        const c = mapRef.value.map.getCenter()
        currentCenter.value = { lat: c.lat(), lng: c.lng() }
    }
}

// ฟังก์ชันเมื่อหยุดเลื่อนแผนที่ (Idle) -> ทำ Reverse Geocoding
const onIdle = async () => {
    if (!mapRef.value?.map) return

    // Update final coordinates to parent (ถ้าต้องการเก็บ lat/lng)
    emit('update:coordinates', currentCenter.value)

    // Reverse Geocoding
    try {
        const geocoder = new google.maps.Geocoder()
        const response = await geocoder.geocode({ location: currentCenter.value })

        if (response.results[0]) {
            const address = response.results[0].formatted_address
            emit('update:modelValue', address)
        }
    } catch (e) {
        console.error('Geocoder failed:', e)
    }
}

onMounted(() => {
    // Setup Autocomplete Search
    // รอให้ API โหลดเสร็จก่อน (vue3-google-map จัดการโหลดสคริปต์ให้ แต่ต้องรอจังหวะ map ready ในบางเคส หรือใช้ loader)
    // วิธีที่ง่ายที่สุดคือใช้ setInterval เช็ค หรือใช้ Promise แต่ vue3-google-map โหลด async.
    // เพื่อความชัวร์ เราจะรอ google object

    const initAutocomplete = () => {
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            setTimeout(initAutocomplete, 500)
            return
        }

        const autocomplete = new google.maps.places.Autocomplete(searchInput.value, {
            fields: ['geometry', 'formatted_address'],
        })

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()

            if (!place.geometry || !place.geometry.location) {
                return // User entered name but didn't select suggestion
            }

            // ย้ายแผนที่ไปจุดที่เลือก
            if (place.geometry.viewport) {
                mapRef.value.map.fitBounds(place.geometry.viewport)
            } else {
                mapRef.value.map.setCenter(place.geometry.location)
                mapRef.value.map.setZoom(17)
            }

            // อัปเดตค่าทันทีจากผล Search
            emit('update:modelValue', place.formatted_address)
        })
    }

    initAutocomplete()
})
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
