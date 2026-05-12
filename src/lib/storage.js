const ROOT_KEY = 'craveos:v1'

const empty = () => ({
  workspaces: {
    mine: { name: 'My Cafe', items: [], entries: [], waste: [], createdAt: Date.now() },
  },
  active: 'mine',
})

function read() {
  if (typeof window === 'undefined') return empty()
  try {
    const raw = window.localStorage.getItem(ROOT_KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw)
    if (!parsed.workspaces || !parsed.active) return empty()
    return parsed
  } catch {
    return empty()
  }
}

function write(state) {
  window.localStorage.setItem(ROOT_KEY, JSON.stringify(state))
}

export function getState() {
  return read()
}

export function getActiveWorkspace() {
  const s = read()
  return { id: s.active, ...s.workspaces[s.active] }
}

export function listWorkspaces() {
  const s = read()
  return Object.entries(s.workspaces).map(([id, w]) => ({ id, name: w.name }))
}

export function setActiveWorkspace(id) {
  const s = read()
  if (!s.workspaces[id]) return
  s.active = id
  write(s)
}

export function upsertWorkspace(id, patch) {
  const s = read()
  s.workspaces[id] = { ...(s.workspaces[id] || { name: id, items: [], entries: [], waste: [], createdAt: Date.now() }), ...patch }
  write(s)
}

export function deleteWorkspace(id) {
  const s = read()
  const ids = Object.keys(s.workspaces)
  if (!s.workspaces[id]) return false
  if (ids.length <= 1) return false
  delete s.workspaces[id]
  if (s.active === id) s.active = Object.keys(s.workspaces)[0]
  write(s)
  return true
}

export function canDeleteWorkspace(id) {
  const s = read()
  return Object.keys(s.workspaces).length > 1 && !!s.workspaces[id]
}

export function renameWorkspace(id, name) {
  const s = read()
  if (!s.workspaces[id]) return
  s.workspaces[id].name = name.trim() || s.workspaces[id].name
  write(s)
}

export function createWorkspace(name) {
  const s = read()
  const trimmed = (name || 'New Cafe').trim() || 'New Cafe'
  let id = slugify(trimmed)
  if (!id) id = `cafe-${Date.now()}`
  let suffix = 1
  let unique = id
  while (s.workspaces[unique]) unique = `${id}-${++suffix}`
  s.workspaces[unique] = { name: trimmed, items: [], entries: [], waste: [], createdAt: Date.now() }
  s.active = unique
  write(s)
  return unique
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32)
}

export function addEntry(entry) {
  const s = read()
  const ws = s.workspaces[s.active]
  ws.entries = [...(ws.entries || []), { ...entry, id: crypto.randomUUID?.() || String(Date.now() + Math.random()) }]
  for (const sale of entry.sales || []) {
    if (!ws.items.find((i) => i.name.toLowerCase() === sale.name.toLowerCase())) {
      ws.items.push({ name: sale.name })
    }
  }
  write(s)
}

export function addWaste(entry) {
  const s = read()
  const ws = s.workspaces[s.active]
  ws.waste = [...(ws.waste || []), { ...entry, id: crypto.randomUUID?.() || String(Date.now() + Math.random()) }]
  write(s)
}

export function replaceWorkspaceData(id, { name, items, entries, waste }) {
  const s = read()
  s.workspaces[id] = {
    name: name ?? s.workspaces[id]?.name ?? id,
    items: items ?? [],
    entries: entries ?? [],
    waste: waste ?? [],
    createdAt: s.workspaces[id]?.createdAt ?? Date.now(),
  }
  write(s)
}

export function clearWorkspace(id) {
  const s = read()
  if (!s.workspaces[id]) return
  s.workspaces[id].entries = []
  s.workspaces[id].waste = []
  s.workspaces[id].items = []
  write(s)
}

export function exportWorkspace(id) {
  const s = read()
  return s.workspaces[id]
}
