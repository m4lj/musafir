import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePrayer } from '@/composables/usePrayer.js'
import { useLocationStore } from './useLocationStore.js'
import { useSettingsStore } from './useSettingsStore.js'

// Kuching default — Zon 8 (Kuching, Bau, Lundu, Sematan), Sarawak Malaysia
const KUCHING_COORDS = { lat: 1.5533, lon: 110.3593 }

export const usePrayerStore = defineStore('prayer', () => {
  const locationStore = useLocationStore()
  const settingsStore = useSettingsStore()

  const times = ref(null)         // { fajr, sunrise, dhuhr, asr, maghrib, isha } — Date objects
  const nextPrayer = ref(null)    // { name, time }
  const countdown = ref('--:--')  // HH:MM:SS string
  const hijriDate = ref(null)     // { day, month, year, monthName }
  const error = ref(null)

  let intervalId = null

  function init() {
    // Use GPS coords if available, otherwise fall back to Kuching default
    const coords = locationStore.coords || KUCHING_COORDS
    const { lat, lon } = coords
    const method = settingsStore.settings.calculationMethod || 'JAKIM'
    const prayer = usePrayer({ lat, lon }, method)
    times.value = prayer.times
    nextPrayer.value = prayer.nextPrayer
    hijriDate.value = prayer.hijriDate
    startCountdown(prayer)
  }

  function startCountdown(prayer) {
    if (intervalId) clearInterval(intervalId)
    intervalId = setInterval(() => {
      countdown.value = prayer.getCountdown()
      nextPrayer.value = prayer.nextPrayer
    }, 1000)
  }

  function stop() {
    if (intervalId) clearInterval(intervalId)
  }

  return { times, nextPrayer, countdown, hijriDate, error, init, stop }
})
