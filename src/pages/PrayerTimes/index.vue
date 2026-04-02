<template>
  <div class="pb-6">
    <!-- Location Banner — shown only if no GPS, but times still load via Kuching default -->
    <div v-if="!locationStore.coords" class="px-4 pt-3">
      <div class="bg-midnight-800 border border-gold/30 rounded-2xl p-4 flex items-start gap-3">
        <span class="text-xl">📍</span>
        <div class="flex-1">
          <p class="text-sm text-white font-medium">Showing times for Kuching (Zon 8)</p>
          <p class="text-xs text-gray-400 mt-0.5">Kuching · Bau · Lundu · Sematan, Sarawak</p>
        </div>
        <button class="text-xs text-accent underline whitespace-nowrap mt-0.5" @click="requestLoc">
          Use my location
        </button>
      </div>
    </div>

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

      <!-- Method Selector -->
      <div class="mx-4 mt-4 bg-midnight-800 border border-midnight-700 rounded-2xl overflow-hidden">
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
import PrayerBanner from './PrayerBanner.vue'
import PrayerGrid from './PrayerGrid.vue'

const locationStore = useLocationStore()
const prayerStore = usePrayerStore()
const settingsStore = useSettingsStore()
const { requestLocation } = useGeolocation()

const showMethod = ref(false)

const methods = ['JAKIM', 'MUIS', 'MWL', 'ISNA', 'Egypt', 'Karachi', 'Tehran', 'Gulf']

const gregorianDate = computed(() => dayjs().format('dddd, D MMMM YYYY'))
const locationLabel = computed(() => {
  if (locationStore.coords) {
    const { lat, lon } = locationStore.coords
    return `${lat.toFixed(3)}, ${lon.toFixed(3)}`
  }
  return 'Kuching, Sarawak (Zon 8)'
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
  // Always init — uses GPS if available, Kuching default otherwise
  prayerStore.init()
})
</script>
