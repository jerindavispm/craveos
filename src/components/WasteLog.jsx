import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Trash2, Plus, X } from 'lucide-react'
import { addWaste } from '../lib/storage'

export default function WasteLog({ waste, onChange }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [cost, setCost] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!note.trim()) return
    addWaste({ date: new Date().toISOString().slice(0, 10), note: note.trim(), cost: Number(cost) || 0 })
    setNote('')
    setCost('')
    setOpen(false)
    onChange?.()
  }

  const recent = [...(waste || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)
  const weekCost = recent.reduce((s, w) => s + (w.cost || 0), 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-orange-400/30"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(220px_circle_at_70%_0%,rgba(251,146,60,0.08),transparent_70%)]" />

      <div className="relative mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.08, 1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="flex size-7 items-center justify-center rounded-lg border border-orange-400/25 bg-gradient-to-br from-orange-400/15 to-amber-500/5 text-orange-300"
          >
            <Trash2 size={13} strokeWidth={2.3} />
          </motion.div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight">Waste log</h3>
            <p className="text-xs text-neutral-500 tabular-nums">${weekCost.toFixed(2)} recent loss · feeds the forecast</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-orange-300 transition hover:bg-orange-400/10"
        >
          {open ? <X size={12} /> : <Plus size={12} />}
          {open ? 'Close' : 'Log waste'}
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.form
            key="form"
            onSubmit={submit}
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative mb-3 overflow-hidden"
          >
            <div className="grid gap-2 pt-1 md:grid-cols-[1fr_110px_auto]">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What got tossed?"
                className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-orange-400/50 focus:outline-none"
                autoFocus
              />
              <input
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                type="number"
                step="0.01"
                placeholder="$ cost"
                className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-orange-400/50 focus:outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="rounded-lg bg-orange-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-orange-300"
              >
                Save
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {recent.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-lg border border-dashed border-neutral-800 bg-neutral-950/40 px-3 py-6 text-center text-sm text-neutral-500"
        >
          No waste logged. Crisp operation.
        </motion.div>
      ) : (
        <ul className="relative divide-y divide-neutral-800/80">
          <AnimatePresence initial={true}>
            {recent.map((w, i) => (
              <motion.li
                key={w.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
                whileHover={{ x: 2 }}
                className="flex items-center justify-between gap-2 py-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-neutral-200">{w.note}</div>
                  <div className="text-xs text-neutral-500">{w.date}</div>
                </div>
                {w.cost > 0 && (
                  <div className="shrink-0 rounded-md bg-rose-500/10 px-2 py-0.5 text-xs tabular-nums text-rose-300">
                    ${w.cost.toFixed(2)}
                  </div>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </motion.div>
  )
}
