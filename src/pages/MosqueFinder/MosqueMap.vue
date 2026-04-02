<template>
  <div ref="mapEl" :style="{ height: fullScreen ? 'calc(100vh - 60px)' : height + 'px' }" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet's default icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const props = defineProps({
  mosques: { type: Array, default: () => [] },
  coords: { type: Object, default: null },
  height: { type: Number, default: 120 },
  fullScreen: { type: Boolean, default: false },
})

const mapEl = ref(null)
let map = null
let markers = []

function initMap() {
  if (!mapEl.value) return
  const center = props.coords
    ? [props.coords.lat, props.coords.lon]
    : [3.139, 101.687]  // Default: KL

  map = L.map(mapEl.value, {
    zoomControl: props.fullScreen,
    dragging: props.fullScreen,
    scrollWheelZoom: props.fullScreen,
    doubleClickZoom: props.fullScreen,
    boxZoom: false,
    keyboard: false,
  }).setView(center, 14)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19,
  }).addTo(map)

  // User marker
  if (props.coords) {
    L.circleMarker([props.coords.lat, props.coords.lon], {
      radius: 8,
      color: '#6366f1',
      fillColor: '#6366f1',
      fillOpacity: 0.8,
    }).addTo(map).bindPopup('You are here')
  }

  renderMarkers()
}

function renderMarkers() {
  if (!map) return
  markers.forEach(m => m.remove())
  markers = []

  props.mosques.forEach(mosque => {
    const m = L.marker([mosque.lat, mosque.lon])
      .addTo(map)
      .bindPopup(`<strong>${mosque.name}</strong>`)
    markers.push(m)
  })

  if (props.mosques.length > 0) {
    const group = L.featureGroup(markers)
    map.fitBounds(group.getBounds().pad(0.2))
  }
}

watch(() => props.mosques, renderMarkers, { deep: true })

onMounted(() => {
  // Small delay to let container render
  setTimeout(initMap, 50)
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>
