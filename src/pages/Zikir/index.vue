<template>
  <div class="pb-6">
    <!-- Category Reader view -->
    <ZikirReader
      v-if="activeCategory"
      :category="activeCategory"
      @back="activeCategory = null"
    />

    <!-- Zikir Home -->
    <template v-else>
      <CategoryGrid :categories="categories" @select="activeCategory = $event" />

      <!-- Dua of the Day -->
      <div v-if="duaOfDay" class="mx-4 mt-4 bg-midnight-800 border border-gold/30 rounded-2xl p-5">
        <p class="text-xs text-gold font-medium uppercase tracking-wider mb-3">Dua of the Day</p>
        <p class="arabic text-2xl text-white leading-loose mb-3">{{ duaOfDay.arabic }}</p>
        <p class="text-sm text-gray-300 italic mb-1">{{ duaOfDay.transliteration }}</p>
        <p class="text-sm text-gray-400">{{ duaOfDay.translation }}</p>
        <p class="text-xs text-gray-500 mt-2">{{ duaOfDay.source }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useZikirStore } from '@/stores/useZikirStore.js'
import CategoryGrid from './CategoryGrid.vue'
import ZikirReader from './ZikirReader.vue'
import morningData from '@/data/zikir/morning.json'
import eveningData from '@/data/zikir/evening.json'
import travelData from '@/data/zikir/travel.json'
import afterPrayerData from '@/data/zikir/after-prayer.json'
import generalData from '@/data/zikir/general.json'

const zikirStore = useZikirStore()
const activeCategory = ref(null)

const categories = [
  { id: 'morning',     label: 'Morning Adhkar',  icon: '🌅', entries: morningData },
  { id: 'evening',     label: 'Evening Adhkar',  icon: '🌙', entries: eveningData },
  { id: 'travel',      label: 'Travel Duas',     icon: '✈️', entries: travelData },
  { id: 'after-prayer',label: 'After Prayer',    icon: '🤲', entries: afterPrayerData },
  { id: 'general',     label: 'Daily Duas',      icon: '📿', entries: generalData },
]

const duaOfDay = computed(() => zikirStore.getDuaOfDay(generalData))
</script>
