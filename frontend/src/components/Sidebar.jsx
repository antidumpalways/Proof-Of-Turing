import React, { useState } from 'react'

const SECTIONS = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    ],
  },
  {
    title: 'Trust & Policy',
    items: [
      { id: 'trust', label: 'Trust Dashboard', icon: 'shield' },
      { id: 'policy', label: 'Policy Designer', icon: 'policy' },
      { id: 'threats', label: 'Threat Monitor', icon: 'alert', badge: 'LIVE' },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { id: 'leaderboard', label: 'Leaderboard', icon: 'trophy' },
      { id: 'insurance', label: 'Insurance Fund', icon: 'insurance' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { id: 'analytics', label: 'Analytics', icon: 'chart' },
      { id: 'monitor', label: 'Activity Log', icon: 'terminal' },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'guide', label: 'API Reference', icon: 'code' },
    ],
  },
]

const ICONS = {
  home: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  shield: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  policy: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  alert: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>,
  trophy: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0012 0V2z" /></svg>,
  insurance: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
  chart: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>,
  terminal: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>,
  code: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
}

export default function Sidebar({ activeNav, onNavChange, oracleOnline, onHome }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNav = (id) => {
    onNavChange(id)
    setMobileOpen(false)
  }

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-3 left-3 z-50 w-8 h-8 rounded-md bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center lg:hidden hover:bg-[var(--bg-card-hover)] transition-all"
      >
        <svg className="w-4 h-4 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <><path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" /></>}
        </svg>
      </button>

      <aside className={`fixed top-0 left-0 z-40 h-full w-[260px] bg-[var(--bg-sidebar)] flex flex-col transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-[var(--sidebar-border)]">
          <button onClick={onHome} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #65B3AE, #4a9d99)' }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white tracking-tight">Tripwire</div>
              <div className="text-[10px] text-[var(--sidebar-text)] font-mono">v2.0.0 · on Mantle</div>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-3 space-y-5 overflow-y-auto">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-text)]">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = activeNav === item.id
                  const badgeClass = item.badge === 'LIVE' ? 'bg-[var(--danger)]/15 text-[var(--danger)]' : 'bg-[var(--accent)]/15 text-[var(--accent)]'
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150 ${
                        active
                          ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-text-active)]'
                          : 'text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-[var(--sidebar-hover)]'
                      }`}
                    >
                      <span className={active ? 'text-[var(--accent)]' : ''}>{ICONS[item.icon]}</span>
                      {item.label}
                      {item.badge && (
                        <span className={`ml-auto px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold ${badgeClass}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[var(--sidebar-border)] p-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--sidebar-hover)]">
            <span className="relative flex w-2 h-2 shrink-0">
              {oracleOnline && <span className="absolute inset-0 rounded-full bg-[var(--success)] animate-ping opacity-40" />}
              <span className={`relative rounded-full w-2 h-2 ${oracleOnline ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-[var(--sidebar-text-active)]">{oracleOnline ? 'Oracle Online' : 'Offline'}</div>
              <div className="text-[9px] text-[var(--sidebar-text)] font-mono">Mantle Sepolia</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
