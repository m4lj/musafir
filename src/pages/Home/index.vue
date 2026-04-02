<template>
  <div class="min-h-screen bg-midnight-950">
    <!-- Header Bar -->
    <header class="px-4 pt-safe-top pt-4 pb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🕌</span>
        <span class="text-lg font-bold text-white">Musafir</span>
      </div>
      <div class="flex items-center gap-3">
        <!-- Hijri date chip -->
        <div v-if="hijriDate" class="bg-midnight-800 border border-midnight-700 rounded-full px-3 py-1 text-xs text-gray-300">
          {{ hijriDate.day }} {{ hijriDate.monthName }} {{ hijriDate.year }}H
        </div>
        <div v-else class="bg-midnight-800 border border-midnight-700 rounded-full px-3 py-1 text-xs text-gray-300">
          {{ gregorianDate }}
        </div>
      </div>
    </header>

    <div class="px-4 space-y-4 pb-6">
      <!-- Greeting Card -->
      <div class="bg-gradient-to-br from-midnight-800 to-midnight-900 border border-midnight-700 rounded-2xl p-4">
        <p class="text-lg font-semibold text-white">{{ greeting }} 🌙</p>
        <p class="text-sm text-gray-400 mt-1">{{ greetingSub }}</p>
      </div>

      <!-- Location Required Banner -->
      <div v-if="!locationStore.coords && !locationStore.loading" class="bg-midnight-800 border border-accent/30 rounded-2xl p-4">
        <p class="text-sm text-gray-300 mb-3">Enable location for prayer times, nearby mosques and personalised features.</p>
        <button
          class="w-full bg-accent text-white rounded-xl py-2.5 text-sm font-medium"
          @click="requestLoc"
        >
          📍 Enable Location
        </button>
      </div>

      <LoadingSpinner v-if="locationStore.loading" label="Getting your location..." />
      <ErrorBanner v-if="locationStore.error" :message="locationStore.error" :on-retry="requestLoc" title="Location Error" />

      <!-- Next Prayer Hero Card -->
      <div v-if="prayerStore.nextPrayer" class="bg-gradient-to-br from-yellow-900/40 to-midnight-800 border border-gold/30 rounded-2xl p-5">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs text-gold font-medium uppercase tracking-wider">Next Prayer</span>
          <span class="text-xs text-gray-400">{{ prayerStore.countdown }}</span>
        </div>
        <p class="text-2xl font-bold text-white">{{ prayerStore.nextPrayer.displayName }}</p>
        <p class="text-gold text-sm mt-1">{{ formatPrayerTime(prayerStore.nextPrayer.time) }}</p>
        <!-- Progress bar: fraction of time until next prayer elapsed -->
        <div class="mt-3 h-1 bg-midnight-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-gold rounded-full transition-all duration-1000"
            :style="{ width: progressWidth }"
          />
        </div>
      </div>

      <!-- Nearest Mosque Card -->
      <div v-if="mosqueStore.nearest" class="bg-midnight-800 border border-midnight-700 rounded-2xl p-4">
        <p class="text-xs text-emerald-600 font-medium uppercase tracking-wider mb-1">Nearest Mosque</p>
        <p class="text-white font-semibold">{{ mosqueStore.nearest.name }}</p>
        <p class="text-sm text-gray-400 mt-0.5">{{ nearestDistance }}</p>
        <RouterLink
          to="/mosque"
          class="mt-3 flex items-center justify-center gap-2 bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 rounded-xl py-2 text-sm font-medium"
        >
          🗺 View on Map
        </RouterLink>
      </div>

      <!-- Dua of the Day -->
      <div v-if="duaOfDay" class="bg-midnight-800 border border-gold/30 rounded-2xl p-4">
        <p class="text-xs text-gold font-medium uppercase tracking-wider mb-3">Dua of the Day</p>
        <p class="arabic text-xl text-white leading-loose mb-2">{{ duaOfDay.arabic }}</p>
        <p class="text-sm text-gray-300 italic">{{ duaOfDay.transliteration }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ duaOfDay.source }}</p>
        <RouterLink to="/zikir" class="mt-3 block text-center text-xs text-accent underline">
          More Zikir & Dua →
        </RouterLink>
      </div>

      <!-- Quick Nav Grid -->
      <div class="grid grid-cols-2 gap-3">
        <RouterLink
          v-for="nav in quickNav"
          :key="nav.to"
          :to="nav.to"
          class="bg-midnight-800 border border-midnight-700 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-accent/50 transition-colors"
        >
          <span class="text-3xl">{{ nav.icon }}</span>
          <span class="text-sm text-white font-medium">{{ nav.label }}</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import { useLocationStore } from '@/stores/useLocationStore.js'
