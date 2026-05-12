import { useEffect, useRef, useState } from 'react'

export default function CountUp({ value, duration = 0.7, format = (v) => v, className }) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef(null)

  useEffect(() => {
    if (typeof value !== 'number' || typeof fromRef.current !== 'number') {
      setDisplay(value)
      fromRef.current = value
      return
    }
    const start = fromRef.current
    const end = value
    if (start === end) return
    const t0 = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / (duration * 1000))
      const eased = 1 - Math.pow(1 - t, 3)
      const v = start + (end - start) * eased
      setDisplay(v)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = end
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  return <span className={className}>{format(display)}</span>
}
