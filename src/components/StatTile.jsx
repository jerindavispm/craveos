import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import CountUp from './CountUp'

const VIBE_CLASS = {
  good: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  bad: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  neutral: 'bg-neutral-800/80 text-neutral-400 border border-neutral-700/60',
}

function TrendIcon({ trend }) {
  if (trend === 'up') return <ArrowUp size={10} strokeWidth={2.5} />
  if (trend === 'down') return <ArrowDown size={10} strokeWidth={2.5} />
  return <Minus size={10} strokeWidth={2.5} />
}

export default function StatTile({ label, value, format, hint, insight, Icon, iconAnim, accent = false, index = 0 }) {
  const isNumeric = typeof value === 'number'
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 })

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    setTilt({ rx: (0.5 - py) * 4, ry: (px - 0.5) * 4, mx: px * 100, my: py * 100 })
  }
  const onLeave = () => {
    setTilt({ rx: 0, ry: 0, mx: 50, my: 50 })
    setHovered(false)
  }

  const iconAnimation =
    iconAnim === 'rotate'
      ? { rotate: 360 }
      : iconAnim === 'pulse'
      ? { scale: [1, 1.15, 1, 1.1, 1] }
      : iconAnim === 'glow'
      ? { opacity: [0.7, 1, 0.85, 1, 0.75] }
      : iconAnim === 'bob'
      ? { y: [0, -2, 0, 2, 0] }
      : {}
  const iconTransition =
    iconAnim === 'rotate'
      ? { duration: 10, repeat: Infinity, ease: 'linear' }
      : iconAnim === 'pulse'
      ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
      : iconAnim === 'glow'
      ? { duration: 4, repeat: Infinity, ease: 'easeInOut' }
      : iconAnim === 'bob'
      ? { duration: 5, repeat: Infinity, ease: 'easeInOut' }
      : {}

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 + index * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -4 }}
      style={{
        zIndex: popoverOpen ? 40 : undefined,
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        '--mx': `${tilt.mx}%`,
        '--my': `${tilt.my}%`,
      }}
      className={`group relative rounded-2xl border p-5 transition-colors duration-300 ${
        accent ? 'border-orange-400/30 bg-orange-400/5' : 'border-neutral-800 bg-neutral-900/40'
      } hover:border-orange-400/50`}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(220px circle at var(--mx) var(--my), rgba(251,146,60,0.12), transparent 70%)' }}
      />

      <div className="relative flex items-center gap-2">
        {Icon && (
          <motion.div
            animate={hovered ? { scale: 1.12 } : { scale: 1 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative flex size-7 items-center justify-center rounded-lg border border-orange-400/25 bg-gradient-to-br from-orange-400/15 to-amber-500/5"
          >
            <motion.span
              animate={iconAnimation}
              transition={iconTransition}
              className="flex items-center justify-center text-orange-300"
            >
              <Icon size={13} strokeWidth={2.3} />
            </motion.span>
            <motion.div
              aria-hidden
              animate={hovered ? { opacity: 1, scale: 1.5 } : { opacity: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 -z-10 rounded-lg"
              style={{ boxShadow: '0 0 18px 4px rgba(251,146,60,0.45)' }}
            />
          </motion.div>
        )}
        <div className="text-xs font-medium uppercase tracking-wider text-neutral-500">{label}</div>
      </div>

      <div className={`relative mt-2 text-2xl font-semibold tracking-tight tabular-nums ${accent ? 'text-orange-300' : 'text-neutral-100'}`}>
        {isNumeric ? <CountUp value={value} format={format || ((v) => Math.round(v).toLocaleString())} /> : value}
      </div>

      {insight ? (
        <div className="relative mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium tabular-nums ${VIBE_CLASS[insight.vibe] || VIBE_CLASS.neutral}`}
          >
            <TrendIcon trend={insight.trend} />
            {insight.delta}
          </motion.span>
          {insight.note &&
            (insight.detail ? (
              <HoverDetail note={insight.note} detail={insight.detail} onOpenChange={setPopoverOpen} />
            ) : (
              <span className="truncate text-neutral-500">{insight.note}</span>
            ))}
        </div>
      ) : (
        hint && <div className="relative mt-1 text-xs text-neutral-500">{hint}</div>
      )}

      <motion.div
        aria-hidden
        initial={false}
        animate={hovered ? { scaleX: 1, opacity: 1 } : { scaleX: 0.4, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="pointer-events-none absolute bottom-px left-4 right-4 h-px origin-center"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, rgba(251,146,60,0.85) 30%, rgba(252,211,77,0.95) 50%, rgba(251,146,60,0.85) 70%, transparent 100%)',
        }}
      />
    </motion.div>
  )
}

function HoverDetail({ note, detail, onOpenChange }) {
  const [open, setOpen] = useState(false)
  const change = (v) => { setOpen(v); onOpenChange?.(v) }
  return (
    <span
      className="relative inline-flex cursor-help"
      onMouseEnter={() => change(true)}
      onMouseLeave={() => change(false)}
      onFocus={() => change(true)}
      onBlur={() => change(false)}
      tabIndex={0}
    >
      <span className="border-b border-dotted border-neutral-600 text-neutral-400 transition-colors hover:text-neutral-200">
        {note}
      </span>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute left-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/95 shadow-2xl backdrop-blur"
          >
            <div className="border-b border-neutral-900 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
              {detail.title}
            </div>
            <ul className="divide-y divide-neutral-900">
              {detail.rows.length === 0 ? (
                <li className="px-3 py-3 text-xs text-neutral-500">No matching entries.</li>
              ) : (
                detail.rows.map((row, i) => (
                  <li key={i} className="px-3 py-2">
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="truncate text-neutral-300">{row.label}</span>
                      <span className="shrink-0 tabular-nums text-orange-300">{row.value}</span>
                    </div>
                    {row.sub && <div className="mt-0.5 truncate text-[10px] text-neutral-500">{row.sub}</div>}
                  </li>
                ))
              )}
            </ul>
            {detail.footer && (
              <div className="border-t border-neutral-900 bg-neutral-900/40 px-3 py-1.5 text-[10px] text-neutral-500">
                {detail.footer}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
