import { useEffect, useRef, useState } from 'react'
import { Coffee, Pencil, Trash2, Check, X } from 'lucide-react'
import {
  listWorkspaces,
  setActiveWorkspace,
  getActiveWorkspace,
  deleteWorkspace,
  renameWorkspace,
  canDeleteWorkspace,
} from '../lib/storage'
import ConfirmDialog from './ConfirmDialog'

export default function WorkspaceSwitcher({ onChange }) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null) // { id, name }
  const [active, setActive] = useState(() => getActiveWorkspace())
  const [list, setList] = useState(() => listWorkspaces())
  const ref = useRef(null)

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setEditingId(null) } }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const refresh = () => {
    setActive(getActiveWorkspace())
    setList(listWorkspaces())
  }

  const pick = (id) => {
    if (editingId) return
    setActiveWorkspace(id)
    refresh()
    setOpen(false)
    onChange?.()
  }

  const askDelete = (w, e) => {
    e.stopPropagation()
    if (!canDeleteWorkspace(w.id)) return
    setPendingDelete({ id: w.id, name: w.name })
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteWorkspace(pendingDelete.id)
    setPendingDelete(null)
    refresh()
    onChange?.()
  }

  const startEdit = (w, e) => {
    e.stopPropagation()
    setEditingId(w.id)
    setDraft(w.name)
  }

  const commitEdit = (e) => {
    e?.stopPropagation()
    if (!editingId) return
    renameWorkspace(editingId, draft)
    setEditingId(null)
    refresh()
    onChange?.()
  }

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-sm text-neutral-200 transition hover:border-orange-400/40"
        >
          <Coffee size={14} className="text-orange-300" />
          {active.name}
          <svg viewBox="0 0 24 24" className="size-3.5 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 z-30 mt-1 w-64 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl">
            {list.map((w) => {
              const isActive = w.id === active.id
              const isEditing = editingId === w.id
              const deletable = canDeleteWorkspace(w.id)
              return (
                <div
                  key={w.id}
                  onClick={() => !isEditing && pick(w.id)}
                  className={`group flex items-center justify-between gap-2 px-3 py-2 transition ${
                    isActive ? 'bg-neutral-900 text-orange-300' : 'text-neutral-200 hover:bg-neutral-900'
                  } ${isEditing ? '' : 'cursor-pointer'}`}
                >
                  {isEditing ? (
                    <form
                      onSubmit={commitEdit}
                      onClick={(e) => e.stopPropagation()}
                      className="flex flex-1 items-center gap-1"
                    >
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Escape') { setEditingId(null) } }}
                        className="flex-1 rounded border border-orange-400/40 bg-neutral-900 px-2 py-1 text-sm text-neutral-100 focus:outline-none"
                      />
                      <button type="submit" className="rounded p-1 text-emerald-400 hover:bg-emerald-500/10" aria-label="Save">
                        <Check size={14} />
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="rounded p-1 text-neutral-500 hover:bg-neutral-800" aria-label="Cancel">
                        <X size={14} />
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="truncate text-sm">{w.name}</span>
                      <span className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                        <button onClick={(e) => startEdit(w, e)} className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200" aria-label="Rename">
                          <Pencil size={12} />
                        </button>
                        {deletable && (
                          <button onClick={(e) => askDelete(w, e)} className="rounded p-1 text-neutral-500 hover:bg-rose-500/10 hover:text-rose-400" aria-label="Delete">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </span>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        danger
        title={`Delete "${pendingDelete?.name}"?`}
        message="This permanently removes the cafe and all its sales and waste data from your browser. This cannot be undone."
        confirmLabel="Delete cafe"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
