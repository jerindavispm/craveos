const STORAGE_KEY = 'craveos:location:v1'

const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82])
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86])
const THUNDER_CODES = new Set([95, 96, 99])
const FOG_CODES = new Set([45, 48])
const PARTLY_CLOUDY = new Set([1, 2, 3])

export const DEFAULT_LOCATION = {
  lat: 12.9716,
  lon: 77.5946,
  name: 'Bangalore, Karnataka, IN',
}

export function getStoredLocation() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredLocation(loc) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loc))
}

export function clearStoredLocation() {
  localStorage.removeItem(STORAGE_KEY)
}

export async function searchCity(query) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Geocoding failed')
  const data = await res.json()
  return (data.results || []).map((r) => ({
    lat: r.latitude,
    lon: r.longitude,
    name: [r.name, r.admin1, r.country_code].filter(Boolean).join(', '),
  }))
}

export async function fetchTomorrowWeather({ lat, lon }) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,precipitation_probability_max,temperature_2m_max,temperature_2m_min&forecast_days=2&timezone=auto`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather fetch failed')
  const data = await res.json()
  const idx = (data.daily?.weather_code?.length ?? 0) > 1 ? 1 : 0
  const code = data.daily.weather_code[idx]
  const precipProb = data.daily.precipitation_probability_max?.[idx] ?? 0
  const tempMax = data.daily.temperature_2m_max?.[idx]
  const tempMin = data.daily.temperature_2m_min?.[idx]
  return {
    code,
    label: labelFor(code),
    precipProb,
    tempMax,
    tempMin,
    rainy: RAIN_CODES.has(code) || THUNDER_CODES.has(code) || precipProb >= 60,
    snowy: SNOW_CODES.has(code),
  }
}

function labelFor(code) {
  if (code === 0) return 'Clear'
  if (PARTLY_CLOUDY.has(code)) return 'Partly cloudy'
  if (FOG_CODES.has(code)) return 'Fog'
  if (RAIN_CODES.has(code)) return 'Rain'
  if (SNOW_CODES.has(code)) return 'Snow'
  if (THUNDER_CODES.has(code)) return 'Thunderstorm'
  return 'Mixed'
}

export function detectBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation unavailable'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, name: 'Current location' }),
      (err) => reject(err),
      { timeout: 8000, enableHighAccuracy: false },
    )
  })
}
