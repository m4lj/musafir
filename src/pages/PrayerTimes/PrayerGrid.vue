<template>
  <div class="mx-4 mt-3 bg-midnight-800 border border-midnight-700 rounded-2xl overflow-hidden">
    <div
      v-for="prayer in prayerList"
      :key="prayer.key"
      class="flex items-center px-4 py-3.5 border-b border-midnight-700 last:border-0 transition-colors"
      :class="isNext(prayer.key) ? 'border-l-4 border-l-gold bg-gold/5' : ''"
    >
      <span class="text-xl w-8">{{ prayer.icon }}</span>
      <div class="flex-1 ml-3">
        <p class="text-white text-sm font-medium">{{ prayer.label }}</p>
        <p v-if="prayer.note" class="text-xs text-gray-500">{{ prayer.note }}</p>
      </div>
      <div class="text-right">
        <p class="text-white text-sm font-mono">{{ formatTime(times[prayer.key]) }}</p>
        <p v-if="isNext(prayer.key)" class="text-xs text-gold">Next</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  times: { type: Object, required: true },
  nextPrayer: { type: Object, default: null },
})

const prayerList = [
  { key: 'fajr',    label: 'Fajr',    icon: '🌙' },
  { key: 'sunrise', label: 'Sunrise', icon: '🌅', note: 'Not counted in countdown' },
  { key: 'dhuhr',   label: 'Dhuhr',   icon: '☀️' },
  { key: 'asr',     label: 'Asr',     icon: '🌤️' },
  { key: 'maghrib', label: 'Maghrib', icon: '🌇' },
  { key: 'isha',    label: 'Isha',    icon: '⭐' },
]

function formatTime(d) {
  if (!d) return '--:--'
  return d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function isNext(key) {
  return props.nextPrayer?.name === key
}
</script>
