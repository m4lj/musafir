<template>
  <div class="bg-midnight-800 border border-midnight-700 rounded-2xl p-4">
    <!-- Header -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1 min-w-0">
        <p class="text-white font-semibold truncate">{{ item.name }}</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ item.city }}, {{ item.country }} · {{ item.cuisine }}</p>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <span class="text-gold text-sm">★ {{ item.rating }}</span>
        <button
          class="p-1 text-lg"
          :class="isFav ? 'text-gold' : 'text-gray-600'"
          @click="toggleFav"
        >
          {{ isFav ? '★' : '☆' }}
        </button>
      </div>
    </div>

    <!-- Halal Badge -->
    <div class="mt-2 flex items-center gap-1.5">
      <span
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
        :class="badgeClass"
      >
        {{ badgeIcon }} {{ badgeText }}
      </span>
    </div>

    <!-- Description -->
    <p class="text-sm text-gray-400 mt-2 leading-relaxed">{{ item.description }}</p>

    <!-- Disclaimer — always visible for non-certified -->
    <p v-if="disclaimer" class="mt-2 text-xs text-amber-400 bg-amber-900/20 border border-amber-700/30 rounded-xl px-3 py-2">
      ⚠️ {{ disclaimer }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFoodStore } from '@/stores/useFoodStore.js'

const props = defineProps({
  item: { type: Object, required: true },
})

const foodStore = useFoodStore()

const isFav = computed(() => foodStore.isFavourite(props.item.id))
function toggleFav() { foodStore.toggleFavourite(props.item.id) }

const badgeClass = computed(() => {
  if (props.item.halalStatus === 'certified') return 'bg-emerald-900/40 border border-emerald-600/40 text-emerald-400'
  return 'bg-amber-900/30 border border-amber-600/30 text-amber-400'
})

const badgeIcon = computed(() => props.item.halalStatus === 'certified' ? '✅' : '⚠️')

const badgeText = computed(() => {
  const map = { certified: 'Halal Certified', 'muslim-friendly': 'Muslim-Friendly', 'pork-free': 'Pork-Free' }
  return map[props.item.halalStatus] || props.item.halalStatus
})

const disclaimer = computed(() => {
  if (props.item.halalStatus === 'certified') return null
  if (props.item.halalStatus === 'muslim-friendly') {
    return 'This restaurant is Muslim-friendly but may not be halal-certified. Verify locally.'
  }
  return 'This restaurant does not serve pork but halal certification is not confirmed.'
})
</script>
