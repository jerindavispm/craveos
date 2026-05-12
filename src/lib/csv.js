function parseCsvLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ } else { inQuotes = !inQuotes }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur); cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

export function parseSalesCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) throw new Error('CSV looks empty — expected header + rows.')

  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase())
  const idx = {
    date: header.findIndex((h) => /^date$/i.test(h)),
    item: header.findIndex((h) => /item|name|product/i.test(h)),
    qty: header.findIndex((h) => /qty|quantity|sold|count/i.test(h)),
    price: header.findIndex((h) => /price|amount|unit/i.test(h)),
  }
  if (idx.date < 0 || idx.item < 0 || idx.qty < 0) {
    throw new Error('CSV needs columns: date, item, qty (price optional).')
  }

  const byDate = new Map()
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i])
    const date = normalizeDate(cells[idx.date])
    const item = cells[idx.item]
    const qty = Number(cells[idx.qty])
    const price = idx.price >= 0 ? Number(cells[idx.price]) || 0 : 0
    if (!date || !item || !Number.isFinite(qty)) continue
    if (!byDate.has(date)) byDate.set(date, [])
    byDate.get(date).push({ name: item, qty, price })
  }

  const entries = []
  const itemSet = new Set()
  for (const [date, sales] of [...byDate.entries()].sort()) {
    const revenue = sales.reduce((s, x) => s + x.qty * (x.price || 0), 0)
    for (const s of sales) itemSet.add(s.name)
    entries.push({ date, sales, revenue: Math.round(revenue * 100) / 100 })
  }
  return { entries, items: [...itemSet].map((name) => ({ name })) }
}

function normalizeDate(s) {
  if (!s) return null
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  triggerDownload(filename, blob)
}

export function downloadCsv(filename, entries) {
  const rows = [['date', 'item', 'qty', 'price']]
  for (const e of entries) {
    for (const s of e.sales || []) {
      rows.push([e.date, s.name, s.qty, s.price ?? ''])
    }
  }
  const text = rows.map((r) => r.map(csvCell).join(',')).join('\n')
  const blob = new Blob([text], { type: 'text/csv' })
  triggerDownload(filename, blob)
}

function csvCell(v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function triggerDownload(filename, blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
