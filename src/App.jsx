import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Landing from './components/Landing'
import Dashboard from './components/Dashboard'
import { generateDemoData } from './lib/seed'
import {
  getState,
  listWorkspaces,
  replaceWorkspaceData,
  setActiveWorkspace,
  upsertWorkspace,
  createWorkspace,
  getActiveWorkspace,
} from './lib/storage'

export default function App() {
  const [view, setView] = useState(() => {
    const ws = getActiveWorkspace()
    return ws && ((ws.entries || []).length > 0 || (ws.waste || []).length > 0) ? 'dashboard' : 'landing'
  })
  const [version, setVersion] = useState(0)
  const [workspaces, setWorkspaces] = useState(() => listWorkspaces())
  const [activeId, setActiveId] = useState(() => getState().active)

  const bump = useCallback(() => {
    setVersion((v) => v + 1)
    setWorkspaces(listWorkspaces())
    setActiveId(getState().active)
  }, [])

  useEffect(() => {
    document.title = view === 'dashboard' ? 'CraveOS · Dashboard' : 'CraveOS — AI prep sheet for cafes'
  }, [view])

  const handleOpenDemo = () => {
    const data = generateDemoData({ days: 90 })
    replaceWorkspaceData('demo', data)
    setActiveWorkspace('demo')
    bump()
    setView('dashboard')
  }

  const handleStartFresh = () => {
    const s = getState()
    if (!s.workspaces.mine) upsertWorkspace('mine', { name: 'My Cafe', items: [], entries: [], waste: [] })
    setActiveWorkspace('mine')
    bump()
    setView('dashboard')
  }

  const handleOpenWorkspace = (id) => {
    setActiveWorkspace(id)
    bump()
    setView('dashboard')
  }

  const handleCreateCafe = () => {
    const name = prompt('Name your cafe:', 'My Cafe')
    if (name === null) return
    const trimmed = name.trim() || 'My Cafe'
    createWorkspace(trimmed)
    bump()
    setView('dashboard')
  }

  return (
    <AnimatePresence mode="wait">
      {view === 'landing' ? (
        <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
          <Landing
            workspaces={workspaces}
            activeId={activeId}
            onOpenDemo={handleOpenDemo}
            onOpenWorkspace={handleOpenWorkspace}
            onCreateCafe={handleCreateCafe}
            onStartFresh={handleStartFresh}
          />
        </motion.div>
      ) : (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
          <Dashboard onHome={() => { bump(); setView('landing') }} version={version} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
