<template>
  <div ref="mapEl" class="mx-4 rounded-2xl overflow-hidden border border-midnight-700" style="height: 60vh" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const props = defineProps({
  items: { type: Array, default: () => [] },
})

const mapEl = ref(null)
let map = null
let markers = []

function initMap() {
  if (!mapEl.value) return
  map = L.map(mapEl.value).setView([3.139, 101.687], 3)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19,
  }).addTo(map)

  renderMarkers()
}

function renderMarkers() {
  if (!map) return
  markers.forEach(m => m.remove())
  markers = []

  props.items.forEach(item => {
    const color = item.halalStatus === 'certified' ? '#059669' : '#f59e0b'
    const icon = L.divIcon({
      html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;"></div>`,
      iconSize: [12, 12],
      className: '',
    })
    const m = L.marker([item.lat, item.lon], { icon })
      .addTo(map)
      .bindPopup(`<strong>${item.name}</strong><br>${item.city}, ${item.country}`)
    markers.push(m)
  })

  if (markers.length) {
    const group = L.featureGroup(markers)
    map.fitBounds(group.getBounds().pad(0.3))
  }
}

watch(() => props.items, renderMarkers, { deep: true })

onMounted(() => setTimeout(initMap, 50))
onUnmounted(() => { if (map) { map.remove(); map = null } })
</script>
