<template>
  <div class="space-y-2">
    <p class="text-xs text-gray-500 mb-2">{{ mosques.length }} mosque{{ mosques.length !== 1 ? 's' : '' }} found</p>
    <MosqueCard
      v-for="mosque in mosques"
      :key="mosque.id"
      :mosque="mosque"
      :coords="coords"
    />
  </div>
</template>

<script setup>
import MosqueCard from './MosqueCard.vue'

defineProps({
  mosques: { type: Array, required: true },
  coords: { type: Object, default: null },
})
</script>
