<template>
  <div class="px-4 pt-3">
    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="bg-midnight-800 border border-midnight-700 rounded-2xl p-4 text-left hover:border-accent/50 transition-colors"
        @click="$emit('select', cat)"
      >
        <span class="text-3xl">{{ cat.icon }}</span>
        <p class="text-white font-medium text-sm mt-2">{{ cat.label }}</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ cat.entries.length }} items</p>
        <!-- Daily progress bar -->
        <div class="mt-2 h-1 bg-midnight-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-accent rounded-full transition-all duration-500"
            :style="{ width: progress(cat) }"
          />
        </div>
        <p v-if="isComplete(cat)" class="text-xs text-accent mt-1">✓ Complete</p>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useZikirStore } from '@/stores/useZikirStore.js'

const props = defineProps({
  categories: { type: Array, required: true },
})

defineEmits(['select'])

const zikirStore = useZikirStore()

function progress(cat) {
  if (zikirStore.isCategoryComplete(cat.id)) return '100%'
  const completed = cat.entries.filter(e => {
    const count = zikirStore.getCount(e.id)
    return count >= e.count
  }).length
  return `${Math.round((completed / cat.entries.length) * 100)}%`
}

function isComplete(cat) {
  return zikirStore.isCategoryComplete(cat.id)
}
</script>
