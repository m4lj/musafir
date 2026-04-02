<template>
  <div class="px-4 space-y-3">
    <p v-if="!items.length" class="text-center text-gray-500 py-8 text-sm">
      No restaurants match your filter.
    </p>
    <FoodCard
      v-for="item in items"
      :key="item.id"
      :item="item"
    />
  </div>
</template>

<script setup>
import FoodCard from './FoodCard.vue'

defineProps({
  items: { type: Array, required: true },
})
</script>
