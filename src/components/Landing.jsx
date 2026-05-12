import { useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Coffee, Sparkles, Plus, Brain, RefreshCw, ShieldCheck } from 'lucide-react'
import { AnimatedDock } from './AnimatedDock'

export default function Landing({
  workspaces,
  activeId,
  onOpenDemo,
  onOpenWorkspace,
  onCreateCafe,
  onStartFresh,
}) {
  const dockItems = buildDockItems({ workspaces, activeId, onOpenDemo, onOpenWorkspace, onCreateCafe })

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BreathingGradient />
      <GridPattern />
      <AuroraStreams />
      <SteamWisps />
      <FloatingBeans />
      <FloatingSparkles />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <Logo />
          <span className="text-lg font-semibold tracking-tight">CraveOS</span>
        </motion.div>
        <motion.a
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          href="https://github.com/jerindavispm/craveos"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-neutral-400 transition hover:text-orange-300"
        >
          GitHub →
        </motion.a>
      </header>

      <main className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-16 pb-24 text-center md:pt-24">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: 1,
            y: 0,
            boxShadow: [
              '0 0 0 0 rgba(251,146,60,0)',
              '0 0 24px 0 rgba(251,146,60,0.35)',
              '0 0 0 0 rgba(251,146,60,0)',
            ],
          }}
          transition={{
            opacity: { duration: 0.4 },
            y: { duration: 0.4 },
            boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 },
          }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1 text-xs font-medium text-orange-300"
        >
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="size-1.5 rounded-full bg-orange-400"
          />
          Mini AI ERP for independent cafes
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="max-w-3xl text-balance text-4xl font-semibold tracking-tight md:text-6xl"
        >
          The AI prep sheet that knows your{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(110deg, #fb923c 30%, #fef3c7 50%, #fb923c 70%)',
              backgroundSize: '220% 100%',
              animation: 'shimmer 3.5s linear infinite',
            }}
          >
            cafe better than you do
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-6 max-w-2xl text-balance text-base text-neutral-400 md:text-lg"
        >
          Forecast tomorrow's prep, cut waste, and never under-prep a rush again. Your data stays on your device — no signup, no cloud.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <ShimmerButton onClick={onOpenDemo} primary>
            <Sparkles size={16} /> See Demo
          </ShimmerButton>
          <ShimmerButton onClick={onStartFresh}>
            <Coffee size={16} /> Start with my cafe
          </ShimmerButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 grid w-full grid-cols-1 gap-4 md:grid-cols-3"
        >
          <FeatureCard
            index={0}
            Icon={Brain}
            iconAnim="glow"
            title="Tomorrow's prep, today"
            body="Day-of-week trends, recent momentum, and weather blend into a plain-English prep brief."
          />
          <FeatureCard
            index={1}
            Icon={RefreshCw}
            iconAnim="rotate"
            title="Waste loop"
            body="Log what got tossed at close. Next forecast tightens itself automatically."
          />
          <FeatureCard
            index={2}
            Icon={ShieldCheck}
            iconAnim="pulse"
            title="Your data, your device"
            body="Everything runs in your browser. Export to JSON or CSV anytime. Zero lock-in."
          />
        </motion.div>
      </main>

      <motion.aside
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        className="pointer-events-none fixed right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-2 lg:flex"
      >
        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Cafes</span>
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-auto"
        >
          <AnimatedDock items={dockItems} />
        </motion.div>
      </motion.aside>

      <footer className="relative z-10 border-t border-neutral-900 px-6 py-6 text-center text-xs text-neutral-500 md:px-12">
        Built by{' '}
        <a href="https://jerindavispm.github.io" className="text-neutral-300 hover:text-orange-300" target="_blank" rel="noreferrer">
          Jerin Davis
        </a>{' '}
        · A portfolio demonstration of an AI-first cafe operations tool
      </footer>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 220% 50%; }
        }
        @keyframes sweep {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
      `}</style>
    </div>
  )
}

function ShimmerButton({ children, onClick, primary }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full px-7 text-sm font-semibold transition ${
        primary
          ? 'bg-orange-400 text-neutral-950 shadow-[0_8px_24px_-8px_rgba(251,146,60,0.6)] hover:bg-orange-300'
          : 'border border-neutral-700 bg-neutral-900/60 text-neutral-100 backdrop-blur hover:border-orange-400/50'
      }`}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <span
        aria-hidden
        className="absolute inset-y-0 w-1/3"
        style={{
          background: primary
            ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(251,146,60,0.35), transparent)',
          animation: primary ? 'sweep 3.2s ease-in-out infinite' : 'sweep 4.5s ease-in-out infinite',
        }}
      />
    </motion.button>
  )
}

