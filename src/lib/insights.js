const DOW_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const KNOWN_ITEMS = [
  'croissant', 'muffin', 'pastry', 'scone', 'bagel', 'toast',
  'latte', 'cappuccino', 'cold brew', 'drip', 'coffee', 'matcha',
  'avocado', 'oat milk', 'milk', 'syrup', 'banana bread',
]

function detectItem(note) {
  const lower = (note || '').toLowerCase()
  for (const it of KNOWN_ITEMS) {
    if (lower.includes(it)) return it
  }
  return null
}

function pickInWindow(items, days, offsetDays = 0) {
  if (!items?.length) return []
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const end = new Date(now)
  end.setDate(now.getDate() - offsetDays)
  const start = new Date(end)
  start.setDate(end.getDate() - days)
  return items.filter((x) => {
    const d = new Date(x.date)
    return d >= start && d <= end
  })
}

function formatDateShort(s) {
  return new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function topSellersDetail(latest) {
  if (!latest?.sales?.length) return null
  const items = latest.sales
    .map((s) => ({ name: s.name, qty: s.qty, price: s.price || 0, revenue: s.qty * (s.price || 0) }))
    .filter((it) => it.qty > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6)
  if (items.length === 0) return null
  const totalRev = items.reduce((s, i) => s + i.revenue, 0)
  const totalQty = items.reduce((s, i) => s + i.qty, 0)
  const topShare = totalRev > 0 ? Math.round((items[0].revenue / (latest.revenue || totalRev)) * 100) : 0
  return {
    title: `Top sellers · ${formatDateShort(latest.date)}`,
    rows: items.map((it) => ({
      label: it.name,
      value: `$${Math.round(it.revenue).toLocaleString()}`,
      sub: `${it.qty} sold · $${it.price.toFixed(2)} each`,
    })),
    footer: `${items[0].name} drove ${topShare}% of revenue · ${totalQty} units across top ${items.length}`,
  }
}

export function revenueInsight(entries) {
  if (!entries || entries.length === 0) return null
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  const latest = sorted[0]
  const latestRev = latest.revenue ?? 0

  const detail = topSellersDetail(latest)

  const prior = sorted.slice(1, 8)
  if (prior.length < 2) {
    return { trend: 'flat', delta: 'New', note: 'log more days for trend', vibe: 'neutral', detail }
  }

  const priorAvg = prior.reduce((s, e) => s + (e.revenue ?? 0), 0) / prior.length
  if (priorAvg === 0) return null

  const delta = Math.round(((latestRev - priorAvg) / priorAvg) * 100)

  const latestDow = new Date(latest.date).getDay()
  const sameDow = sorted.slice(1).filter((e) => new Date(e.date).getDay() === latestDow)
  let note = 'vs 7-day avg'
  if (sameDow.length >= 2) {
    const dowAvg = sameDow.reduce((s, e) => s + (e.revenue ?? 0), 0) / sameDow.length
    if (dowAvg > 0) {
      const dowDelta = Math.round(((latestRev - dowAvg) / dowAvg) * 100)
      const dow = DOW_SHORT[latestDow]
      if (dowDelta >= 15) note = `strong for a ${dow}`
      else if (dowDelta <= -15) note = `soft for a ${dow}`
      else if (Math.abs(dowDelta) <= 8) note = `typical ${dow}`
    }
  }

  if (Math.abs(delta) < 5) {
    return { trend: 'flat', delta: '~flat', note, vibe: 'neutral', detail }
  }
  return {
    trend: delta > 0 ? 'up' : 'down',
    delta: delta > 0 ? `+${delta}%` : `${delta}%`,
    note,
    vibe: delta > 0 ? 'good' : 'bad',
    detail,
  }
}

export function wasteInsight(entries, waste) {
  const recent = pickInWindow(waste, 7)
  const prior = pickInWindow(waste, 7, 7)

  if (recent.length === 0 && prior.length === 0) {
    return { trend: 'flat', delta: '$0', note: 'tight operation', vibe: 'good' }
  }

  const recentCost = recent.reduce((s, w) => s + (w.cost || 0), 0)
  const priorCost = prior.reduce((s, w) => s + (w.cost || 0), 0)

  const itemCounts = new Map()
  for (const w of recent) {
    const it = detectItem(w.note)
    if (it) itemCounts.set(it, (itemCounts.get(it) || 0) + 1)
  }
  const topItem = [...itemCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]

  const recentRev = pickInWindow(entries, 7).reduce((s, e) => s + (e.revenue ?? 0), 0)
  const pctRev = recentRev > 0 ? (recentCost / recentRev) * 100 : null

  let note
  let detail
  if (topItem) {
    note = `top: ${topItem}`
    const matches = recent
      .filter((w) => (w.note || '').toLowerCase().includes(topItem))
      .sort((a, b) => b.date.localeCompare(a.date))
    const matchTotal = matches.reduce((s, w) => s + (w.cost || 0), 0)
    detail = {
      title: `${topItem} waste · last 7d`,
      rows: matches.slice(0, 6).map((w) => ({
        label: formatDateShort(w.date),
        value: `$${(w.cost || 0).toFixed(2)}`,
        sub: w.note,
      })),
      footer: `${matches.length} incident${matches.length === 1 ? '' : 's'} · $${matchTotal.toFixed(2)} lost`,
    }
  } else if (pctRev !== null && pctRev > 0) {
    note = `${pctRev.toFixed(1)}% of revenue`
    detail = {
      title: 'Waste · last 7d',
      rows: recent.slice(0, 6).map((w) => ({
        label: formatDateShort(w.date),
        value: `$${(w.cost || 0).toFixed(2)}`,
        sub: w.note,
      })),
      footer: `$${recentCost.toFixed(2)} of $${Math.round(recentRev).toLocaleString()} revenue`,
    }
  } else {
    note = 'vs prior 7d'
    detail = {
      title: 'Waste · last 7d',
      rows: recent.slice(0, 6).map((w) => ({
        label: formatDateShort(w.date),
        value: `$${(w.cost || 0).toFixed(2)}`,
        sub: w.note,
      })),
      footer: `${recent.length} incident${recent.length === 1 ? '' : 's'}`,
    }
  }

  if (priorCost === 0) {
    if (recentCost === 0) return { trend: 'flat', delta: '$0', note: 'tight', vibe: 'good', detail }
    return { trend: 'up', delta: `new`, note, vibe: 'bad', detail }
  }

  const delta = Math.round(((recentCost - priorCost) / priorCost) * 100)

  if (Math.abs(delta) < 5) {
    return { trend: 'flat', delta: '~flat', note, vibe: 'neutral', detail }
  }
  return {
    trend: delta > 0 ? 'up' : 'down',
    delta: delta > 0 ? `+${delta}%` : `${delta}%`,
    note,
    vibe: delta > 0 ? 'bad' : 'good',
    detail,
  }
}
