import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePrayer } from '@/composables/usePrayer.js'
import { useLocationStore } from './useLocationStore.js'

export const usePrayerStore = defineStore('prayer', () => {
  const locationStore = useLocationStore()

  const times = ref(null)         // { Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha } — Date objects
  const nextPrayer = ref(null)    // { name, time }
  const countdown = ref('--:--')  // HH:MM:SS string
  const hijriDate = ref(null)     // { day, month, year, monthName }
  const error = ref(null)

  let intervalId = null

  function init() {
    if (!locationStore.coords) return
    const { lat, lon } = locationStore.coords
    const prayer = usePrayer({ lat, lon })
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
