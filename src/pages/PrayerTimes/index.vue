<template>
  <div class="pb-6">

    <!-- GPS Unavailable State -->
    <div v-if="prayerStore.noGps" class="px-4 pt-6 flex flex-col items-center text-center">
      <div class="bg-midnight-800 border border-midnight-700 rounded-2xl p-6 w-full max-w-sm mx-auto">
        <span class="text-4xl mb-4 block">📍</span>
        <p class="text-white font-semibold mb-1">Location Required</p>
        <p class="text-sm text-gray-400 mb-4">
          <span v-if="locationStore.permissionState === 'denied'">
            Location access was denied. Please allow location permission in your browser settings.
          </span>
          <span v-else>
            Prayer times require your location to calculate accurately.
          </span>
        </p>
        <button
          class="w-full bg-accent text-white rounded-xl py-2.5 text-sm font-medium"
          @click="requestLoc"
        >
          📍 Enable Location
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="prayerStore.loading" class="px-4 pt-6 flex justify-center">
      <div class="text-center">
        <div class="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p class="text-sm text-gray-400">Loading prayer times…</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="prayerStore.error && !prayerStore.times" class="px-4 pt-4">
      <div class="bg-midnight-800 border border-red-500/30 rounded-2xl p-4">
        <p class="text-sm text-red-400 font-medium">Failed to load prayer times</p>
        <p class="text-xs text-gray-500 mt-1">{{ prayerStore.error }}</p>
        <button
          class="mt-3 text-sm text-accent underline"
          @click="prayerStore.init()"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Prayer Times Content -->
    <template v-if="prayerStore.times">
      <!-- Location + Hijri header -->
      <div class="px-4 pt-4 pb-2 flex items-start justify-between">
        <div>
          <p class="text-xs text-gray-500">📍 {{ locationLabel }}</p>
          <p v-if="prayerStore.hijriDate" class="text-xs text-gold mt-0.5">
            {{ prayerStore.hijriDate.day }} {{ prayerStore.hijriDate.monthName }} {{ prayerStore.hijriDate.year }}H
          </p>
        </div>
        <p class="text-xs text-gray-500">{{ gregorianDate }}</p>
      </div>

      <!-- Next Prayer Banner -->
      <PrayerBanner
        :next-prayer="prayerStore.nextPrayer"
        :countdown="prayerStore.countdown"
      />

      <!-- Prayer Grid -->
      <PrayerGrid
        :times="prayerStore.times"
        :next-prayer="prayerStore.nextPrayer"
      />

      <!-- Method Selector (shown only for non-Malaysia Adhan fallback) -->
      <div v-if="!isMalaysia" class="mx-4 mt-4 bg-midnight-800 border border-midnight-700 rounded-2xl overflow-hidden">
        <button
          class="w-full px-4 py-3 flex items-center justify-between text-sm"
          @click="showMethod = !showMethod"
        >
          <span class="text-gray-300">Calculation Method: <span class="text-white">{{ settingsStore.settings.calculationMethod }}</span></span>
          <span class="text-gray-500 text-xs">{{ showMethod ? '▲' : '▼' }}</span>
        </button>
        <div v-if="showMethod" class="border-t border-midnight-700">
          <button
            v-for="method in methods"
            :key="method"
            class="w-full px-4 py-3 text-left text-sm border-b border-midnight-700 last:border-0 transition-colors"
            :class="settingsStore.settings.calculationMethod === method
              ? 'text-accent bg-accent/10'
              : 'text-gray-400 hover:text-white'"
            @click="selectMethod(method)"
          >
            {{ method }}
          </button>
        </div>
      </div>

      <!-- Malaysia zone info -->
      <div v-if="isMalaysia" class="mx-4 mt-4 px-4 py-3 bg-midnight-800 border border-midnight-700 rounded-2xl">
        <p class="text-xs text-gray-400">
          🕌 Prayer times via <span class="text-white">JAKIM</span>
          <span v-if="prayerStore.zone"> · Zone {{ prayerStore.zone }}</span>
        </p>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useLocationStore } from '@/stores/useLocationStore.js'
import { usePrayerStore } from '@/stores/usePrayerStore.js'
import { useSettingsStore } from '@/stores/useSettingsStore.js'
import { useGeolocation } from '@/composables/useGeolocation.js'
import { detectZone } from '@/composables/useZoneDetect.js'
import PrayerBanner from './PrayerBanner.vue'
import PrayerGrid from './PrayerGrid.vue'

const locationStore = useLocationStore()
const prayerStore = usePrayerStore()
const settingsStore = useSettingsStore()
const { requestLocation } = useGeolocation()

const showMethod = ref(false)

const methods = ['JAKIM', 'MUIS', 'MWL', 'ISNA', 'Egypt', 'Karachi', 'Tehran', 'Gulf']

const gregorianDate = computed(() => dayjs().format('dddd, D MMMM YYYY'))

const isMalaysia = computed(() => {
  if (!locationStore.coords) return false
  const { lat, lon } = locationStore.coords
  return !!detectZone(lat, lon)
})

const locationLabel = computed(() => {
  if (locationStore.coords) {
    const { lat, lon } = locationStore.coords
    return `${lat.toFixed(3)}, ${lon.toFixed(3)}`
  }
  return ''
})

async function requestLoc() {
  try {
    await requestLocation()
    prayerStore.init()
  } catch (_) {}
}

function selectMethod(method) {
  settingsStore.setMethod(method)
  showMethod.value = false
  prayerStore.init()
}

onMounted(() => {
  locationStore.restoreLastKnown()
  prayerStore.init()
})
</script>
