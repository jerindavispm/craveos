import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { cn } from '../lib/utils'

export function AnimatedDock({ items, className }) {
  const mouseY = useMotionValue(Infinity)

  return (
    <motion.div
      onMouseMove={(e) => mouseY.set(e.clientY)}
      onMouseLeave={() => mouseY.set(Infinity)}
      className={cn(
        'flex flex-col items-center gap-3 rounded-3xl border border-orange-400/15 bg-neutral-900/50 px-3 py-4 shadow-[0_20px_60px_-15px_rgba(251,146,60,0.25)] backdrop-blur-xl',
        className,
      )}
    >
      {items.map((item, i) => (
        <DockItem key={item.id ?? i} item={item} mouseY={mouseY} />
      ))}
    </motion.div>
  )
}

function DockItem({ item, mouseY }) {
  const ref = useRef(null)
  const [hovered, setHovered] = useState(false)

  const distance = useTransform(mouseY, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 }
    return val - bounds.y - bounds.height / 2
  })

  const sizeSync = useTransform(distance, [-120, 0, 120], [44, 72, 44])
  const size = useSpring(sizeSync, { mass: 0.1, stiffness: 160, damping: 14 })

  const iconScaleSync = useTransform(size, [44, 72], [1, 1.45])
  const iconScale = useSpring(iconScaleSync, { mass: 0.1, stiffness: 160, damping: 14 })

  const active = item.active
  const accent = item.accent

  return (
    <motion.button
      ref={ref}
      onClick={item.onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: size, height: size }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        'group relative flex shrink-0 items-center justify-center rounded-2xl border transition-colors',
        accent
          ? 'border-orange-400/60 bg-gradient-to-br from-orange-400 to-amber-500 text-neutral-950 shadow-lg shadow-orange-500/30'
          : active
          ? 'border-orange-400/40 bg-neutral-800 text-orange-300'
          : 'border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:border-orange-400/30 hover:text-orange-200',
      )}
      aria-label={item.label}
    >
      <motion.span style={{ scale: iconScale }} className="flex items-center justify-center">
        {item.icon}
      </motion.span>

      {item.label && hovered && (
        <motion.span
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg border border-neutral-800 bg-neutral-950/95 px-3 py-1.5 text-xs font-medium text-neutral-100 shadow-xl backdrop-blur"
        >
          {item.label}
          <span className="absolute right-[-4px] top-1/2 size-2 -translate-y-1/2 rotate-45 border-r border-t border-neutral-800 bg-neutral-950" />
        </motion.span>
      )}
    </motion.button>
  )
}
