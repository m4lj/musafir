import { ref, watch } from 'vue'

/**
 * Reactive localStorage wrapper — the Supabase swap boundary.
 * v1: localStorage. v2: swap only this composable, UI stays identical.
 */
export function useStorage(key, defaultValue) {
  let parsed = defaultValue
  try {
    const raw = localStorage.getItem(key)
    if (raw !== null) parsed = JSON.parse(raw)
  } catch (_) {}

  const data = ref(parsed)

  watch(data, (val) => {
    try {
      localStorage.setItem(key, JSON.stringify(val))
    } catch (_) {}
  }, { deep: true })

  return data
}
