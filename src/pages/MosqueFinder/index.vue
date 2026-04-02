<template>
  <div>
    <!-- Location Banner -->
    <div v-if="!locationStore.coords && !locationStore.loading" class="px-4 py-3">
      <div class="bg-midnight-800 border border-accent/30 rounded-2xl p-4">
        <p class="text-sm text-gray-300 mb-3">Enable location to find mosques near you.</p>
        <button class="w-full bg-accent text-white rounded-xl py-2.5 text-sm font-medium" @click="requestLoc">
          📍 Enable Location
        </button>
      </div>
    </div>

    <LoadingSpinner v-if="locationStore.loading" label="Getting location..." />
    <ErrorBanner
      v-if="mosqueStore.error && !mosqueStore.loading"
      title="Couldn't load mosques"
      :message="mosqueStore.error"
      :on-retry="fetchMosques"
    />

    <template v-if="locationStore.coords">
      <!-- Nearest Hero Card -->
      <div v-if="mosqueStore.nearest" class="mx-4 mt-3">
        <MosqueCard :mosque="mosqueStore.nearest" :coords="locationStore.coords" hero />
      </div>

      <!-- Mini Map -->
      <div class="mx-4 mt-3 rounded-2xl overflow-hidden border border-midnight-700 cursor-pointer" @click="showFullMap = true">
        <MosqueMap :mosques="mosqueStore.mosques" :coords="locationStore.coords" :height="120" />
      </div>

      <!-- Full Map Modal -->
      <div v-if="showFullMap" class="fixed inset-0 z-50 bg-midnight-950">
        <div class="flex items-center justify-between px-4 py-3 border-b border-midnight-700">
          <p class="text-white font-semibold">Mosque Map</p>
          <button class="text-gray-400 text-xl" @click="showFullMap = false">✕</button>
        </div>
        <MosqueMap :mosques="mosqueStore.mosques" :coords="locationStore.coords" :height="0" full-screen />
      </div>

      <!-- Radius Toggles -->
      <div class="mx-4 mt-3 flex gap-2">
        <button
          v-for="r in radiusOptions"
          :key="r.value"
          class="px-4 py-1.5 rounded-full text-sm border transition-colors"
          :class="mosqueStore.radius === r.value
            ? 'bg-accent border-accent text-white'
            : 'border-midnight-700 text-gray-400 hover:border-accent/50'"
          @click="changeRadius(r.value)"
        >
          {{ r.label }}
        </button>
      </div>

      <!-- Mosque List -->
      <div class="px-4 mt-3 pb-6">
        <LoadingSpinner v-if="mosqueStore.loading" label="Finding mosques..." />
        <SkeletonCard v-else-if="!mosqueStore.mosques.length && !mosqueStore.error" :count="3" />
        <p v-else-if="!mosqueStore.mosques.length" class="text-center text-gray-500 py-8 text-sm">
          No mosques found in {{ mosqueStore.radius / 1000 }}km radius. Try a larger radius.
        </p>
        <MosqueList v-else :mosques="mosqueStore.mosques" :coords="locationStore.coords" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLocationStore } from '@/stores/useLocationStore.js'
import { useMosqueStore } from '@/stores/useMosqueStore.js'
import { useGeolocation } from '@/composables/useGeolocation.js'
import { useOverpass, buildMosqueQuery } from '@/composables/useOverpass.js'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorBanner from '@/components/ErrorBanner.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import MosqueCard from './MosqueCard.vue'
import MosqueList from './MosqueList.vue'
import MosqueMap from './MosqueMap.vue'

const locationStore = useLocationStore()
const mosqueStore = useMosqueStore()
const { requestLocation } = useGeolocation()

const showFullMap = ref(false)

const radiusOptions = [
  { label: '1km', value: 1000 },
  { label: '3km', value: 3000 },
  { label: '5km', value: 5000 },
]

async function fetchMosques() {
  if (!locationStore.coords) return
  const { lat, lon } = locationStore.coords
  const cacheKey = `mosques:${lat.toFixed(3)},${lon.toFixed(3)}:${mosqueStore.radius}`
  mosqueStore.setLoading(true)
  try {
    const results = await useOverpass(buildMosqueQuery(lat, lon, mosqueStore.radius), cacheKey)
    const sorted = results.sort((a, b) => {
      const da = Math.hypot(a.lat - lat, a.lon - lon)
      const db = Math.hypot(b.lat - lat, b.lon - lon)
      return da - db
    })
    mosqueStore.setMosques(sorted)
  } catch (err) {
    mosqueStore.setError(err.message)
  }
}

async function requestLoc() {
  try {
    await requestLocation()
    fetchMosques()
  } catch (_) {}
}

function changeRadius(r) {
  mosqueStore.setRadius(r)
  fetchMosques()
}

onMounted(() => {
  locationStore.restoreLastKnown()
  if (locationStore.coords && !mosqueStore.mosques.length) {
    fetchMosques()
  }
})
</script>
