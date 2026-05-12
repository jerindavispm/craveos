import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { cn } from '../lib/utils'

export function AnimatedDock({ items, className, direction = 'vertical' }) {
  const isHorizontal = direction === 'horizontal'
  const mouseAxis = useMotionValue(Infinity)

  return (
    <motion.div
      onMouseMove={(e) => mouseAxis.set(isHorizontal ? e.clientX : e.clientY)}
      onMouseLeave={() => mouseAxis.set(Infinity)}
      className={cn(
        'flex items-center gap-3 rounded-3xl border border-orange-400/15 bg-neutral-900/60 shadow-[0_20px_60px_-15px_rgba(251,146,60,0.3)] backdrop-blur-xl',
        isHorizontal ? 'flex-row px-4 py-3' : 'flex-col px-3 py-4',
        className,
      )}
    >
      {items.map((item, i) => (
        <DockItem
          key={item.id ?? i}
          item={item}
          mouseAxis={mouseAxis}
          isHorizontal={isHorizontal}
        />
      ))}
    </motion.div>
  )
}

function DockItem({ item, mouseAxis, isHorizontal }) {
  const ref = useRef(null)
  const [hovered, setHovered] = useState(false)

  const distance = useTransform(mouseAxis, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 }
    return isHorizontal
      ? val - bounds.x - bounds.width / 2
      : val - bounds.y - bounds.height / 2
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
          initial={{ opacity: 0, [isHorizontal ? 'y' : 'x']: 8 }}
          animate={{ opacity: 1, [isHorizontal ? 'y' : 'x']: 0 }}
          exit={{ opacity: 0 }}
          className={cn(
            'pointer-events-none absolute whitespace-nowrap rounded-lg border border-neutral-800 bg-neutral-950/95 px-3 py-1.5 text-xs font-medium text-neutral-100 shadow-xl backdrop-blur',
            isHorizontal
              ? 'bottom-full left-1/2 mb-3 -translate-x-1/2'
              : 'right-full mr-3',
          )}
        >
          {item.label}
          <span
            className={cn(
              'absolute size-2 rotate-45 border bg-neutral-950',
              isHorizontal
                ? 'bottom-[-4px] left-1/2 -translate-x-1/2 border-b border-r border-neutral-800'
                : 'right-[-4px] top-1/2 -translate-y-1/2 border-r border-t border-neutral-800',
            )}
          />
        </motion.span>
      )}
    </motion.button>
  )
}
