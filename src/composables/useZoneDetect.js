/**
 * useZoneDetect — Detect nearest JAKIM prayer zone from GPS coordinates.
 *
 * Strategy: Compare against a hardcoded centroid table (one lat/lon per zone).
 * Uses squared Euclidean distance — sufficient accuracy for zone-level granularity.
 * Returns null if the coordinates fall outside Malaysia's bounding box.
 */

// Malaysia bounding box (roughly)
const MY_BOUNDS = { latMin: 0.8, latMax: 7.4, lonMin: 99.6, lonMax: 119.3 }

/**
 * Zone centroids — representative lat/lon for each JAKIM zone.
 * Coordinates are approximate centres of each zone's coverage area.
 */
const ZONE_CENTROIDS = [
  // Johor
  { code: 'JHR01', lat: 2.463,  lon: 104.283 }, // Pulau Aur
  { code: 'JHR02', lat: 1.531,  lon: 103.773 }, // Johor Bahru area
  { code: 'JHR03', lat: 1.869,  lon: 103.326 }, // Kluang, Pontian
  { code: 'JHR04', lat: 2.025,  lon: 102.934 }, // Batu Pahat, Muar, Segamat

  // Kedah
  { code: 'KDH01', lat: 6.121,  lon: 100.369 }, // Kota Setar, Kubang Pasu
  { code: 'KDH02', lat: 5.842,  lon: 100.499 }, // Kuala Muda, Yan, Pendang
  { code: 'KDH03', lat: 5.980,  lon: 100.862 }, // Padang Terap, Sik
  { code: 'KDH04', lat: 5.679,  lon: 100.909 }, // Baling
  { code: 'KDH05', lat: 5.432,  lon: 100.578 }, // Bandar Baharu, Kulim
  { code: 'KDH06', lat: 6.350,  lon: 99.850  }, // Langkawi
  { code: 'KDH07', lat: 5.798,  lon: 100.433 }, // Puncak Gunung Jerai

  // Kelantan
  { code: 'KTN01', lat: 6.125,  lon: 102.234 }, // Kota Bharu area
  { code: 'KTN02', lat: 4.883,  lon: 101.969 }, // Gua Musang, Jeli

  // Melaka
  { code: 'MLK01', lat: 2.196,  lon: 102.238 }, // Seluruh Melaka

  // Negeri Sembilan
  { code: 'NGS01', lat: 2.476,  lon: 102.376 }, // Tampin, Jempol
  { code: 'NGS02', lat: 2.733,  lon: 102.181 }, // Jelebu, Kuala Pilah, Rembau
  { code: 'NGS03', lat: 2.713,  lon: 101.946 }, // Port Dickson, Seremban

  // Pahang
  { code: 'PHG01', lat: 2.800,  lon: 104.167 }, // Pulau Tioman
  { code: 'PHG02', lat: 3.814,  lon: 103.326 }, // Kuantan, Pekan
  { code: 'PHG03', lat: 3.510,  lon: 102.431 }, // Jerantut, Temerloh, Maran
  { code: 'PHG04', lat: 3.789,  lon: 101.956 }, // Bentong, Lipis, Raub
  { code: 'PHG05', lat: 3.449,  lon: 101.790 }, // Genting Sempah area
  { code: 'PHG06', lat: 4.472,  lon: 101.375 }, // Cameron Highlands
  { code: 'PHG07', lat: 2.960,  lon: 103.467 }, // Rompin area

  // Perak
  { code: 'PRK01', lat: 3.730,  lon: 101.366 }, // Tapah, Slim River, Tanjung Malim
  { code: 'PRK02', lat: 4.467,  lon: 101.136 }, // Ipoh, Kuala Kangsar
  { code: 'PRK03', lat: 5.249,  lon: 101.239 }, // Lenggong, Grik
  { code: 'PRK04', lat: 5.545,  lon: 101.381 }, // Temengor, Belum
  { code: 'PRK05', lat: 4.017,  lon: 100.943 }, // Teluk Intan area
  { code: 'PRK06', lat: 4.851,  lon: 100.733 }, // Selama, Taiping area
  { code: 'PRK07', lat: 4.709,  lon: 100.862 }, // Bukit Larut

  // Perlis
  { code: 'PLS01', lat: 6.444,  lon: 100.198 }, // Seluruh Perlis

  // Pulau Pinang
  { code: 'PNG01', lat: 5.414,  lon: 100.329 }, // Seluruh P. Pinang

  // Sabah
  { code: 'SBH01', lat: 5.828,  lon: 118.117 }, // Sandakan Timur
  { code: 'SBH02', lat: 5.491,  lon: 117.500 }, // Beluran, Telupid area
  { code: 'SBH03', lat: 4.500,  lon: 118.350 }, // Lahad Datu, Semporna
  { code: 'SBH04', lat: 4.250,  lon: 117.890 }, // Tawau Barat
  { code: 'SBH05', lat: 6.884,  lon: 116.838 }, // Kudat
  { code: 'SBH06', lat: 6.075,  lon: 116.558 }, // Gunung Kinabalu
  { code: 'SBH07', lat: 5.979,  lon: 116.072 }, // Kota Kinabalu area
  { code: 'SBH08', lat: 5.070,  lon: 116.188 }, // Keningau, Pendalaman Atas
  { code: 'SBH09', lat: 5.349,  lon: 115.722 }, // Beaufort, Sipitang

  // Sarawak
  { code: 'SWK01', lat: 4.738,  lon: 115.000 }, // Limbang, Lawas
  { code: 'SWK02', lat: 4.400,  lon: 113.991 }, // Miri
  { code: 'SWK03', lat: 3.169,  lon: 113.044 }, // Bintulu area
  { code: 'SWK04', lat: 2.306,  lon: 111.829 }, // Sibu, Mukah
  { code: 'SWK05', lat: 2.132,  lon: 111.517 }, // Sarikei area
  { code: 'SWK06', lat: 1.517,  lon: 111.456 }, // Sri Aman, Betong
  { code: 'SWK07', lat: 1.260,  lon: 110.997 }, // Serian, Samarahan
  { code: 'SWK08', lat: 1.553,  lon: 110.359 }, // Kuching, Bau, Lundu, Sematan
  { code: 'SWK09', lat: 2.000,  lon: 111.800 }, // Zon Khas Patarikan

  // Selangor
  { code: 'SGR01', lat: 3.212,  lon: 101.673 }, // KL area, Shah Alam, Gombak
  { code: 'SGR02', lat: 3.484,  lon: 101.252 }, // Kuala Selangor, Sabak Bernam
  { code: 'SGR03', lat: 2.990,  lon: 101.359 }, // Klang, Kuala Langat

  // Terengganu
  { code: 'TRG01', lat: 5.313,  lon: 103.143 }, // Kuala Terengganu
  { code: 'TRG02', lat: 5.794,  lon: 102.561 }, // Besut, Setiu
  { code: 'TRG03', lat: 4.946,  lon: 102.812 }, // Hulu Terengganu
  { code: 'TRG04', lat: 4.262,  lon: 103.425 }, // Dungun, Kemaman

  // Wilayah Persekutuan
  { code: 'WLY01', lat: 3.148,  lon: 101.687 }, // KL, Putrajaya
  { code: 'WLY02', lat: 5.283,  lon: 115.238 }, // Labuan
]

/**
 * Returns true if coords are within Malaysia's bounding box.
 * @param {number} lat
 * @param {number} lon
 * @returns {boolean}
 */
function isInMalaysia(lat, lon) {
  return (
    lat >= MY_BOUNDS.latMin &&
    lat <= MY_BOUNDS.latMax &&
    lon >= MY_BOUNDS.lonMin &&
    lon <= MY_BOUNDS.lonMax
  )
}

/**
 * Detect the nearest JAKIM zone code for given coordinates.
 * Returns null if the coordinates are outside Malaysia.
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {string|null} JAKIM zone code (e.g. 'SWK08') or null
 */
export function detectZone(lat, lon) {
  if (!isInMalaysia(lat, lon)) return null

  let nearest = null
  let minDist = Infinity

  for (const zone of ZONE_CENTROIDS) {
    const dLat = zone.lat - lat
    const dLon = zone.lon - lon
    const dist = dLat * dLat + dLon * dLon
    if (dist < minDist) {
      minDist = dist
      nearest = zone.code
    }
  }

  return nearest
}
