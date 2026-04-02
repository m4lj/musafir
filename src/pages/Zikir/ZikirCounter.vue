<template>
  <div class="mt-4">
    <!-- Counter display -->
    <div class="text-center mb-3">
      <p class="text-4xl font-bold text-gold">{{ count }}</p>
      <p class="text-xs text-gray-500 mt-1">/ {{ target }}</p>
    </div>

    <!-- Progress bar -->
    <div class="h-2 bg-midnight-700 rounded-full overflow-hidden mb-4">
      <div
        class="h-full bg-gold rounded-full transition-all duration-300"
        :style="{ width: `${Math.min((count / target) * 100, 100)}%` }"
      />
    </div>

    <!-- Tap button -->
    <button
      class="w-full py-4 rounded-xl font-semibold text-lg active:scale-95 transition-transform"
      :class="isComplete ? 'bg-accent/20 border-2 border-accent text-accent' : 'bg-gold text-midnight-950'"
      :disabled="isComplete"
      @click="tap"
      @contextmenu.prevent="resetCount"
    >
      {{ isComplete ? '✓ Complete' : 'Tap' }}
    </button>

    <p v-if="!isComplete" class="text-center text-xs text-gray-600 mt-2">Long press to reset</p>
    <p v-else class="text-center text-xs text-accent mt-2">✓ Completed! Great work.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useZikirStore } from '@/stores/useZikirStore.js'

const props = defineProps({
  entryId: { type: String, required: true },
  target: { type: Number, required: true },
})

const emit = defineEmits(['complete'])
const zikirStore = useZikirStore()

const count = computed(() => zikirStore.getCount(props.entryId))
const isComplete = computed(() => count.value >= props.target)

function tap() {
  if (isComplete.value) return
  zikirStore.increment(props.entryId)
  if (navigator.vibrate) navigator.vibrate(10)
  if (count.value >= props.target) {
    emit('complete')
  }
}

function resetCount() {
  zikirStore.reset(props.entryId)
}
</script>
