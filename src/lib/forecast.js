const DOW_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function tomorrow() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 1)
  return d
}

function weightedAverage(values, weights) {
  if (!values.length) return 0
  const total = weights.reduce((a, b) => a + b, 0)
  return values.reduce((sum, v, i) => sum + v * weights[i], 0) / total
}

export const MIN_DAYS_FOR_CONFIDENCE = 14

export function confidenceFor(entries) {
  const n = entries?.length || 0
  if (n === 0) return { level: 'none', label: 'No data', daysNeeded: 7, message: 'Log at least 7 days to see your first forecast.' }
  if (n < 3) return { level: 'very-low', label: 'Very limited', daysNeeded: 7 - n, message: `Add ${7 - n} more day${7 - n === 1 ? '' : 's'} for basic patterns.` }
  if (n < 7) return { level: 'low', label: 'Limited', daysNeeded: 7 - n, message: `Add ${7 - n} more day${7 - n === 1 ? '' : 's'} to detect day-of-week patterns.` }
  if (n < MIN_DAYS_FOR_CONFIDENCE) return { level: 'medium', label: 'Building', daysNeeded: MIN_DAYS_FOR_CONFIDENCE - n, message: `Log ${MIN_DAYS_FOR_CONFIDENCE - n} more day${MIN_DAYS_FOR_CONFIDENCE - n === 1 ? '' : 's'} for confident AI assessment.` }
  if (n < 28) return { level: 'good', label: 'Confident', daysNeeded: 0, message: '' }
  return { level: 'strong', label: 'Strong', daysNeeded: 0, message: '' }
}

export function forecastTomorrow(entries, { rainy = false } = {}) {
  const confidence = confidenceFor(entries)
  if (!entries || entries.length === 0) {
    return {
      date: tomorrow(),
      dayLabel: DOW_LABELS[tomorrow().getDay()],
      items: [],
      summary: 'Add a few days of sales and your forecast will appear here.',
      revenueLow: 0,
      revenueHigh: 0,
      confidence,
    }
  }

  const tmr = tomorrow()
  const targetDow = tmr.getDay()

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))

  const itemTotals = new Map()
  for (const entry of sorted) {
    for (const sale of entry.sales || []) {
      if (!itemTotals.has(sale.name)) itemTotals.set(sale.name, { qty: 0, count: 0, price: sale.price || 0 })
      const t = itemTotals.get(sale.name)
      t.qty += sale.qty
      t.count += 1
      if (sale.price) t.price = sale.price
    }
  }

  const sameDow = sorted.filter((e) => parseDate(e.date).getDay() === targetDow)
  const recent = sorted.slice(-14)

  const itemForecasts = []
  for (const [name, agg] of itemTotals.entries()) {
    const dowVals = sameDow.map((e) => (e.sales.find((s) => s.name === name)?.qty) ?? 0).filter((v) => v > 0)
    const recentVals = recent.map((e) => (e.sales.find((s) => s.name === name)?.qty) ?? 0).filter((v) => v > 0)
    const dowAvg = dowVals.length ? dowVals.reduce((a, b) => a + b, 0) / dowVals.length : 0
    const recentAvg = recentVals.length ? recentVals.reduce((a, b) => a + b, 0) / recentVals.length : 0
    const overallAvg = agg.qty / agg.count

    const blended = weightedAverage(
      [dowAvg || overallAvg, recentAvg || overallAvg, overallAvg],
      [3, 2, 1]
    )

    const weatherFactor = rainy ? 0.8 : 1.0
    const forecast = Math.max(0, Math.round(blended * weatherFactor))
    itemForecasts.push({ name, forecast, price: agg.price, dowAvg: Math.round(dowAvg), recentAvg: Math.round(recentAvg) })
  }

  itemForecasts.sort((a, b) => b.forecast - a.forecast)

  const revenue = itemForecasts.reduce((sum, i) => sum + i.forecast * i.price, 0)
  const revenueLow = Math.round(revenue * 0.88)
  const revenueHigh = Math.round(revenue * 1.12)

  const summary = buildSummary({ dayLabel: DOW_LABELS[targetDow], items: itemForecasts, rainy, recent, sameDow, revenue: Math.round(revenue) })

  return {
    date: tmr,
    dayLabel: DOW_LABELS[targetDow],
    items: itemForecasts,
    summary,
    revenueLow,
    revenueHigh,
    confidence,
  }
}

function buildSummary({ dayLabel, items, rainy, recent, sameDow, revenue }) {
  if (!items.length) return `${dayLabel} is wide open — log a few days of sales to start forecasting.`

  const top = items[0]
  const isWeekend = dayLabel === 'Saturday' || dayLabel === 'Sunday'

  const parts = []

  if (rainy) {
    parts.push(`Rain in the forecast — expect a quieter ${dayLabel}, around 20% softer than usual.`)
  } else if (isWeekend) {
    parts.push(`Expect a busy ${dayLabel} — weekend traffic typically lifts pastry and cold drinks.`)
  } else if (dayLabel === 'Tuesday') {
    parts.push(`Tuesdays tend to be your slowest day — keep prep tight.`)
  } else {
    parts.push(`${dayLabel} is shaping up around your recent average.`)
  }

  parts.push(`Lead with ${top.forecast} ${top.name.toLowerCase()}${top.forecast === 1 ? '' : 's'}.`)

  const pastry = items.find((i) => /croissant|muffin|toast/i.test(i.name))
  if (pastry && isWeekend) {
    parts.push(`Bump ${pastry.name.toLowerCase()} prep ~20% — you tend to run low by mid-morning on weekends.`)
  }

  if (sameDow.length >= 3) {
    parts.push(`Forecast blends your last ${recent.length} days with ${sameDow.length} prior ${dayLabel}s.`)
  }

  parts.push(`Projected revenue around $${revenue.toLocaleString()}.`)

  return parts.join(' ')
}

export function weeklyTrend(entries, days = 14) {
  if (!entries || entries.length === 0) return []
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-days)
  return sorted.map((e) => ({
    date: e.date.slice(5),
    revenue: e.revenue ?? (e.sales || []).reduce((s, x) => s + x.qty * (x.price || 0), 0),
    units: (e.sales || []).reduce((s, x) => s + x.qty, 0),
  }))
}

export function todayStats(entries, waste) {
  const todayStr = new Date().toISOString().slice(0, 10)
  const sorted = [...(entries || [])].sort((a, b) => b.date.localeCompare(a.date))
  const latest = sorted[0]
  const wasteWeek = (waste || []).filter((w) => {
    const d = new Date(w.date)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    return d >= cutoff
  })
  const wasteCost = wasteWeek.reduce((s, w) => s + (w.cost || 0), 0)
  return {
    latestDate: latest?.date,
    latestRevenue: latest?.revenue ?? 0,
    latestUnits: (latest?.sales || []).reduce((s, x) => s + x.qty, 0),
    wasteWeekCost: Math.round(wasteCost * 100) / 100,
    wasteWeekCount: wasteWeek.length,
    isToday: latest?.date === todayStr,
  }
}
