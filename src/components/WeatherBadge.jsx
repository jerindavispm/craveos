import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CloudRain, Sun, CloudSnow, Cloud, CloudFog, CloudLightning, Cloudy, MapPin, Locate, Search, Loader2 } from 'lucide-react'
import {
  DEFAULT_LOCATION,
  getStoredLocation,
  setStoredLocation,
  searchCity,
  fetchTomorrowWeather,
  detectBrowserLocation,
} from '../lib/weather'

const ICONS = {
  Clear: Sun,
  'Partly cloudy': Cloudy,
  Fog: CloudFog,
  Rain: CloudRain,
  Snow: CloudSnow,
  Thunderstorm: CloudLightning,
  Mixed: Cloud,
}

export default function WeatherBadge({ onWeather }) {
  const [location, setLocation] = useState(() => getStoredLocation() || DEFAULT_LOCATION)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchTomorrowWeather(location)
      .then((w) => {
        if (cancelled) return
        setWeather(w)
        onWeather?.(w)
      })
      .catch(() => { if (!cancelled) setWeather(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [location.lat, location.lon])

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const pickLocation = (loc) => {
    setStoredLocation(loc)
    setLocation(loc)
    setOpen(false)
  }

  const Icon = weather ? ICONS[weather.label] || Cloud : Cloud

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Weather${weather ? `: ${weather.label}` : ''} · ${location.name}`}
        className="inline-flex items-center gap-2 rounded-full border border-neutral-700/80 bg-neutral-950/60 px-2 py-1.5 text-xs text-neutral-300 backdrop-blur transition hover:border-orange-400/40 sm:px-3"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin text-neutral-500" />
        ) : (
          <Icon size={14} className={weather?.rainy ? 'text-blue-300' : 'text-orange-300'} />
        )}
        <span className="hidden tabular-nums sm:inline">
          {weather ? `${Math.round(weather.tempMax)}° · ${weather.label}` : '— · weather'}
        </span>
        <span className="hidden text-neutral-600 sm:inline">·</span>
        <span className="hidden max-w-[110px] truncate text-neutral-400 sm:inline">{location.name}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-40 mt-1.5 w-72 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl"
          >
            <LocationPicker onPick={pickLocation} current={location} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function LocationPicker({ onPick, current }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!q.trim()) { setResults([]); return }
    let cancelled = false
    setBusy(true)
    const t = setTimeout(() => {
      searchCity(q.trim())
        .then((r) => { if (!cancelled) setResults(r) })
        .catch(() => { if (!cancelled) setResults([]) })
        .finally(() => { if (!cancelled) setBusy(false) })
    }, 250)
    return () => { cancelled = true; clearTimeout(t) }
  }, [q])

  const useGeolocation = async () => {
    try {
      const loc = await detectBrowserLocation()
      onPick(loc)
    } catch {
      alert('Could not get your location. Try the city search below.')
    }
  }

  return (
    <div>
      <div className="border-b border-neutral-900 p-3">
        <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
          Currently: {current.name}
        </div>
        <button
          onClick={useGeolocation}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-400 px-3 py-2 text-xs font-semibold text-neutral-950 transition hover:bg-orange-300"
        >
          <Locate size={13} /> Use my location
        </button>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search city…"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-2 pl-8 pr-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-orange-400/50 focus:outline-none"
          />
          {busy && (
            <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-neutral-500" />
          )}
        </div>

        {results.length > 0 && (
          <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900/60">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  onClick={() => onPick(r)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-200 transition hover:bg-neutral-800"
                >
                  <MapPin size={12} className="text-orange-300" />
                  <span className="truncate">{r.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
