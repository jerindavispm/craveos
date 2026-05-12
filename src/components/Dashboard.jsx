import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Coffee, Pencil, Check, X, Download, Trash2, Eraser, ArrowLeft, Calendar, TrendingUp, AlertCircle } from 'lucide-react'
import StatTile from './StatTile'
import ForecastCard from './ForecastCard'
import TrendChart from './TrendChart'
import WasteLog from './WasteLog'
import QuickEntry from './QuickEntry'
import CsvUpload from './CsvUpload'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import ConfirmDialog from './ConfirmDialog'
import WeatherBadge from './WeatherBadge'
import { forecastTomorrow, weeklyTrend, todayStats } from '../lib/forecast'
import { revenueInsight, wasteInsight } from '../lib/insights'
import {
  getActiveWorkspace,
  clearWorkspace,
  renameWorkspace,
  deleteWorkspace,
  canDeleteWorkspace,
} from '../lib/storage'
import { downloadCsv } from '../lib/csv'

export default function Dashboard({ onHome, version }) {
  const [tab, setTab] = useState('overview')
  const [rainy, setRainy] = useState(false)
  const [weatherApplied, setWeatherApplied] = useState(false)
  const [workspace, setWorkspace] = useState(() => getActiveWorkspace())
  const refresh = useCallback(() => setWorkspace(getActiveWorkspace()), [])

  useEffect(() => { setWorkspace(getActiveWorkspace()) }, [version])

  const handleWeather = (w) => {
    if (!weatherApplied && w) {
      setRainy(!!w.rainy)
      setWeatherApplied(true)
    }
  }

  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const forecast = useMemo(() => forecastTomorrow(workspace.entries, { rainy }), [workspace.entries, rainy])
  const trend = useMemo(() => weeklyTrend(workspace.entries, 14), [workspace.entries])
  const stats = useMemo(() => todayStats(workspace.entries, workspace.waste), [workspace.entries, workspace.waste])
  const revInsight = useMemo(() => revenueInsight(workspace.entries), [workspace.entries])
  const wstInsight = useMemo(() => wasteInsight(workspace.entries, workspace.waste), [workspace.entries, workspace.waste])
  const deletable = canDeleteWorkspace(workspace.id)

  const onExportCsv = () => {
    downloadCsv(`${slug(workspace.name)}-sales.csv`, workspace.entries || [])
  }
  const onConfirmClear = () => {
    clearWorkspace(workspace.id)
    setConfirmClear(false)
    location.reload()
  }
  const onConfirmDelete = () => {
    deleteWorkspace(workspace.id)
    setConfirmDelete(false)
    onHome()
  }

  const handleRename = (name) => {
    renameWorkspace(workspace.id, name)
    refresh()
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(50%_30%_at_50%_0%,rgba(244,114,57,0.08),transparent_70%)]" />

      <header className="sticky top-0 z-20 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <motion.button
            onClick={onHome}
            whileHover="hover"
            className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight"
            aria-label="Back to home"
          >
            <motion.span
              variants={{ hover: { x: -2, borderColor: 'rgba(251,146,60,0.4)' } }}
              className="flex size-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60 transition-colors"
            >
              <motion.span variants={{ hover: { x: -1 } }} className="inline-flex">
                <ArrowLeft size={14} className="text-neutral-400 transition group-hover:text-orange-300" />
              </motion.span>
            </motion.span>
            <Logo />
            <span className="hidden sm:inline">CraveOS</span>
          </motion.button>
          <div className="flex items-center gap-1.5">
            <WeatherBadge onWeather={handleWeather} />
            <WorkspaceSwitcher onChange={refresh} />
            <button onClick={onExportCsv} className="hidden h-8 items-center gap-1.5 rounded-lg border border-neutral-800 px-3 text-xs text-neutral-300 transition hover:border-neutral-600 sm:inline-flex">
              <Download size={13} /> Export CSV
            </button>
            <button
              onClick={() => setConfirmClear(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-800 px-3 text-xs text-neutral-300 transition hover:border-amber-500/40 hover:text-amber-300"
            >
              <Eraser size={13} /> Clear data
            </button>
            {deletable && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 text-xs text-rose-300 transition hover:bg-rose-500/10"
              >
                <Trash2 size={13} /> Delete cafe
              </button>
            )}
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4 md:px-6">
          {[
            ['overview', 'Overview'],
            ['entry', 'Quick entry'],
            ['import', 'Import CSV'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative -mb-px px-3 py-2 text-sm transition ${
                tab === id ? 'text-orange-300' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {label}
              {tab === id && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-orange-400"
                />
              )}
            </button>
          ))}
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 md:px-6">
        <AnimatePresence mode="wait">
          {tab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <EditableTitle
                name={workspace.name}
                onRename={handleRename}
                subtitle={`${(workspace.entries || []).length} days of data · forecast for ${forecast.dayLabel}`}
              />

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <StatTile
                  index={0}
                  Icon={Calendar}
                  iconAnim="bob"
                  label="Last day logged"
                  value={stats.latestDate ? new Date(stats.latestDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                  hint={stats.isToday ? 'Today' : stats.latestDate ? 'Latest entry' : 'No entries yet'}
                />
                <StatTile
                  index={1}
                  Icon={TrendingUp}
                  iconAnim="glow"
                  label="Revenue"
                  value={stats.latestRevenue}
                  format={(v) => `$${Math.round(v).toLocaleString()}`}
                  hint={`${stats.latestUnits} units sold`}
                  insight={revInsight}
                  accent
                />
                <StatTile
                  index={2}
                  Icon={AlertCircle}
                  iconAnim="pulse"
                  label="Waste · 7d"
                  value={stats.wasteWeekCost}
                  format={(v) => `$${v.toFixed(2)}`}
                  hint={`${stats.wasteWeekCount} incidents`}
                  insight={wstInsight}
                />
              </div>

              <ForecastCard forecast={forecast} rainy={rainy} onToggleRain={() => setRainy((v) => !v)} />

              <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                <TrendChart data={trend} />
                <WasteLog waste={workspace.waste || []} onChange={() => location.reload()} />
              </div>
            </motion.div>
          )}

          {tab === 'entry' && (
            <motion.div
              key="entry"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mx-auto max-w-2xl"
            >
              <QuickEntry workspace={workspace} onSaved={() => location.reload()} />
            </motion.div>
          )}

          {tab === 'import' && (
            <motion.div
              key="import"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mx-auto max-w-2xl"
            >
              <CsvUpload onImported={() => location.reload()} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ConfirmDialog
        open={confirmClear}
        title={`Clear all data in "${workspace.name}"?`}
        message="This wipes every logged sale and waste entry for this cafe. The cafe itself stays. This cannot be undone."
        confirmLabel="Clear data"
        danger
        onConfirm={onConfirmClear}
        onCancel={() => setConfirmClear(false)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete "${workspace.name}"?`}
        message="This permanently removes the cafe and all its sales and waste data from your browser. This cannot be undone."
        confirmLabel="Delete cafe"
        danger
        onConfirm={onConfirmDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}

function EditableTitle({ name, onRename, subtitle }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const inputRef = useRef(null)

  useEffect(() => { setDraft(name) }, [name])
  useEffect(() => { if (editing) inputRef.current?.select() }, [editing])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== name) onRename(trimmed)
    setEditing(false)
  }
  const cancel = () => { setDraft(name); setEditing(false) }

  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
          <Coffee size={12} className="text-orange-400" /> Cafe
        </div>
        {editing ? (
          <form onSubmit={(e) => { e.preventDefault(); commit() }} className="mt-1 flex items-center gap-2">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && cancel()}
              maxLength={48}
              className="border-b border-orange-400/60 bg-transparent text-2xl font-semibold tracking-tight text-neutral-100 focus:outline-none md:text-3xl"
            />
            <button type="submit" className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-500/10" aria-label="Save name">
              <Check size={16} />
            </button>
            <button type="button" onClick={cancel} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-800" aria-label="Cancel">
              <X size={16} />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="group mt-1 flex items-baseline gap-2 text-left text-2xl font-semibold tracking-tight md:text-3xl"
          >
            <span>{name}</span>
            <Pencil size={14} className="translate-y-[-2px] text-neutral-600 opacity-0 transition group-hover:text-orange-300 group-hover:opacity-100" />
          </button>
        )}
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
    </div>
  )
}

function slug(s) {
  return (s || 'workspace').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function Logo() {
  return (
    <div className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-orange-400 to-amber-500 text-neutral-950 shadow-lg shadow-orange-500/20">
      <Coffee size={14} strokeWidth={2.5} />
    </div>
  )
}
