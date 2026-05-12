const MENU = [
  { name: 'Latte', base: 70, weekendBoost: 1.35, price: 5.5 },
  { name: 'Cappuccino', base: 28, weekendBoost: 1.25, price: 5.0 },
  { name: 'Cold Brew', base: 32, weekendBoost: 1.5, price: 5.25 },
  { name: 'Drip Coffee', base: 55, weekendBoost: 1.1, price: 3.75 },
  { name: 'Croissant', base: 22, weekendBoost: 1.6, price: 4.5 },
  { name: 'Avocado Toast', base: 14, weekendBoost: 1.8, price: 12.0 },
  { name: 'Blueberry Muffin', base: 16, weekendBoost: 1.4, price: 4.25 },
  { name: 'Matcha Latte', base: 18, weekendBoost: 1.45, price: 6.0 },
]

const WASTE_NOTES = [
  'Last 2 croissants tossed at close',
  '86d cold brew at 3pm — under-prepped',
  'Half pan of muffins past prime',
  'Oat milk carton curdled — full carton lost',
  'Avocados over-ripened, 4 unusable',
]

function seededRandom(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

export function generateDemoData({ days = 90, seed = Date.now() % 1_000_000 } = {}) {
  const rand = seededRandom(seed)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const entries = []
  const waste = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isTuesday = dayOfWeek === 2
    const dateStr = isoDate(date)

    const rainy = rand() < 0.12
    const weatherFactor = rainy ? 0.78 : 0.95 + rand() * 0.15
    const tuesdayDip = isTuesday ? 0.82 : 1.0

    const sales = MENU.map((m) => {
      const base = m.base
      const wkBoost = isWeekend ? m.weekendBoost : 1.0
      const noise = 0.85 + rand() * 0.3
      const qty = Math.max(0, Math.round(base * wkBoost * weatherFactor * tuesdayDip * noise))
      return { name: m.name, qty, price: m.price }
    })

    const revenue = sales.reduce((sum, s) => sum + s.qty * s.price, 0)

    entries.push({
      id: `demo-${dateStr}`,
      date: dateStr,
      sales,
      revenue: Math.round(revenue * 100) / 100,
      weather: rainy ? 'rainy' : 'clear',
      note: rainy ? 'Slower day, rain' : isWeekend ? 'Busy weekend' : '',
    })

    if (rand() < 0.35) {
      const note = WASTE_NOTES[Math.floor(rand() * WASTE_NOTES.length)]
      const cost = Math.round((4 + rand() * 22) * 100) / 100
      waste.push({ id: `wd-${dateStr}`, date: dateStr, note, cost })
    }
  }

  const items = MENU.map((m) => ({ name: m.name, price: m.price }))

  return { name: 'Brew Haven Cafe (Demo)', items, entries, waste }
}
