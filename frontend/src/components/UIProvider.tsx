import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Density = 'comfortable' | 'cozy' | 'compact'
type Toast = { id: number; type: 'success' | 'error' | 'info'; message: string }

type UIContextType = {
  density: Density
  setDensity: (d: Density) => void
  toasts: Toast[]
  pushToast: (t: Omit<Toast, 'id'>) => void
  removeToast: (id: number) => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensity] = useState<Density>('cozy')
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('ui_density') as Density | null
    if (saved) setDensity(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem('ui_density', density)
    const root = document.documentElement
    root.classList.remove('density-comfortable','density-cozy','density-compact')
    root.classList.add(`density-${density}`)
  }, [density])

  const pushToast = (t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, ...t }])
    setTimeout(() => removeToast(id), 4000)
  }
  const removeToast = (id: number) => setToasts(prev => prev.filter(x => x.id !== id))

  const value = useMemo(() => ({ density, setDensity, toasts, pushToast, removeToast }), [density, toasts])
  return (
    <UIContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onClose={removeToast} />
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}

function ToastStack({ toasts, onClose }: { toasts: Toast[]; onClose: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-2 rounded-lg shadow-md border text-sm bg-white ${t.type==='success'?'border-emerald-200':'t.type'==='error'?'border-red-200':'border-gray-200'}`}> 
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${t.type==='success'?'bg-emerald-500':t.type==='error'?'bg-red-500':'bg-blue-500'}`} />
            <span>{t.message}</span>
            <button onClick={()=>onClose(t.id)} className="ml-2 text-gray-500 hover:text-gray-700">✕</button>
          </div>
        </div>
      ))}
    </div>
  )
}


