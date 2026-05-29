import React, { useState } from 'react'
import { useTheme } from './ThemeContext'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'award' },
  { id: 'analytics', label: 'Analytics', icon: 'chart' },
  { id: 'verify', label: 'Verify', icon: 'search' },
  { id: 'monitor', label: 'Monitor', icon: 'activity' },
  { id: 'onboarding', label: 'Onboarding', icon: 'book' },
]

const ICONS = {
  grid: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  award: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  chart: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
  search: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  activity: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  book: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
}

export default function Sidebar({ activeNav, onNavChange, oracleOnline, onHome }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const handleNav = (id) => {
    onNavChange(id)
    setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-3 left-3 z-50 w-9 h-9 rounded-xl bg-[var(--bg-card)] border border-white/[0.06] flex items-center justify-center lg:hidden hover:bg-white/[0.06] transition-all"
      >
        <svg className="w-4 h-4 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <><path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" /></>}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-60 bg-[var(--sidebar-bg)] backdrop-blur-2xl border-r border-[var(--sidebar-border)] flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-[var(--sidebar-border)]">
          <button onClick={onHome} className="flex items-center gap-3 hover:opacity-70 transition-all">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/[0.06] flex items-center justify-center">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Proof of Turing</div>
              <div className="text-[9px] text-[var(--text-faint)] font-mono">Inverse Captcha</div>
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((n) => {
            const active = activeNav === n.id
            return (
              <button
                key={n.id}
                onClick={() => handleNav(n.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  active
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-white/50 hover:bg-[var(--bg-card)]'
                }`}
              >
                <span className={`${active ? 'text-emerald-400' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'} transition-colors`}>
                  {ICONS[n.icon]}
                </span>
                {n.label}
                {active && <span className="ml-auto w-1 h-1 rounded-full bg-emerald-400" />}
              </button>
            )
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="px-4 py-2 border-t border-[var(--sidebar-border)]">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-white/50 hover:bg-[var(--bg-card)] transition-all duration-200 group"
          >
            <span className="w-[18px] h-[18px] flex items-center justify-center">
              {theme === 'dark' ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </span>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Oracle Status */}
        <div className="p-4 border-t border-[var(--sidebar-border)]">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[var(--bg-elevated)]">
            <span className="relative flex w-2 h-2 shrink-0">
              {oracleOnline && (
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
              )}
              <span className={`relative rounded-full w-2 h-2 ${oracleOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-medium text-[var(--text-secondary)] truncate">
                {oracleOnline ? 'Oracle Online' : 'Disconnected'}
              </div>
              <div className="text-[8px] text-[var(--text-faint)] font-mono">Mantle Network</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