function FeatureCard({ index, title, body, Icon, iconAnim }) {
  const ref = useRef(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 })
  const [hovered, setHovered] = useState(false)

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    setTilt({ rx: (0.5 - py) * 7, ry: (px - 0.5) * 7, mx: px * 100, my: py * 100 })
  }
  const onLeave = () => {
    setTilt({ rx: 0, ry: 0, mx: 50, my: 50 })
    setHovered(false)
  }

  const iconAnimation =
    iconAnim === 'rotate'
      ? { rotate: 360 }
      : iconAnim === 'pulse'
      ? { scale: [1, 1.18, 1, 1.12, 1] }
      : iconAnim === 'glow'
      ? { opacity: [0.7, 1, 0.85, 1, 0.75] }
      : {}
  const iconTransition =
    iconAnim === 'rotate'
      ? { duration: 9, repeat: Infinity, ease: 'linear' }
      : iconAnim === 'pulse'
      ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
      : iconAnim === 'glow'
      ? { duration: 4, repeat: Infinity, ease: 'easeInOut' }
      : {}

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: [0, -4, 0] }}
      transition={{
        opacity: { duration: 0.55, delay: 0.35 + index * 0.1 },
        y: {
          duration: 5 + index * 0.6,
          delay: 0.35 + index * 0.1,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
      whileHover={{ y: -6 }}
      style={{
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        '--mx': `${tilt.mx}%`,
        '--my': `${tilt.my}%`,
      }}
      className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 text-left backdrop-blur-sm transition-[border-color] duration-300 hover:border-orange-400/50"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(260px circle at var(--mx) var(--my), rgba(251,146,60,0.2), transparent 70%)' }}
      />

      <div className="relative mb-5 inline-flex">
        <motion.div
          animate={hovered ? { scale: 1.12 } : { scale: 1 }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative flex size-11 items-center justify-center rounded-xl border border-orange-400/30 bg-gradient-to-br from-orange-400/15 to-amber-500/10"
        >
          <motion.span
            animate={iconAnimation}
            transition={iconTransition}
            className="flex items-center justify-center text-orange-300"
          >
            {Icon && <Icon size={20} strokeWidth={2.2} />}
          </motion.span>
          <motion.div
            aria-hidden
            animate={hovered ? { opacity: 1, scale: 1.4 } : { opacity: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 -z-10 rounded-xl"
            style={{ boxShadow: '0 0 28px 6px rgba(251,146,60,0.5)' }}
          />
        </motion.div>
      </div>

      <h3 className="relative text-sm font-semibold tracking-tight text-neutral-100">{title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-neutral-400">{body}</p>

      <motion.div
        aria-hidden
        initial={false}
        animate={hovered ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="absolute bottom-0 left-0 h-px w-full origin-left bg-gradient-to-r from-orange-400 via-amber-300 to-transparent"
      />
    </motion.div>
  )
}

function BreathingGradient() {
  return (
    <motion.div
      aria-hidden
      animate={{ opacity: [0.85, 1, 0.85], scale: [1, 1.04, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      className="pointer-events-none absolute inset-0"
      style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(244,114,57,0.18), transparent 60%)' }}
    />
  )
}

function GridPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
  )
}

function AuroraStreams() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] overflow-hidden">
      <motion.div
        animate={{ x: ['-8%', '4%', '-8%'], rotate: [0, 1.5, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 left-1/2 h-72 w-[150%] -translate-x-1/2 opacity-50 blur-3xl"
        style={{
          background:
            'linear-gradient(110deg, transparent 18%, rgba(251,146,60,0.55) 32%, rgba(254,215,170,0.45) 50%, rgba(245,158,11,0.55) 68%, transparent 84%)',
        }}
      />
      <motion.div
        animate={{ x: ['4%', '-6%', '4%'], rotate: [0, -2, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute top-12 left-1/2 h-64 w-[150%] -translate-x-1/2 opacity-35 blur-3xl"
        style={{
          background:
            'linear-gradient(70deg, transparent 24%, rgba(245,158,11,0.5) 42%, rgba(251,146,60,0.4) 58%, transparent 78%)',
        }}
      />
      <motion.div
        animate={{ x: ['-4%', '8%', '-4%'], rotate: [0, 1, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute top-32 left-1/2 h-56 w-[150%] -translate-x-1/2 opacity-30 blur-3xl"
        style={{
          background:
            'linear-gradient(130deg, transparent 30%, rgba(254,215,170,0.5) 50%, transparent 70%)',
        }}
      />
    </div>
  )
}

function SteamWisps() {
  const wisps = useMemo(
    () =>
      Array.from({ length: 9 }, () => ({
        left: 8 + Math.random() * 84,
        duration: 14 + Math.random() * 10,
        delay: -Math.random() * 20,
        height: 24 + Math.random() * 28,
        drift: -25 + Math.random() * 50,
        opacity: 0.18 + Math.random() * 0.22,
      })),
    [],
  )
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {wisps.map((w, i) => (
        <motion.span
          key={i}
          initial={{ y: '60%', x: 0, opacity: 0 }}
          animate={{
            y: '-30%',
            x: [0, w.drift, w.drift * 0.4, 0],
            opacity: [0, w.opacity, w.opacity, 0],
          }}
          transition={{ duration: w.duration, delay: w.delay, repeat: Infinity, ease: 'easeOut' }}
          style={{
            left: `${w.left}%`,
            width: 2,
            height: `${w.height}%`,
            background:
              'linear-gradient(to top, transparent 0%, rgba(254,243,199,0.5) 30%, rgba(254,215,170,0.45) 70%, transparent 100%)',
            filter: 'blur(8px)',
          }}
          className="absolute"
        />
      ))}
    </div>
  )
}


function CoffeeBean({ size = 24, opacity = 1 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ opacity }}>
      <g transform="rotate(18 16 16)">
        <ellipse cx="16" cy="16" rx="8.5" ry="13.5" fill="currentColor" />
        <path
          d="M 16 3 Q 19.5 9 19.5 16 Q 19.5 23 16 29"
          stroke="rgba(15,15,15,0.55)"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

function FloatingBeans() {
  const beans = useMemo(
    () =>
      Array.from({ length: 11 }, () => {
        const direction = Math.random() < 0.5 ? 1 : -1
        const bobAmp = 8 + Math.random() * 14
        return {
          top: 8 + Math.random() * 84,
          duration: 32 + Math.random() * 28,
          delay: -Math.random() * 50,
          size: 18 + Math.random() * 22,
          rotateStart: -30 + Math.random() * 60,
          rotateDelta: -45 + Math.random() * 90,
          opacity: 0.07 + Math.random() * 0.1,
          direction,
          bobAmp,
          bobDuration: 5 + Math.random() * 4,
          bobDelay: -Math.random() * 6,
        }
      }),
    [],
  )

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {beans.map((b, i) => (
        <motion.div
          key={i}
          initial={{
            x: b.direction > 0 ? '-15vw' : '110vw',
            rotate: b.rotateStart,
          }}
          animate={{
            x: b.direction > 0 ? '110vw' : '-15vw',
            rotate: b.rotateStart + b.rotateDelta,
          }}
          transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', top: `${b.top}%`, color: '#fb923c' }}
        >
          <motion.div
            animate={{ y: [0, -b.bobAmp, 0, b.bobAmp * 0.6, 0] }}
            transition={{ duration: b.bobDuration, delay: b.bobDelay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <CoffeeBean size={b.size} opacity={b.opacity} />
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}

function FloatingSparkles() {
  const sparks = useMemo(
    () =>
      Array.from({ length: 22 }, () => ({
        left: Math.random() * 100,
        bottom: Math.random() * 100,
        duration: 8 + Math.random() * 12,
        delay: -Math.random() * 14,
        size: 1.5 + Math.random() * 2.5,
        opacity: 0.3 + Math.random() * 0.45,
        drift: -40 + Math.random() * 80,
      })),
    [],
  )
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {sparks.map((s, i) => (
        <motion.span
          key={i}
          initial={{ y: 0, x: 0, opacity: 0 }}
          animate={{ y: -120, x: s.drift, opacity: [0, s.opacity, s.opacity, 0] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeOut' }}
          style={{
            left: `${s.left}%`,
            bottom: `${s.bottom}%`,
            width: s.size,
            height: s.size,
            background: 'radial-gradient(circle, rgba(254,215,170,0.95), transparent 70%)',
            boxShadow: '0 0 6px rgba(251,146,60,0.4)',
          }}
          className="absolute rounded-full"
        />
      ))}
    </div>
  )
}

function buildDockItems({ workspaces, activeId, onOpenDemo, onOpenWorkspace, onCreateCafe }) {
  const items = []

  items.push({
    id: 'demo',
    label: 'Demo · Brew Haven',
    icon: <Sparkles size={20} strokeWidth={2.2} />,
    onClick: onOpenDemo,
    accent: true,
  })

  for (const w of workspaces) {
    if (w.id === 'demo') continue
    items.push({
      id: w.id,
      label: w.name,
      icon: <Coffee size={20} strokeWidth={2.2} />,
      onClick: () => onOpenWorkspace(w.id),
      active: w.id === activeId,
    })
  }

  items.push({
    id: '__new',
    label: 'Add a cafe',
    icon: <Plus size={20} strokeWidth={2.5} />,
    onClick: onCreateCafe,
  })

  return items
}

function Logo() {
  return (
    <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 text-neutral-950 shadow-lg shadow-orange-500/20">
      <Coffee size={16} strokeWidth={2.5} />
    </div>
  )
}
