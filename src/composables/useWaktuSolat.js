/**
 * useWaktuSolat — Fetch Malaysia prayer times from api.waktusolat.app
 *
 * API: GET https://api.waktusolat.app/solat/{zone}
 * Returns monthly prayer data. We pick today's entry by matching date string.
 *
 * Time strings are "HH:MM:SS" — parsed into today's Date objects.
 * API field `syuruk` is mapped to `sunrise` for PrayerGrid compatibility.
 * Hijri date is extracted from the same entry.
 *
 * In-memory cache: { [zone:YYYY-MM-DD]: result } — prevents repeated fetches.
 */

const BASE_URL = 'https://api.waktusolat.app'
const _cache = {}

/**
 * Parse "HH:MM:SS" time string into today's Date object.
 * @param {string} timeStr e.g. "05:32:00"
 * @returns {Date}
 */
function parseTime(timeStr) {
  const [h, m, s] = timeStr.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, s, 0)
  return d
}

/**
 * Parse hijri string "YYYY-MM-DD" into { day, month, year, monthName }
 * @param {string} hijri e.g. "1447-10-13"
 */
const HIJRI_MONTHS = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
]

function parseHijri(hijriStr) {
  if (!hijriStr) return null
  const [year, month, day] = hijriStr.split('-').map(Number)
  return {
    day,
    month,
    year,
    monthName: HIJRI_MONTHS[month - 1] || '',
  }
}

/**
 * Get today's date string in "DD-Mon-YYYY" format (matching API's date field).
 * e.g. "02-Apr-2026"
 */
function getTodayDateStr() {
  const now = new Date()
  return now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).replace(/ /g, '-')
}

/**
 * Fetch today's prayer times for a given JAKIM zone.
 *
 * @param {string} zoneCode e.g. 'SWK08'
 * @returns {Promise<{ times: object, hijriDate: object|null, zone: string }>}
 *   times: { fajr, sunrise, dhuhr, asr, maghrib, isha } — Date objects
 *   hijriDate: { day, month, year, monthName } or null
 */
export async function fetchWaktuSolat(zoneCode) {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const cacheKey = `${zoneCode}:${today}`

  if (_cache[cacheKey]) return _cache[cacheKey]

  const res = await fetch(`${BASE_URL}/solat/${zoneCode}`)
  if (!res.ok) throw new Error(`waktusolat.app error: ${res.status}`)

  const data = await res.json()
  const prayerTime = data.prayerTime || []

  // Find today's entry by matching date string like "02-Apr-2026"
  const todayStr = getTodayDateStr()
  let entry = prayerTime.find(p => p.date === todayStr)

  // Fallback: match by hijri date (YYYY-MM-DD)
  if (!entry) {
    entry = prayerTime.find(p => p.hijri === today)
  }

  // Fallback: use first entry if nothing matched (shouldn't happen)
  if (!entry && prayerTime.length > 0) {
    entry = prayerTime[0]
  }

  if (!entry) {
    throw new Error(`No prayer time entry found for today (${todayStr}) in zone ${zoneCode}`)
  }

  const times = {
    fajr:    parseTime(entry.fajr),
    sunrise: parseTime(entry.syuruk),   // API uses 'syuruk', map to 'sunrise'
    dhuhr:   parseTime(entry.dhuhr),
    asr:     parseTime(entry.asr),
    maghrib: parseTime(entry.maghrib),
    isha:    parseTime(entry.isha),
  }

  const result = {
    times,
    hijriDate: parseHijri(entry.hijri),
    zone: zoneCode,
  }

  _cache[cacheKey] = result
  return result
}
