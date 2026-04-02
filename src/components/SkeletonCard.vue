<template>
  <div class="animate-pulse space-y-3">
    <template v-if="count === 1">
      <div class="bg-midnight-800 rounded-2xl p-4">
        <div class="h-4 bg-midnight-700 rounded w-3/4 mb-2" />
        <div class="h-3 bg-midnight-700 rounded w-1/2" />
      </div>
    </template>
    <template v-else>
      <div
        v-for="i in count"
        :key="i"
        class="bg-midnight-800 rounded-2xl p-4"
      >
        <div class="h-4 bg-midnight-700 rounded w-3/4 mb-2" />
        <div class="h-3 bg-midnight-700 rounded w-1/2" />
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    default: 3,
  },
})
</script>
