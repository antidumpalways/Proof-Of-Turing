import React, { useState, useEffect, useRef } from 'react'

export default function CommandPalette({ open, onClose, actions }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) { setQuery(''); setSelected(0); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && filtered[selected]) { filtered[selected].action(); onClose() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, selected, query])

  if (!open) return null

  const filtered = (actions || []).filter(a => a.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden animate-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
          <svg className="w-4 h-4 text-[var(--text-muted)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" /></svg>
          <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setSelected(0) }} placeholder="Type a command..." className="flex-1 bg-transparent text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none" />
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-inset)] text-[var(--text-muted)] border border-[var(--border)]">ESC</kbd>
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-[12px] text-[var(--text-muted)]">No results found</div>
          ) : (
            filtered.map((action, i) => (
              <button key={i} onClick={() => { action.action(); onClose() }} onMouseEnter={() => setSelected(i)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${i === selected ? 'bg-[var(--accent-subtle)]' : 'hover:bg-[var(--bg-inset)]'}`}>
                <span className="text-[var(--text-muted)]">{action.icon}</span>
                <span className="text-[13px] text-[var(--text-primary)]">{action.label}</span>
                {action.shortcut && <kbd className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-mono bg-[var(--bg-inset)] text-[var(--text-muted)] border border-[var(--border)]">{action.shortcut}</kbd>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
