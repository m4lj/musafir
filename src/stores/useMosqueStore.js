import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMosqueStore = defineStore('mosque', () => {
  const mosques = ref([])
  const nearest = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const radius = ref(3000)           // metres — default 3km
  const favourites = ref(new Set())

  // Load favourites from localStorage
  try {
    const saved = localStorage.getItem('musafir:fav-mosques')
    if (saved) favourites.value = new Set(JSON.parse(saved))
  } catch (_) {}

  function setMosques(list) {
    mosques.value = list
    nearest.value = list.length > 0 ? list[0] : null
    loading.value = false
    error.value = null
  }

  function setLoading(val) {
    loading.value = val
  }

  function setError(msg) {
    error.value = msg
    loading.value = false
  }

  function setRadius(r) {
    radius.value = r
  }

  function toggleFavourite(id) {
    if (favourites.value.has(id)) {
      favourites.value.delete(id)
    } else {
      favourites.value.add(id)
    }
    try {
      localStorage.setItem('musafir:fav-mosques', JSON.stringify([...favourites.value]))
    } catch (_) {}
  }

  function isFavourite(id) {
    return favourites.value.has(id)
  }

  return { mosques, nearest, loading, error, radius, setMosques, setLoading, setError, setRadius, toggleFavourite, isFavourite }
})
