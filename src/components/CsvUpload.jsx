import { useRef, useState } from 'react'
import { parseSalesCsv } from '../lib/csv'
import { replaceWorkspaceData, getActiveWorkspace } from '../lib/storage'

export default function CsvUpload({ onImported }) {
  const inputRef = useRef(null)
  const [status, setStatus] = useState(null)

  const handleFile = async (file) => {
    setStatus({ kind: 'working', msg: `Reading ${file.name}…` })
    try {
      const text = await file.text()
      const { entries, items } = parseSalesCsv(text)
      if (!entries.length) throw new Error('No valid rows found.')
      const current = getActiveWorkspace()
      replaceWorkspaceData(current.id, {
        name: current.name,
        items,
        entries,
        waste: current.waste || [],
      })
      setStatus({ kind: 'ok', msg: `Imported ${entries.length} days, ${items.length} items.` })
      onImported?.()
    } catch (err) {
      setStatus({ kind: 'err', msg: err.message })
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
      <h3 className="text-sm font-semibold tracking-tight">CSV upload</h3>
      <p className="mt-1 text-xs text-neutral-500">
        Columns expected: <code className="text-neutral-300">date, item, qty, price</code> (price optional). Replaces current workspace's sales.
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const f = e.dataTransfer.files?.[0]
          if (f) handleFile(f)
        }}
        className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-700 bg-neutral-950/40 px-4 py-8 text-center transition hover:border-orange-400/60"
      >
        <div className="text-sm text-neutral-300">Drop CSV here, or click to choose</div>
        <div className="mt-1 text-xs text-neutral-500">From Square, Toast, or any spreadsheet</div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
            e.target.value = ''
          }}
        />
      </div>

      {status && (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-xs ${
            status.kind === 'ok'
              ? 'bg-emerald-500/10 text-emerald-300'
              : status.kind === 'err'
              ? 'bg-rose-500/10 text-rose-300'
              : 'bg-neutral-800 text-neutral-300'
          }`}
        >
          {status.msg}
        </div>
      )}
    </div>
  )
}
