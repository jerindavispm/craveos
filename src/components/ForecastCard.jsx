import { useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, CloudRain, Sun, Info } from 'lucide-react'
import CountUp from './CountUp'

const CONFIDENCE_STYLES = {
  none: 'border-neutral-700/60 bg-neutral-800/40 text-neutral-400',
  'very-low': 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  low: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  medium: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  good: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  strong: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200',
}

export default function ForecastCard({ forecast, rainy, onToggleRain }) {
  const { dayLabel, items, summary, revenueLow, revenueHigh, date, confidence } = forecast
  const dateStr = date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative overflow-hidden rounded-2xl border border-orange-400/20 bg-gradient-to-br from-neutral-900 to-neutral-900/60 p-6"
    >
      <AnimatePresence>{rainy && <RainOverlay />}</AnimatePresence>
      <AnimatePresence>{!rainy && <ClearGlow />}</AnimatePresence>

      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-orange-300">
              <motion.span
                animate={{ rotate: [0, 12, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex"
              >
                <Sparkles size={14} />
              </motion.span>
              AI Forecast
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{dateStr}</h2>
            {confidence && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${CONFIDENCE_STYLES[confidence.level] || CONFIDENCE_STYLES.none}`}>
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-50" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-current" />
                  </span>
                  AI confidence · {confidence.label}
                </span>
                {confidence.message && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                    <Info size={11} /> {confidence.message}
                  </span>
                )}
              </div>
            )}
          </div>

          <WeatherToggle rainy={rainy} onToggle={onToggleRain} />
        </div>

        <motion.p
          key={summary}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-4 text-sm leading-relaxed text-neutral-200"
        >
          {summary}
        </motion.p>

        {items.length > 0 && (
          <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950/50 p-4">
            <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-neutral-500">
              <span>Prep plan</span>
              <span className="tabular-nums">
                Revenue est.{' '}
                <CountUp value={revenueLow} format={(v) => `$${Math.round(v).toLocaleString()}`} />
                {'–'}
                <CountUp value={revenueHigh} format={(v) => `$${Math.round(v).toLocaleString()}`} />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {items.slice(0, 9).map((i, idx) => (
                  <motion.div
                    key={i.name}
                    layout
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3, delay: idx * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
                    className="flex items-baseline justify-between gap-2 rounded-lg border border-transparent bg-neutral-900/60 px-3 py-2 transition hover:border-orange-400/20"
                  >
                    <span className="truncate text-sm text-neutral-300">{i.name}</span>
                    <span className="text-lg font-semibold tabular-nums text-orange-300">
                      <CountUp value={i.forecast} duration={0.5} format={(v) => Math.round(v).toString()} />
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  )
}

function WeatherToggle({ rainy, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`relative inline-flex h-9 items-center gap-2 overflow-hidden rounded-full border px-4 text-xs font-medium transition-colors ${
        rainy
          ? 'border-blue-400/40 bg-blue-400/10 text-blue-200'
          : 'border-neutral-700 bg-neutral-900/60 text-neutral-300 hover:border-neutral-500'
      }`}
    >
      <AnimatePresence mode="wait">
        {rainy ? (
          <motion.span
            key="rain"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <CloudRain size={14} /> Rainy day
          </motion.span>
        ) : (
          <motion.span
            key="clear"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <Sun size={14} /> Clear day
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function RainOverlay() {
  const drops = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        left: Math.random() * 100,
        duration: 0.55 + Math.random() * 0.55,
        delay: -Math.random() * 2,
        opacity: 0.25 + Math.random() * 0.45,
        height: 14 + Math.random() * 18,
      })),
    [],
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="pointer-events-none absolute inset-0 z-0"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-blue-500/5" />
      <div className="absolute inset-0 overflow-hidden">
        {drops.map((d, i) => (
          <motion.span
            key={i}
            initial={{ y: '-20%', opacity: 0 }}
            animate={{ y: '120%', opacity: [0, d.opacity, d.opacity, 0] }}
            transition={{
              duration: d.duration,
              delay: d.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              left: `${d.left}%`,
              width: 1,
              height: d.height,
              background: 'linear-gradient(180deg, transparent, rgba(147,197,253,0.7), transparent)',
            }}
            className="absolute top-0"
          />
        ))}
      </div>
    </motion.div>
  )
}

function ClearGlow() {
  const motes = useMemo(() => {
    const palette = [
      { core: 'rgba(254,215,170,0.95)', halo: 'rgba(251,146,60,0.55)' },
      { core: 'rgba(254,243,199,0.95)', halo: 'rgba(245,158,11,0.55)' },
      { core: 'rgba(253,186,116,0.95)', halo: 'rgba(234,88,12,0.55)' },
    ]
    return Array.from({ length: 42 }, () => {
      const r = Math.random()
      const size = r < 0.5 ? 1.8 + Math.random() * 1.5 : r < 0.85 ? 3 + Math.random() * 2 : 5 + Math.random() * 2.5
      const swing = 6 + Math.random() * 18
      const dir1 = Math.random() < 0.5 ? 1 : -1
      const dir2 = Math.random() < 0.5 ? 1 : -1
      return {
        left: 4 + Math.random() * 92,
        duration: 12 + Math.random() * 14,
        delay: -Math.random() * 22,
        size,
        opacity: 0.35 + Math.random() * 0.55,
        xPath: [0, swing * dir1 * 0.3, swing * dir2 * 0.65, swing * dir1 * 0.45, swing * dir2 * 0.8],
        color: palette[Math.floor(Math.random() * palette.length)],
        flicker: Math.random() < 0.7,
        rotate: -8 + Math.random() * 16,
      }
    })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pointer-events-none absolute inset-0 z-0"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(251,146,60,0.10) 0%, rgba(254,215,170,0.05) 35%, transparent 75%, rgba(251,146,60,0.06) 100%)',
        }}
      />

      <motion.div
        animate={{ opacity: [0.55, 0.9, 0.55], scale: [1, 1.05, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0"
        style={{ background: 'radial-gradient(55% 50% at 75% 5%, rgba(251,146,60,0.22), transparent 65%)' }}
      />

      <motion.div
        animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.04, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute inset-0"
        style={{ background: 'radial-gradient(45% 55% at 15% 100%, rgba(245,158,11,0.15), transparent 65%)' }}
      />

      <motion.div
        animate={{ x: ['-110%', '110%'], opacity: [0, 0.3, 0] }}
        transition={{ duration: 6, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
        className="absolute inset-y-0 w-full"
        style={{
          background:
            'linear-gradient(110deg, transparent 38%, rgba(254,243,199,0.4) 50%, transparent 62%)',
          filter: 'blur(2px)',
        }}
      />
      <div className="absolute inset-3 overflow-hidden rounded-xl">
        {motes.map((m, i) => (
          <motion.span
            key={i}
            initial={{ top: '-8%', x: 0, opacity: 0, scale: 0.4 }}
            animate={{
              top: '108%',
              x: m.xPath,
              opacity: m.flicker
                ? [0, m.opacity, m.opacity * 0.5, m.opacity * 0.9, m.opacity * 0.55, 0]
                : [0, m.opacity, m.opacity * 0.85, m.opacity * 0.55, 0],
              scale: [0.4, 0.9, 1.05, 0.95, 0.5],
              rotate: m.rotate,
            }}
            transition={{
              duration: m.duration,
              delay: m.delay,
              repeat: Infinity,
              ease: [0.25, 0.1, 0.55, 1],
            }}
            style={{
              left: `${m.left}%`,
              width: m.size,
              height: m.size,
              background: `radial-gradient(circle, ${m.color.core}, ${m.color.halo} 50%, transparent 75%)`,
              boxShadow: `0 0 ${Math.max(4, m.size * 1.7)}px ${m.color.halo}`,
            }}
            className="absolute rounded-full"
          />
        ))}
      </div>
    </motion.div>
  )
}