import { usePrayerStore } from '@/stores/usePrayerStore.js'
import { useMosqueStore } from '@/stores/useMosqueStore.js'
import { useZikirStore } from '@/stores/useZikirStore.js'
import { useGeolocation } from '@/composables/useGeolocation.js'
import { useOverpass, buildMosqueQuery } from '@/composables/useOverpass.js'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorBanner from '@/components/ErrorBanner.vue'
import generalDuas from '@/data/zikir/general.json'

const locationStore = useLocationStore()
const prayerStore = usePrayerStore()
const mosqueStore = useMosqueStore()
const zikirStore = useZikirStore()
const { requestLocation } = useGeolocation()

const quickNav = [
  { to: '/mosque', icon: '🕌', label: 'Mosque' },
  { to: '/food',   icon: '🍽', label: 'Halal Food' },
  { to: '/prayer', icon: '🕐', label: 'Prayer Times' },
  { to: '/zikir',  icon: '📿', label: 'Zikir & Dua' },
]

// Greeting
const greeting = computed(() => {
  const h = dayjs().hour()
  if (h >= 5 && h < 12) return 'Good morning, Musafir'
  if (h >= 12 && h < 17) return 'Good afternoon, Musafir'
  if (h >= 17 && h < 21) return 'Good evening, Musafir'
  return 'Assalamualaikum, Musafir'
})

const greetingSub = computed(() => {
  if (!prayerStore.nextPrayer) return 'Your halal travel companion'
  return `${prayerStore.nextPrayer.displayName} in ${prayerStore.countdown}`
})

const gregorianDate = computed(() => dayjs().format('D MMM YYYY'))

const hijriDate = computed(() => prayerStore.hijriDate)

// Prayer progress bar
const progressWidth = computed(() => {
  if (!prayerStore.nextPrayer) return '0%'
  const now = Date.now()
  const target = prayerStore.nextPrayer.time?.getTime()
  if (!target) return '0%'
  // Approximate: show progress over a 2-hour window
  const windowMs = 2 * 60 * 60 * 1000
  const diff = target - now
  if (diff <= 0) return '100%'
  const elapsed = windowMs - Math.min(diff, windowMs)
  return `${Math.round((elapsed / windowMs) * 100)}%`
})

function formatPrayerTime(d) {
  if (!d) return '--:--'
  return d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// Nearest mosque distance
const nearestDistance = computed(() => {
  if (!mosqueStore.nearest || !locationStore.coords) return ''
  const { lat: lat1, lon: lon1 } = locationStore.coords
  const { lat: lat2, lon: lon2 } = mosqueStore.nearest
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return d < 1000 ? `${Math.round(d)}m away` : `${(d / 1000).toFixed(1)}km away`
})

// Dua of the day
const duaOfDay = computed(() => zikirStore.getDuaOfDay(generalDuas))

async function requestLoc() {
  try {
    await requestLocation()
    // Init prayer times
    prayerStore.init()
    // Fetch nearest mosque
    fetchNearestMosque()
  } catch (_) {}
}

async function fetchNearestMosque() {
  if (!locationStore.coords) return
  const { lat, lon } = locationStore.coords
  try {
    mosqueStore.setLoading(true)
    const results = await useOverpass(
      buildMosqueQuery(lat, lon, 3000),
      `mosques:${lat.toFixed(3)},${lon.toFixed(3)}:3000`
    )
    // Sort by distance
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

onMounted(() => {
  locationStore.restoreLastKnown()
  if (locationStore.coords) {
    prayerStore.init()
    if (!mosqueStore.nearest) fetchNearestMosque()
  }
})

onUnmounted(() => {
  prayerStore.stop()
})
</script>
