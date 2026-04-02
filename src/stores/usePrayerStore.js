import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePrayer } from '@/composables/usePrayer.js'
import { fetchWaktuSolat } from '@/composables/useWaktuSolat.js'
import { detectZone } from '@/composables/useZoneDetect.js'
import { useLocationStore } from './useLocationStore.js'
import { useSettingsStore } from './useSettingsStore.js'

const FARD_PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

export const usePrayerStore = defineStore('prayer', () => {
  const locationStore = useLocationStore()
  const settingsStore = useSettingsStore()

  const times = ref(null)         // { fajr, sunrise, dhuhr, asr, maghrib, isha } — Date objects
  const nextPrayer = ref(null)    // { name, displayName, time }
  const countdown = ref('--:--:--')
  const hijriDate = ref(null)     // { day, month, year, monthName }
  const error = ref(null)
  const loading = ref(false)
  const noGps = ref(false)        // true when GPS is unavailable/denied
  const zone = ref(null)          // JAKIM zone code if in Malaysia, else null

  let intervalId = null

  // ─── Countdown helpers ───────────────────────────────────────────────────

  function computeNextPrayer(timesObj) {
    const now = new Date()
    for (const name of FARD_PRAYERS) {
      if (timesObj[name] > now) {
        return { name, time: timesObj[name], displayName: name.charAt(0).toUpperCase() + name.slice(1) }
      }
    }
    // All passed — next is tomorrow's Fajr (approximate +24 h)
    return {
      name: 'fajr',
      time: new Date(timesObj.fajr.getTime() + 24 * 60 * 60 * 1000),
      displayName: 'Fajr',
    }
  }

  function computeCountdown(nextP) {
    const diff = nextP.time - new Date()
    if (diff <= 0) return '00:00:00'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function startCountdownTick() {
    if (intervalId) clearInterval(intervalId)
    intervalId = setInterval(() => {
      if (!times.value) return
      nextPrayer.value = computeNextPrayer(times.value)
      countdown.value = computeCountdown(nextPrayer.value)
    }, 1000)
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  async function init() {
    const coords = locationStore.coords

    // No GPS — show the no-GPS state, do not calculate
    if (!coords) {
      noGps.value = true
      zone.value = null
      times.value = null
      nextPrayer.value = null
      hijriDate.value = null
      if (intervalId) clearInterval(intervalId)
      return
    }

    noGps.value = false
    loading.value = true
    error.value = null

    const { lat, lon } = coords
    const method = settingsStore.settings.calculationMethod || 'JAKIM'

    try {
      zone.value = detectZone(lat, lon)

      if (zone.value) {
        // Malaysia — use waktusolat.app JAKIM data
        const result = await fetchWaktuSolat(zone.value)
        times.value = result.times
        hijriDate.value = result.hijriDate
      } else {
        // Outside Malaysia — use local Adhan JS calculation
        const prayer = usePrayer({ lat, lon }, method)
        times.value = prayer.times
        hijriDate.value = prayer.hijriDate
      }

      nextPrayer.value = computeNextPrayer(times.value)
      countdown.value = computeCountdown(nextPrayer.value)
      startCountdownTick()
    } catch (err) {
      error.value = err.message || 'Failed to load prayer times'
      // Fallback to Adhan JS if API fails
      try {
        const prayer = usePrayer({ lat, lon }, method)
        times.value = prayer.times
        hijriDate.value = prayer.hijriDate
        nextPrayer.value = computeNextPrayer(times.value)
        countdown.value = computeCountdown(nextPrayer.value)
        startCountdownTick()
        error.value = null // recovered
      } catch (_) {
        // Adhan also failed — leave error set
      }
    } finally {
      loading.value = false
    }
  }

  function stop() {
    if (intervalId) clearInterval(intervalId)
  }

  return { times, nextPrayer, countdown, hijriDate, error, loading, noGps, zone, init, stop }
})
