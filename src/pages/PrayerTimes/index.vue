<template>
  <div class="pb-6">
    <!-- Location Banner -->
    <div v-if="!locationStore.coords" class="px-4 pt-3">
      <div class="bg-midnight-800 border border-accent/30 rounded-2xl p-4">
        <p class="text-sm text-gray-300 mb-3">Enable location to calculate accurate prayer times.</p>
        <button class="w-full bg-accent text-white rounded-xl py-2.5 text-sm font-medium" @click="requestLoc">
          📍 Enable Location
        </button>
      </div>
    </div>

    <template v-if="locationStore.coords && prayerStore.times">
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
  if (!locationStore.coords) return 'Unknown'
  const { lat, lon } = locationStore.coords
  return `${lat.toFixed(3)}, ${lon.toFixed(3)}`
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
  if (locationStore.coords && !prayerStore.times) {
    prayerStore.init()
  }
})
</script>
