import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'musafir:settings'

const DEFAULT_SETTINGS = {
  calculationMethod: 'JAKIM',  // JAKIM | MUIS | MWL | ISNA | Egypt | Karachi | Tehran | Gulf
  asrMethod: 'Standard',       // Standard | Hanafi
  theme: 'dark',
  language: 'en',
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({ ...DEFAULT_SETTINGS })

  // Load from localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      settings.value = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
    }
  } catch (_) {}

  // Persist on change
  watch(settings, (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } catch (_) {}
  }, { deep: true })

  function setMethod(method) {
    settings.value.calculationMethod = method
  }

  return { settings, setMethod }
})
