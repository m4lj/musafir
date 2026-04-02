<template>
  <div
    class="bg-midnight-800 border rounded-2xl p-4 transition-all"
    :class="hero ? 'border-emerald-600/40 bg-gradient-to-br from-midnight-800 to-emerald-900/20' : 'border-midnight-700'"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1 min-w-0">
        <p v-if="hero" class="text-xs text-emerald-400 font-medium uppercase tracking-wider mb-1">Nearest Mosque</p>
        <p class="text-white font-semibold truncate">{{ mosque.name }}</p>
        <p class="text-sm text-gray-400 mt-0.5">{{ distance }}</p>
        <p v-if="mosque.tags?.['addr:street']" class="text-xs text-gray-500 mt-0.5">{{ mosque.tags['addr:street'] }}</p>
      </div>
      <button
        class="flex-shrink-0 p-2 rounded-xl text-lg"
        :class="isFav ? 'text-gold' : 'text-gray-600'"
        @click="toggleFav"
      >
        {{ isFav ? '★' : '☆' }}
      </button>
    </div>

    <a
      v-if="hero"
      :href="`https://maps.google.com/?q=${mosque.lat},${mosque.lon}`"
      target="_blank"
      rel="noopener"
      class="mt-3 flex items-center justify-center gap-2 bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 rounded-xl py-2 text-sm font-medium"
    >
      🗺 View on Map
    </a>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMosqueStore } from '@/stores/useMosqueStore.js'

const props = defineProps({
  mosque: { type: Object, required: true },
  coords: { type: Object, default: null },
  hero: { type: Boolean, default: false },
})

const mosqueStore = useMosqueStore()

const isFav = computed(() => mosqueStore.isFavourite(props.mosque.id))

function toggleFav() {
  mosqueStore.toggleFavourite(props.mosque.id)
}

const distance = computed(() => {
  if (!props.coords) return ''
  const { lat: lat1, lon: lon1 } = props.coords
  const { lat: lat2, lon: lon2 } = props.mosque
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return d < 1000 ? `${Math.round(d)}m away` : `${(d / 1000).toFixed(1)}km away`
})
</script>
