import { PrayerTimes, Coordinates, CalculationMethod } from 'adhan'
import dayjs from 'dayjs'
import hijriPlugin from 'dayjs-hijri'

// Extend dayjs with hijri calendar support
try {
  dayjs.extend(hijriPlugin)
} catch (_) {}

const METHOD_MAP = {
  JAKIM:   CalculationMethod.Singapore(),    // closest to JAKIM MYS
  MUIS:    CalculationMethod.Singapore(),
  MWL:     CalculationMethod.MuslimWorldLeague(),
  ISNA:    CalculationMethod.NorthAmerica(),
  Egypt:   CalculationMethod.Egyptian(),
  Karachi: CalculationMethod.Karachi(),
  Tehran:  CalculationMethod.Tehran(),
  Gulf:    CalculationMethod.Dubai(),
}

const PRAYER_ICONS = {
  fajr: '🌙',
  sunrise: '🌅',
  dhuhr: '☀️',
  asr: '🌤️',
  maghrib: '🌇',
  isha: '⭐',
}

const FARD_PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

/**
 * Calculate prayer times for given coordinates and method.
 * @param {{ lat: number, lon: number }} coords
 * @param {string} method - calculation method key
 * @returns {{ times, nextPrayer, hijriDate, getCountdown }}
 */
export function usePrayer({ lat, lon }, method = 'JAKIM') {
  const coordinates = new Coordinates(lat, lon)
  const params = METHOD_MAP[method] || METHOD_MAP.JAKIM
  const date = new Date()

  const prayerTimes = new PrayerTimes(coordinates, date, params)

  const times = {
    fajr:    prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr:   prayerTimes.dhuhr,
    asr:     prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha:    prayerTimes.isha,
  }

  function formatTime(d) {
    if (!d) return '--:--'
    return d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  function getNextFardPrayer() {
    const now = new Date()
    for (const name of FARD_PRAYERS) {
      if (times[name] > now) {
        return { name, time: times[name], displayName: name.charAt(0).toUpperCase() + name.slice(1) }
      }
    }
    // All prayers passed — next is tomorrow's Fajr (approximate)
    const tomorrowFajr = new Date(times.fajr.getTime() + 24 * 60 * 60 * 1000)
    return { name: 'fajr', time: tomorrowFajr, displayName: 'Fajr' }
  }

  let _nextPrayer = getNextFardPrayer()

  function getCountdown() {
    _nextPrayer = getNextFardPrayer()
    const diff = _nextPrayer.time - new Date()
    if (diff <= 0) return '00:00:00'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function getHijriDate() {
    try {
      const hijri = dayjs().iYear
        ? dayjs()
        : null
      // dayjs-hijri exposes iYear(), iMonth(), iDate(), iMonthName()
      if (hijri !== null && typeof dayjs().iYear === 'function') {
        const d = dayjs()
        return {
          day: d.iDate(),
          month: d.iMonth() + 1,
          year: d.iYear(),
          monthName: d.iMonthName(),
        }
      }
    } catch (_) {}
    return null
  }

  return {
    times,
    get nextPrayer() { return _nextPrayer },
    hijriDate: getHijriDate(),
    getCountdown,
    formatTime,
    icons: PRAYER_ICONS,
    fardPrayers: FARD_PRAYERS,
  }
}
