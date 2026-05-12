import { useMemo, useState } from 'react'
import { addEntry } from '../lib/storage'

const DEFAULT_ITEMS = ['Latte', 'Cappuccino', 'Drip Coffee', 'Cold Brew', 'Croissant', 'Muffin']

export default function QuickEntry({ workspace, onSaved }) {
  const knownItems = useMemo(() => {
    const fromItems = (workspace.items || []).map((i) => i.name)
    const fromEntries = new Set()
    for (const e of workspace.entries || []) {
      for (const s of e.sales || []) fromEntries.add(s.name)
    }
    const merged = new Set([...fromItems, ...fromEntries])
    if (merged.size === 0) DEFAULT_ITEMS.forEach((n) => merged.add(n))
    return [...merged]
  }, [workspace])

  const priceFor = (name) => {
    for (let i = (workspace.entries || []).length - 1; i >= 0; i--) {
      const s = (workspace.entries[i].sales || []).find((x) => x.name === name)
      if (s?.price) return s.price
    }
    const item = (workspace.items || []).find((x) => x.name === name)
    return item?.price ?? 0
  }

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [rows, setRows] = useState(() => knownItems.slice(0, 6).map((n) => ({ name: n, qty: '', price: priceFor(n) || '' })))
  const [newName, setNewName] = useState('')

  const update = (idx, patch) => setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)))
  const addRow = () => {
    if (!newName.trim()) return
    setRows((r) => [...r, { name: newName.trim(), qty: '', price: priceFor(newName.trim()) || '' }])
    setNewName('')
  }
  const removeRow = (idx) => setRows((r) => r.filter((_, i) => i !== idx))

  const submit = (e) => {
    e.preventDefault()
    const sales = rows
      .filter((r) => r.name.trim() && Number(r.qty) > 0)
      .map((r) => ({ name: r.name.trim(), qty: Number(r.qty), price: Number(r.price) || 0 }))
    if (sales.length === 0) return
    const revenue = sales.reduce((s, x) => s + x.qty * (x.price || 0), 0)
    addEntry({ date, sales, revenue: Math.round(revenue * 100) / 100 })
    setRows((r) => r.map((row) => ({ ...row, qty: '' })))
    onSaved?.()
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Quick entry</h3>
          <p className="text-xs text-neutral-500">Log today's sales — takes about 30 seconds.</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100 focus:border-orange-400 focus:outline-none sm:w-auto"
        />
      </div>

      <div className="space-y-1.5">
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_64px_72px_24px] items-center gap-1.5 sm:grid-cols-[1fr_80px_90px_28px] sm:gap-2"
          >
            <input
              value={row.name}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder="Item"
              className="min-w-0 rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-orange-400 focus:outline-none sm:px-3"
            />
            <input
              value={row.qty}
              onChange={(e) => update(i, { qty: e.target.value })}
              type="number"
              min="0"
              placeholder="Qty"
              className="min-w-0 rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-orange-400 focus:outline-none sm:px-3"
            />
            <input
              value={row.price}
              onChange={(e) => update(i, { price: e.target.value })}
              type="number"
              step="0.01"
              placeholder="$"
              className="min-w-0 rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-orange-400 focus:outline-none sm:px-3"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="flex h-9 items-center justify-center text-neutral-600 hover:text-neutral-300"
              aria-label="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="+ Add item"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRow() } }}
          className="flex-1 rounded-lg border border-dashed border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-300 placeholder:text-neutral-600 focus:border-orange-400 focus:outline-none"
        />
        <button type="button" onClick={addRow} className="rounded-lg border border-neutral-700 px-3 text-sm text-neutral-300 hover:border-neutral-500">
          Add
        </button>
      </div>

      <button type="submit" className="mt-4 w-full rounded-lg bg-orange-400 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-orange-300">
        Save entry for {date}
      </button>
    </form>
  )
}
