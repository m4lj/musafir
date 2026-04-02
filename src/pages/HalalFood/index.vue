<template>
  <div>
    <!-- View toggle -->
    <div class="px-4 pt-3 flex items-center justify-between">
      <p class="text-xs text-gray-400">{{ foodStore.filtered.length }} places</p>
      <div class="flex bg-midnight-800 border border-midnight-700 rounded-xl p-0.5 gap-0.5">
        <button
          v-for="mode in ['list', 'map']"
          :key="mode"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize"
          :class="foodStore.viewMode === mode ? 'bg-accent text-white' : 'text-gray-400'"
          @click="foodStore.setViewMode(mode)"
        >
          {{ mode === 'list' ? '☰ List' : '🗺 Map' }}
        </button>
      </div>
    </div>

    <!-- Country filter pills -->
    <div class="px-4 mt-3 overflow-x-auto">
      <div class="flex gap-2 min-w-max pb-1">
        <button
          v-for="country in countries"
          :key="country"
          class="px-3 py-1.5 rounded-full text-xs border whitespace-nowrap transition-colors"
          :class="foodStore.activeCountry === country
            ? 'bg-accent border-accent text-white'
            : 'border-midnight-700 text-gray-400 hover:border-accent/50'"
          @click="foodStore.setCountry(country)"
        >
          {{ country }}
        </button>
      </div>
    </div>

    <!-- Cuisine filter pills -->
    <div class="px-4 mt-2 overflow-x-auto">
      <div class="flex gap-2 min-w-max pb-1">
        <button
          v-for="cuisine in cuisines"
          :key="cuisine"
          class="px-3 py-1.5 rounded-full text-xs border whitespace-nowrap transition-colors"
          :class="foodStore.activeCuisine === cuisine
            ? 'bg-emerald-600 border-emerald-600 text-white'
            : 'border-midnight-700 text-gray-400 hover:border-emerald-600/50'"
          @click="foodStore.setCuisine(cuisine)"
        >
          {{ cuisine }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="mt-3 pb-6">
      <FoodMap v-if="foodStore.viewMode === 'map'" :items="foodStore.filtered" />
      <FoodList v-else :items="foodStore.filtered" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useFoodStore } from '@/stores/useFoodStore.js'
import { useFoodSource } from '@/composables/useFoodSource.js'
import FoodList from './FoodList.vue'
import FoodMap from './FoodMap.vue'

const foodStore = useFoodStore()

const countries = computed(() => foodStore.countries())
const cuisines = computed(() => foodStore.cuisines())

onMounted(async () => {
  if (!foodStore.items.length) {
    const data = await useFoodSource()
    foodStore.setItems(data)
  }
})
</script>
