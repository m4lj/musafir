<template>
  <nav class="fixed bottom-0 left-0 right-0 z-20 bg-midnight-900/95 backdrop-blur border-t border-midnight-700 safe-bottom">
    <div class="flex">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex flex-col items-center justify-center flex-1 py-3 text-xs gap-1 transition-colors"
        :class="[
          isActive(tab.to)
            ? 'text-accent'
            : 'text-midnight-700 hover:text-white'
        ]"
      >
        <span class="text-xl leading-none">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { to: '/mosque', icon: '🕌', label: 'Mosque' },
  { to: '/food',   icon: '🍽', label: 'Food' },
  { to: '/prayer', icon: '🕐', label: 'Prayer' },
  { to: '/zikir',  icon: '📿', label: 'Zikir' },
]

function isActive(path) {
  return route.path === path
}
</script>
