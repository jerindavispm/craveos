import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.()
      if (e.key === 'Enter') onConfirm?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel, onConfirm])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-md" />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl"
          >
            <button
              onClick={onCancel}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-neutral-500 transition hover:bg-neutral-900 hover:text-neutral-200"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="flex gap-4 p-6">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                  danger ? 'bg-rose-500/10 text-rose-400' : 'bg-orange-400/10 text-orange-300'
                }`}
              >
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold tracking-tight text-neutral-100">{title}</h3>
                {message && <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{message}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-neutral-900 bg-neutral-900/40 px-6 py-3.5">
              <button
                onClick={onCancel}
                className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-300 transition hover:bg-neutral-900"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  danger
                    ? 'bg-rose-500 text-neutral-950 hover:bg-rose-400'
                    : 'bg-orange-400 text-neutral-950 hover:bg-orange-300'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
