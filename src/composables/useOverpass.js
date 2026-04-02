/**
 * Overpass API wrapper with 3-mirror fallback.
 * Mirrors tried sequentially — first success wins.
 * Unified 25s timeout on both fetch and Overpass query.
 */

const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]

const TIMEOUT_MS = 25000

// Session cache: key → { data, timestamp }
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000  // 5 minutes

/**
 * Build mosque query string.
 * @param {number} lat
 * @param {number} lon
 * @param {number} radius - metres
 * @returns {string}
 */
export function buildMosqueQuery(lat, lon, radius) {
  return `[out:json][timeout:25];
(
  node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
  way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
  node["amenity"="place_of_worship"]["religion"="Islam"](around:${radius},${lat},${lon});
  way["amenity"="place_of_worship"]["religion"="Islam"](around:${radius},${lat},${lon});
);
out center;`
}

/**
 * Run an Overpass query with mirror fallback.
 * @param {string} query - Overpass QL query
 * @param {string} cacheKey - unique key for session caching
 * @returns {Promise<object[]>} - array of OSM elements
 */
export async function useOverpass(query, cacheKey) {
  // Check cache
  if (cacheKey && cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey)
    if (Date.now() - timestamp < CACHE_TTL) {
      return data
    }
    cache.delete(cacheKey)
  }

  let lastError = null

  for (const mirror of MIRRORS) {
    try {
      const controller = new AbortController()
      const timerId = setTimeout(() => controller.abort(), TIMEOUT_MS)

      const response = await fetch(mirror, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      })

      clearTimeout(timerId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${mirror}`)
      }

      const json = await response.json()
      const elements = json.elements || []

      // Normalise way elements (use center coords)
      const normalised = elements.map(el => ({
        id: el.id,
        lat: el.lat ?? el.center?.lat,
        lon: el.lon ?? el.center?.lon,
        name: el.tags?.name || el.tags?.['name:en'] || 'Unnamed Mosque',
        tags: el.tags || {},
      })).filter(el => el.lat && el.lon)

      // Cache result
      if (cacheKey) {
        cache.set(cacheKey, { data: normalised, timestamp: Date.now() })
      }

      return normalised
    } catch (err) {
      lastError = err
      // Try next mirror
    }
  }

  throw new Error(`All Overpass mirrors failed: ${lastError?.message}`)
}
