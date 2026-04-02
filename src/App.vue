<template>
  <div class="min-h-screen bg-midnight-950 text-white">
    <AppHeader v-if="showHeader" />
    <main class="pb-20">
      <RouterView />
    </main>
    <BottomNav />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import BottomNav from '@/components/BottomNav.vue'

const route = useRoute()
// Home has its own header built-in; other pages use AppHeader
const showHeader = computed(() => route.name !== 'home')
</script>
