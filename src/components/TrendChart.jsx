import { motion } from 'motion/react'
import { Activity } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function TrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-neutral-800 text-sm text-neutral-500"
      >
        No sales logged yet.
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-orange-400/30"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(280px_circle_at_70%_0%,rgba(251,146,60,0.08),transparent_70%)]" />

      <div className="relative mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0.7, 1, 0.85, 1, 0.75] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex size-7 items-center justify-center rounded-lg border border-orange-400/25 bg-gradient-to-br from-orange-400/15 to-amber-500/5 text-orange-300"
          >
            <Activity size={13} strokeWidth={2.3} />
          </motion.div>
          <h3 className="text-sm font-semibold tracking-tight">
            Revenue <span className="text-neutral-500">· last {data.length} days</span>
          </h3>
        </div>
      </div>

      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb923c" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#fb923c" stopOpacity={0} />
              </linearGradient>
              <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid stroke="#262626" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" stroke="#737373" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#737373" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} width={50} />
            <Tooltip
              cursor={{ stroke: '#fb923c', strokeDasharray: '3 3', strokeOpacity: 0.4 }}
              contentStyle={{
                background: 'rgba(10,10,10,0.95)',
                border: '1px solid #262626',
                borderRadius: 12,
                fontSize: 12,
                backdropFilter: 'blur(8px)',
              }}
              labelStyle={{ color: '#a3a3a3' }}
              formatter={(v) => [`$${Math.round(v).toLocaleString()}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#fb923c"
              strokeWidth={2.2}
              fill="url(#rev)"
              filter="url(#lineGlow)"
              animationDuration={1400}
              animationEasing="ease-out"
              activeDot={{
                r: 5,
                fill: '#fb923c',
                stroke: 'rgba(251,146,60,0.35)',
                strokeWidth: 6,
              }}
              dot={(props) => {
                const { cx, cy, index, payload } = props
                const isLast = index === data.length - 1
                if (!isLast) return null
                return (
                  <g key={`last-dot-${payload?.date ?? index}`}>
                    <circle cx={cx} cy={cy} r={4} fill="#fb923c" />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="none"
                      stroke="#fb923c"
                      strokeOpacity={0.6}
                      strokeWidth={2}
                    >
                      <animate attributeName="r" from="4" to="14" dur="1.6s" repeatCount="indefinite" />
                      <animate attributeName="stroke-opacity" from="0.6" to="0" dur="1.6s" repeatCount="indefinite" />
                    </circle>
                  </g>
                )
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
