<template>
  <header class="sticky top-0 z-10 bg-midnight-900/95 backdrop-blur border-b border-midnight-700 px-4 py-3 flex items-center justify-between">
    <RouterLink to="/" class="flex items-center gap-2 text-white font-semibold text-lg">
      <span class="text-accent">🕌</span>
      <span>{{ title }}</span>
    </RouterLink>
    <slot name="right" />
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const PAGE_TITLES = {
  mosque: '🕌 Mosque Finder',
  food: '🍽 Halal Food',
  prayer: '🕐 Prayer Times',
  zikir: '📿 Zikir & Dua',
}

const title = computed(() => PAGE_TITLES[route.name] || 'Musafir')
</script>
