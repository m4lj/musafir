import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFoodStore = defineStore('food', () => {
  const items = ref([])
  const filtered = ref([])
  const loading = ref(false)
  const error = ref(null)
  const activeCountry = ref('All')
  const activeCuisine = ref('All')
  const viewMode = ref('list')    // 'list' | 'map'
  const favourites = ref(new Set())

  // Load favourites from localStorage
  try {
    const saved = localStorage.getItem('musafir:fav-food')
    if (saved) favourites.value = new Set(JSON.parse(saved))
  } catch (_) {}

  function setItems(list) {
    items.value = list
    filtered.value = list
    loading.value = false
    error.value = null
  }

  function applyFilters() {
    filtered.value = items.value.filter(item => {
      const countryMatch = activeCountry.value === 'All' || item.country === activeCountry.value
      const cuisineMatch = activeCuisine.value === 'All' || item.cuisine === activeCuisine.value
      return countryMatch && cuisineMatch
    })
  }

  function setCountry(country) {
    activeCountry.value = country
    applyFilters()
  }

  function setCuisine(cuisine) {
    activeCuisine.value = cuisine
    applyFilters()
  }

  function setViewMode(mode) {
    viewMode.value = mode
  }

  function toggleFavourite(id) {
    if (favourites.value.has(id)) {
      favourites.value.delete(id)
    } else {
      favourites.value.add(id)
    }
    try {
      localStorage.setItem('musafir:fav-food', JSON.stringify([...favourites.value]))
    } catch (_) {}
  }

  function isFavourite(id) {
    return favourites.value.has(id)
  }

  const countries = () => ['All', ...new Set(items.value.map(i => i.country))]
  const cuisines = () => ['All', ...new Set(items.value.map(i => i.cuisine))]

  return {
    items, filtered, loading, error, activeCountry, activeCuisine, viewMode,
    setItems, setCountry, setCuisine, setViewMode, toggleFavourite, isFavourite, countries, cuisines
  }
})
