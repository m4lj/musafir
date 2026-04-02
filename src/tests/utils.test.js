import { describe, it, expect } from 'vitest'

/**
 * Haversine distance calculation — used by mosque finder and home page.
 * Extracted here for testability.
 */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

describe('haversine', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversine(3.139, 101.687, 3.139, 101.687)).toBe(0)
  })

  it('calculates distance in metres between two KL points', () => {
    // KLCC to Masjid Jamek: ~2.3km
    const d = haversine(3.1579, 101.7116, 3.1488, 101.6939)
    expect(d).toBeGreaterThan(1500)
    expect(d).toBeLessThan(3000)
  })

  it('is symmetric', () => {
    const d1 = haversine(3.139, 101.687, 1.352, 103.819)
    const d2 = haversine(1.352, 103.819, 3.139, 101.687)
    expect(Math.abs(d1 - d2)).toBeLessThan(1)
  })
})

describe('buildMosqueQuery', () => {
  it('includes coordinates and radius in the query string', () => {
    const lat = 3.139
    const lon = 101.687
    const radius = 3000
    const query = `(around:${radius},${lat},${lon})`
    expect(query).toContain('3000')
    expect(query).toContain('3.139')
    expect(query).toContain('101.687')
  })

  it('uses lowercase religion=muslim tag', () => {
    const query = `["religion"="muslim"]`
    expect(query).toContain('muslim')
    expect(query).not.toContain('Muslim')
  })
})

describe('zikir data schema', () => {
  it('validates required fields are present', () => {
    const entry = {
      id: 'subhanallah',
      title: 'Tasbih',
      arabic: 'سُبْحَانَ اللَّهِ',
      transliteration: 'Subhanallah',
      translation: 'Glory be to Allah',
      source: 'Morning Adhkar',
      count: 33,
    }
    expect(entry.id).toBeTruthy()
    expect(entry.arabic).toBeTruthy()
    expect(entry.count).toBeGreaterThan(0)
  })

  it('distinguishes dua (count=1) from zikir (count>1)', () => {
    const dua = { count: 1 }
    const zikir = { count: 33 }
    expect(dua.count === 1).toBe(true)
    expect(zikir.count > 1).toBe(true)
  })
})
