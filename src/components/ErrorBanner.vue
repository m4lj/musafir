<template>
  <div class="mx-4 my-3 p-4 bg-red-900/40 border border-red-700 rounded-2xl shadow flex gap-3 items-start">
    <span class="text-2xl flex-shrink-0">⚠️</span>
    <div class="flex-1 min-w-0">
      <p class="font-semibold text-red-300">{{ title }}</p>
      <p class="text-sm text-red-400 mt-0.5">{{ message }}</p>
      <button
        v-if="onRetry"
        class="mt-2 text-sm text-accent underline"
        @click="onRetry"
      >
        Try again
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Something went wrong',
  },
  message: {
    type: String,
    default: 'Please try again.',
  },
  onRetry: {
    type: Function,
    default: null,
  },
})
</script>
