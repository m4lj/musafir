<template>
  <div class="flex flex-col min-h-screen">
    <!-- Reader Header -->
    <div class="sticky top-0 z-10 bg-midnight-900/95 backdrop-blur border-b border-midnight-700 px-4 py-3 flex items-center gap-3">
      <button class="text-gray-400 text-xl" @click="$emit('back')">‹</button>
      <div class="flex-1">
        <p class="text-white font-semibold text-sm">{{ category.label }}</p>
      </div>
      <span class="text-xs text-gray-500 bg-midnight-800 px-2 py-1 rounded-full">
        {{ currentIndex + 1 }} / {{ category.entries.length }}
      </span>
    </div>

    <!-- Progress bar -->
    <div class="h-1 bg-midnight-800">
      <div
        class="h-full bg-accent transition-all duration-500"
        :style="{ width: `${((currentIndex + 1) / category.entries.length) * 100}%` }"
      />
    </div>

    <!-- Entry Card -->
    <div class="flex-1 px-4 pt-6 pb-4">
      <div class="bg-gradient-to-br from-midnight-800 to-midnight-900 border border-midnight-700 rounded-2xl p-6 min-h-[280px] flex flex-col">
        <p class="arabic text-3xl text-white leading-loose text-right mb-4">{{ entry.arabic }}</p>
        <p class="text-sm text-gray-300 italic mb-2">{{ entry.transliteration }}</p>
        <p class="text-sm text-gray-400 flex-1">{{ entry.translation }}</p>
        <p class="text-xs text-gray-600 mt-4">{{ entry.source }}</p>

        <!-- Zikir Counter (count > 1) -->
        <ZikirCounter
          v-if="entry.count > 1"
          :entry-id="entry.id"
          :target="entry.count"
          @complete="onComplete"
        />

        <!-- Mark as Read (count = 1) -->
        <div v-else class="mt-4">
          <button
            class="w-full py-3 rounded-xl text-sm font-medium transition-colors"
            :class="isRead ? 'bg-accent/20 border border-accent text-accent' : 'bg-accent text-white'"
            @click="markRead"
          >
            {{ isRead ? '✓ Read' : 'Mark as Read' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="px-4 pb-6 flex items-center gap-3">
      <button
        class="flex-1 py-3 bg-midnight-800 border border-midnight-700 rounded-xl text-sm text-gray-400 disabled:opacity-40"
        :disabled="currentIndex === 0"
        @click="prev"
      >
        ← Prev
      </button>
      <!-- Dot indicators -->
      <div class="flex gap-1">
        <div
          v-for="(_, i) in category.entries"
          :key="i"
          class="w-1.5 h-1.5 rounded-full transition-colors"
          :class="i === currentIndex ? 'bg-accent' : 'bg-midnight-700'"
        />
      </div>
      <button
        class="flex-1 py-3 bg-midnight-800 border border-midnight-700 rounded-xl text-sm text-gray-400 disabled:opacity-40"
        :disabled="currentIndex === category.entries.length - 1"
        @click="next"
      >
        Next →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useZikirStore } from '@/stores/useZikirStore.js'
import ZikirCounter from './ZikirCounter.vue'

const props = defineProps({
  category: { type: Object, required: true },
})

defineEmits(['back'])

const zikirStore = useZikirStore()
const currentIndex = ref(0)

const entry = computed(() => props.category.entries[currentIndex.value])

const isRead = computed(() => {
  return zikirStore.getCount(entry.value.id) >= entry.value.count
})

function markRead() {
  zikirStore.increment(entry.value.id)
  if (navigator.vibrate) navigator.vibrate(10)
  // Auto-advance after short delay
  setTimeout(() => {
    if (currentIndex.value < props.category.entries.length - 1) {
      currentIndex.value++
    } else {
      zikirStore.markCategoryComplete(props.category.id)
    }
  }, 400)
}

function onComplete() {
  // Auto-advance when zikir counter reaches target
  setTimeout(() => {
    if (currentIndex.value < props.category.entries.length - 1) {
      currentIndex.value++
    } else {
      zikirStore.markCategoryComplete(props.category.id)
    }
  }, 600)
}

function prev() {
  if (currentIndex.value > 0) currentIndex.value--
}

function next() {
  if (currentIndex.value < props.category.entries.length - 1) currentIndex.value++
}
</script>
