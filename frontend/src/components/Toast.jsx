import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

const TYPES = {
  success: { bg: 'bg-[var(--success)]/10 border-[var(--success)]/20', icon: 'check', color: 'text-[var(--success)]' },
  error: { bg: 'bg-[var(--danger)]/10 border-[var(--danger)]/20', icon: 'x', color: 'text-[var(--danger)]' },
  info: { bg: 'bg-[var(--accent-subtle)] border-[var(--accent)]/20', icon: 'info', color: 'text-[var(--accent)]' },
  warning: { bg: 'bg-[var(--warning)]/10 border-[var(--warning)]/20', icon: 'alert', color: 'text-[var(--warning)]' },
}

const ICONS = {
  check: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
  x: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
  info: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
  alert: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
}

function ToastItem({ toast, onRemove }) {
  const t = TYPES[toast.type] || TYPES.info
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration || 4000)
    return () => clearTimeout(timer)
  }, [toast, onRemove])

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl shadow-black/20 ${t.bg} transition-all duration-300 ${
        exiting ? 'opacity-0 translate-x-4 scale-95' : visible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-95'
      }`}
    >
      <span className={`${t.color} mt-0.5 shrink-0`}>{ICONS[t.icon]}</span>
      <p className="text-[12px] text-[var(--text-primary)] leading-relaxed flex-1">{toast.message}</p>
      <button
        onClick={() => { setExiting(true); setTimeout(() => onRemove(toast.id), 300) }}
        className="text-[var(--text-faint)] hover:text-[var(--text-secondary)] transition-colors"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 w-80 max-w-[calc(100vw-2rem)] pointer-events-none">
        <div className="space-y-2 pointer-events-auto">
          {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}
        </div>
      </div>
    </ToastContext.Provider>
  )
}
