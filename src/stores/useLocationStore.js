import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLocationStore = defineStore('location', () => {
  const coords = ref(null)       // { lat, lon } or null
  const error = ref(null)
  const loading = ref(false)
  const permissionState = ref('prompt') // 'prompt' | 'granted' | 'denied'

  function setCoords(lat, lon) {
    coords.value = { lat, lon }
    error.value = null
    permissionState.value = 'granted'
    // Persist last known location
    try {
      localStorage.setItem('musafir:location', JSON.stringify({ lat, lon }))
    } catch (_) {}
  }

  function setError(msg) {
    error.value = msg
    loading.value = false
  }

  function setLoading(val) {
    loading.value = val
  }

  function setPermission(state) {
    permissionState.value = state
  }

  // Restore last known on init
  function restoreLastKnown() {
    try {
      const saved = localStorage.getItem('musafir:location')
      if (saved && !coords.value) {
        const parsed = JSON.parse(saved)
        coords.value = parsed
      }
    } catch (_) {}
  }

  return { coords, error, loading, permissionState, setCoords, setError, setLoading, setPermission, restoreLastKnown }
})
