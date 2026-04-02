<template>
  <div v-if="nextPrayer" class="mx-4 mt-3 bg-gradient-to-r from-yellow-900/40 to-amber-900/30 border border-gold/30 rounded-2xl p-5">
    <p class="text-xs text-gold font-medium uppercase tracking-wider mb-1">Next Prayer</p>
    <div class="flex items-end justify-between">
      <div>
        <p class="text-3xl font-bold text-white">{{ nextPrayer.displayName }}</p>
        <p class="text-gold text-sm mt-1">{{ formatTime(nextPrayer.time) }}</p>
      </div>
      <div class="text-right">
        <p class="text-xs text-gray-400 mb-0.5">in</p>
        <p class="text-2xl font-mono font-bold text-white">{{ countdown }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  nextPrayer: { type: Object, default: null },
  countdown: { type: String, default: '--:--:--' },
})

function formatTime(d) {
  if (!d) return '--:--'
  return d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: true })
}
</script>
