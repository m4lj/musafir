import { useLocationStore } from '@/stores/useLocationStore.js'

/**
 * Requests geolocation and updates the location store.
 * Returns a promise that resolves when location is obtained or rejects on error.
 */
export function useGeolocation() {
  const locationStore = useLocationStore()

  async function requestLocation() {
    if (!navigator.geolocation) {
      locationStore.setError('Geolocation is not supported by your browser.')
      locationStore.setPermission('denied')
      return
    }

    locationStore.setLoading(true)

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          locationStore.setCoords(latitude, longitude)
          resolve({ lat: latitude, lon: longitude })
        },
        (err) => {
          let msg = 'Unable to get your location.'
          if (err.code === 1) {
            msg = 'Location permission denied. Please allow location access.'
            locationStore.setPermission('denied')
          } else if (err.code === 2) {
            msg = 'Location unavailable. Check your GPS or network.'
          } else if (err.code === 3) {
            msg = 'Location request timed out. Please try again.'
          }
          locationStore.setError(msg)
          locationStore.setLoading(false)
          reject(new Error(msg))
        },
        { timeout: 10000, maximumAge: 300000 }
      )
    })
  }

  return { requestLocation }
}
