import React, { useState, useCallback, useEffect } from 'react'
import { useTripwireData } from './hooks/useTripwireData'
import AgentList from './components/AgentList'
import VerificationBadge from './components/VerificationBadge'
import LiveMonitor from './components/LiveMonitor'
import Sidebar from './components/Sidebar'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider, useToast } from './components/Toast'
import CommandPalette from './components/CommandPalette'
import ArchitectureDiagram from './components/ArchitectureDiagram'
import { AnimatedNumber, ProgressBar, FadeIn, Stagger, Tooltip } from './components/Motion'
import Leaderboard from './components/Leaderboard'
import Analytics from './components/Analytics'
import Guide from './components/Onboarding'
import PolicyDesigner from './components/PolicyDesigner'
import TrustDashboard from './components/TrustDashboard'
import ThreatMonitor from './components/ThreatMonitor'
import InsurancePanel from './components/InsurancePanel'

export default function App() {
  const [page, setPage] = useState('landing')
  if (page === 'landing') return <Landing onEnter={() => setPage('app')} />
  return (
    <ToastProvider>
      <ErrorBoundary>
        <AppShell onHome={() => setPage('landing')} />
      </ErrorBoundary>
    </ToastProvider>
  )
}

function Landing({ onEnter }) {
  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-white font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 border-b border-[var(--border)]" style={{ background: 'rgba(10, 10, 15, 0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #65B3AE, #4a9d99)' }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
          </div>
          <span className="text-sm font-semibold">Tripwire</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/antidumpalways/Proof-Of-Turing" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">GitHub</a>
          <button onClick={onEnter} className="px-4 py-1.5 rounded-md text-white text-xs font-semibold transition-colors" style={{ background: 'linear-gradient(135deg, #65B3AE, #4a9d99)' }}>Open Dashboard</button>
        </div>
      </nav>
      <div className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-white/50 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"></span>
              Agentic Economy Track — Turing Test Hackathon 2026
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 className="text-[clamp(40px,6vw,64px)] font-bold leading-[1.1] tracking-tight mb-6">
              Trust & policy enforcement<br /><span style={{ color: '#65B3AE' }}>for autonomous AI agents</span>
            </h1>
          </FadeIn>
      <FadeIn delay={150}>
        <ArchitectureDiagram />
      </FadeIn>

      <FadeIn delay={200}>
            <p className="text-lg text-white/50 max-w-2xl leading-relaxed mb-10">Behavioral Attestation, No-Code Policy Engine, Threat Monitor, and Insurance Fund — the decentralized trust layer Mantle agents need to operate safely.</p>
          </FadeIn>
          <FadeIn delay={300}>
            <div className="flex items-center gap-3 mb-16">
              <button onClick={onEnter} className="px-5 py-2.5 rounded-md text-white text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all" style={{ background: 'linear-gradient(135deg, #65B3AE, #4a9d99)' }}>Open Dashboard</button>
              <a href="https://github.com/antidumpalways/Proof-Of-Turing" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-md bg-white/5 text-white/70 text-sm font-medium border border-white/10 hover:bg-white/10 transition-colors">View Source</a>
            </div>
          </FadeIn>
          <Stagger stagger={80} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Behavioral Attestation', desc: 'Reputation scoring from on-chain behavior', color: '#58a6ff' },
              { label: 'No-Code Policies', desc: 'Visual policy designer for tx limits, allowlists', color: '#a371f7' },
              { label: 'Threat Monitor', desc: 'Real-time anomaly detection + quarantine', color: '#ef4444' },
              { label: 'Insurance Fund', desc: 'Staking + slashing + compensation', color: '#34d399' },
            ].map((s, i) => (
              <div key={i} className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-4 hover:bg-white/[0.04] hover:border-white/[0.12] hover:scale-[1.02] transition-all duration-300 cursor-default">
                <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: s.color }} />
                <div className="text-sm font-semibold text-white/90 mb-1">{s.label}</div>
                <div className="text-xs text-white/30">{s.desc}</div>
              </div>
            ))}
          </Stagger>
        </div>
      </div>
    </div>
  )
}

function AppShell({ onHome }) {
  const addToast = useToast()
  const { agents, totalAgents, loading, error, page, totalPages, oracleStatus, getAgentScore, getScoreHistory, setPage: setPageHook, getGuardStatus, getThreatHistory } = useTripwireData()
  const [nav, setNav] = useState('dashboard')
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [guardData, setGuardData] = useState(null)
  const [lookupWallet, setLookupWallet] = useState('')
  const [cmdOpen, setCmdOpen] = useState(false)

  const stats = {
    total: totalAgents,
    verified: agents.filter(a => a.is_verified).length,
    avgScore: agents.length ? Math.round(agents.reduce((s, a) => s + (a.agentic_score || 0), 0) / agents.length) : 0,
    heartbeats: agents.reduce((s, a) => s + (a.heartbeats_count || 0), 0),
    quarantined: agents.filter(a => a.is_quarantined).length,
    atRisk: agents.filter(a => (a.risk_score || 0) >= 60).length,
  }

  const cmdActions = [
    { label: 'Go to Dashboard', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>, action: () => setNav('dashboard'), shortcut: 'G D' },
    { label: 'Go to Trust Dashboard', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, action: () => setNav('trust'), shortcut: 'G T' },
    { label: 'Go to Policy Designer', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, action: () => setNav('policy'), shortcut: 'G P' },
    { label: 'Go to Threat Monitor', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>, action: () => setNav('threats'), shortcut: 'G H' },
    { label: 'Go to Leaderboard', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0012 0V2z" /></svg>, action: () => setNav('leaderboard'), shortcut: 'G L' },
    { label: 'Go to Insurance', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>, action: () => setNav('insurance'), shortcut: 'G I' },
    { label: 'Go to Analytics', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>, action: () => setNav('analytics'), shortcut: 'G T' },
    { label: 'Go to Activity Log', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>, action: () => setNav('monitor'), shortcut: 'G M' },
  ]

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(o => !o) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleAgentClick = useCallback(async (agent) => {
    setSelected(agent); setDetailLoading(true); setGuardData(null)
    try {
      const [d, h, g, t] = await Promise.all([
        getAgentScore(agent.wallet),
        getScoreHistory(agent.wallet),
        getGuardStatus(agent.wallet).catch(() => null),
        getThreatHistory(agent.wallet).catch(() => null),
      ])
      setDetail({ ...d, history: h })
      setGuardData({ ...g, threatHistory: t })
    } catch (e) { setDetail({ error: e.message }) }
    finally { setDetailLoading(false) }
  }, [getAgentScore, getScoreHistory, getGuardStatus, getThreatHistory])

  const handleLookup = useCallback((address) => {
    setSelected(null)
    setDetail(null)
    setGuardData(null)
    setLookupWallet(address)
    setNav('trust')
  }, [])

  const isOnline = oracleStatus?.status === 'running' || oracleStatus?.status === 'ok'
  const navLabel = {
    dashboard: 'Dashboard',
    trust: 'Trust Dashboard',
    policy: 'Policy Designer',
    threats: 'Threat Monitor',
    leaderboard: 'Leaderboard',
    insurance: 'Insurance Fund',
    analytics: 'Analytics',
    monitor: 'Activity Log',
    guide: 'API Reference',
  }

  const renderContent = () => {
    if (selected) return <AgentDetail agent={selected} detail={detail} loading={detailLoading} guardData={guardData} onBack={() => { setSelected(null); setDetail(null); setGuardData(null) }} />
    switch (nav) {
      case 'dashboard': return <DashboardView agents={agents} loading={loading} error={error} page={page} totalPages={totalPages} totalAgents={totalAgents} stats={stats} onPageChange={setPageHook} onAgentClick={handleAgentClick} onLookup={handleLookup} />
      case 'trust': return <TrustDashboard initialWallet={lookupWallet} />
      case 'policy': return <PolicyDesigner initialWallet="" onPolicySet={() => addToast('Policy saved', 'success')} />
      case 'threats': return <ThreatMonitor />
      case 'leaderboard': return <Leaderboard onAgentClick={handleAgentClick} />
      case 'insurance': return <InsurancePanel />
      case 'analytics': return <Analytics />
      case 'monitor': return <LiveMonitor />
      case 'guide': return <Guide />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-body)] font-sans">
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} actions={cmdActions} />
      <Sidebar activeNav={selected ? null : nav} onNavChange={(id) => { setSelected(null); setDetail(null); setGuardData(null); setNav(id) }} oracleOnline={isOnline} onHome={onHome} />
      <main className="lg:pl-[260px] min-h-screen">
        <div className="sticky top-0 z-30 h-12 flex items-center justify-between px-6 bg-[var(--bg-body)]/80 backdrop-blur-xl border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-semibold text-[var(--text-primary)]">{navLabel[nav]}</span>
            {selected && <><svg className="w-3 h-3 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg><span className="text-[12px] text-[var(--text-muted)] font-mono">{selected.wallet?.slice(0, 10)}...</span></>}
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content="Press Cmd+K to open command palette">
              <button onClick={() => setCmdOpen(true)} className="flex items-center gap-2 px-2 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[11px] text-[var(--text-muted)] hover:border-[var(--border-hover)] transition-colors">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" /></svg>
                <span className="hidden sm:inline">Search</span>
                <kbd className="px-1 py-0.5 rounded text-[9px] font-mono bg-[var(--bg-inset)] border border-[var(--border)]">&#8984;K</kbd>
              </button>
            </Tooltip>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[10px] font-mono text-[var(--text-muted)]">
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`} />
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  )
}

function DashboardView({ agents, loading, error, page, totalPages, totalAgents, stats, onPageChange, onAgentClick, onLookup }) {
  const [quickWallet, setQuickWallet] = useState('')
  const isValid = /^0x[a-fA-F0-9]{40}$/.test(quickWallet)

  return (
    <div className="space-y-6 animate-in">
      <FadeIn>
        <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-4 hover:border-[var(--border-hover)] transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" /></svg>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Wallet Lookup</span>
            <Tooltip content="Open the Trust Dashboard for any wallet">
              <svg className="w-3.5 h-3.5 text-[var(--text-faint)] cursor-help" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
            </Tooltip>
          </div>
          <div className="flex gap-2">
            <input value={quickWallet} onChange={e => setQuickWallet(e.target.value)} placeholder="Enter wallet address (0x...)" className="flex-1 bg-[var(--bg-inset)] border border-[var(--border)] rounded-md px-3 py-2 text-[13px] font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all" />
            <Tooltip content="Open Trust Dashboard" side="bottom">
              <button onClick={() => onLookup(quickWallet)} disabled={!isValid} className="px-4 py-2 rounded-md bg-[var(--accent-subtle)] text-[var(--accent)] text-[12px] font-semibold border border-[var(--accent)]/20 hover:bg-[var(--accent)]/15 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 transition-all">Lookup</button>
            </Tooltip>
          </div>
        </div>
      </FadeIn>

      <Stagger stagger={60} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'WALLETS TRACKED', value: stats.total, cls: 'text-[var(--text-primary)]' },
          { label: 'VERIFIED AGENTS', value: stats.verified, cls: 'text-[var(--success)]' },
          { label: 'AT-RISK', value: stats.atRisk, cls: stats.atRisk > 0 ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]' },
          { label: 'QUARANTINED', value: stats.quarantined, cls: stats.quarantined > 0 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]' },
        ].map((s, i) => (
          <div key={i} className="group rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-4 hover:border-[var(--border-hover)] hover:shadow-sm transition-all cursor-default">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider">{s.label}</span>
            </div>
            <AnimatedNumber value={s.value} className={`text-2xl font-bold font-mono ${s.cls}`} />
          </div>
        ))}
      </Stagger>

      <FadeIn delay={200}>
        <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">Analyzed Wallets</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--bg-inset)] text-[var(--text-muted)]">{totalAgents}</span>
            </div>
          </div>
          <AgentList agents={agents} loading={loading} error={error} page={page} totalPages={totalPages} totalAgents={totalAgents} onPageChange={onPageChange} onAgentClick={onAgentClick} onSearch={onScan} />
        </div>
      </FadeIn>
    </div>
  )
}

function AgentDetail({ agent, detail, loading, guardData, onBack }) {
  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-24 rounded bg-[var(--bg-inset)] animate-pulse" />
      <div className="h-32 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] animate-pulse" />
      <div className="h-48 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] animate-pulse" />
    </div>
  )

  if (!detail || detail.error) return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        Back
      </button>
      <div className="rounded-lg bg-[var(--danger)]/5 border border-[var(--danger)]/20 p-4">
        <p className="text-[13px] text-[var(--danger)]">Failed to load details.</p>
      </div>
    </div>
  )

  const score = detail.off_chain?.score || 0
  const components = detail.off_chain?.components || {}
  const verification = detail.verification || {}
  const comps = Object.entries(components)
  const isVerified = score >= 70
  const scoreColor = isVerified ? 'text-[var(--success)]' : score >= 40 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'
  const riskScore = guardData?.risk_score ?? agent.risk_score ?? 0
  const threatLevel = guardData?.threat_level || 'None'
  const isQuarantined = guardData?.is_quarantined ?? agent.is_quarantined ?? false
  const riskColor = riskScore >= 80 ? 'text-[var(--danger)]' : riskScore >= 60 ? 'text-[var(--warning)]' : riskScore >= 40 ? 'text-amber-400' : 'text-[var(--success)]'
  const threatColor = { None: 'text-[var(--text-muted)]', Low: 'text-[var(--warning)]', Medium: 'text-amber-400', High: 'text-[var(--danger)]', Critical: 'text-red-600' }[threatLevel] || 'text-[var(--text-muted)]'

  return (
    <div className="space-y-4 animate-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        Back
      </button>

      {isQuarantined && (
        <div className="rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/30 p-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-[var(--danger)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
          <span className="text-[12px] font-semibold text-[var(--danger)]">QUARANTINED</span>
          <span className="text-[11px] text-[var(--danger)]/70 font-mono">{guardData?.quarantine_reason || 'High risk detected'}</span>
        </div>
      )}

      <FadeIn>
        <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-5 hover:border-[var(--border-hover)] transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-mono text-[13px] text-[var(--text-primary)] mb-2">{agent.wallet}</div>
              <div className="flex items-center gap-2">
                <VerificationBadge status={isVerified ? 'verified' : score >= 40 ? 'pending' : 'failed'} score={score} />
                <span className="text-[11px] text-[var(--text-muted)] font-mono">{agent.heartbeats_count || 0} heartbeats</span>
              </div>
            </div>
            <div className="text-right">
              <AnimatedNumber value={score} className={`text-5xl font-bold font-mono ${scoreColor}`} />
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Agentic Score</div>
            </div>
          </div>
        </div>
      </FadeIn>

      {guardData && (
        <FadeIn delay={50}>
          <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-5 hover:border-[var(--border-hover)] transition-colors">
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Guard Status</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-md bg-[var(--bg-inset)]">
                <AnimatedNumber value={riskScore} className={`text-2xl font-bold font-mono ${riskColor}`} />
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Risk Score</div>
              </div>
              <div className="text-center p-3 rounded-md bg-[var(--bg-inset)]">
                <div className={`text-2xl font-bold font-mono ${threatColor}`}>{threatLevel}</div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Threat Level</div>
              </div>
              <div className="text-center p-3 rounded-md bg-[var(--bg-inset)]">
                <div className={`text-2xl font-bold font-mono ${isQuarantined ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                  {isQuarantined ? 'YES' : 'NO'}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Quarantined</div>
              </div>
            </div>
            {guardData.threatHistory && guardData.threatHistory.length > 0 && (
              <div className="mt-4">
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Recent Threats</div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {guardData.threatHistory.slice(0, 5).map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] p-2 rounded bg-[var(--bg-inset)]">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        t.severity === 'Critical' ? 'bg-red-600' :
                        t.severity === 'High' ? 'bg-[var(--danger)]' :
                        t.severity === 'Medium' ? 'bg-[var(--warning)]' : 'bg-[var(--text-muted)]'
                      }`} />
                      <span className="font-mono text-[var(--text-secondary)]">{t.threat_type || t.type}</span>
                      <span className="text-[var(--text-muted)] flex-1 truncate">{t.description || t.detail}</span>
                      <span className="text-[var(--text-faint)] font-mono text-[10px]">{t.created_at ? new Date(t.created_at * 1000).toLocaleDateString() : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      )}

      {verification.badge && (
        <FadeIn delay={100}>
          <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-5 hover:border-[var(--border-hover)] transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isVerified ? 'bg-[var(--success)]/10' : 'bg-[var(--danger)]/10'}`}>
                {isVerified ? (
                  <svg className="w-5 h-5 text-[var(--success)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-[var(--danger)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                )}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[var(--text-primary)]">{isVerified ? 'Verified AI Agent' : 'Not Verified'}</div>
                <div className="text-[11px] text-[var(--text-muted)]">{verification.badge}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-[11px] text-[var(--text-muted)]">Threshold</div>
                <div className="text-[13px] font-mono font-semibold">{verification.threshold || 70}/100</div>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {comps.length > 0 && (
        <FadeIn delay={150}>
          <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-5 hover:border-[var(--border-hover)] transition-colors">
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Analysis Components</div>
            <div className="space-y-3">
              {comps.map(([name, data]) => {
                const cs = data.score || 0
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-medium text-[var(--text-primary)]">{name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">Confidence: {data.confidence || '--'}</span>
                        <AnimatedNumber value={cs} className={`text-[13px] font-bold font-mono ${cs >= 70 ? 'text-[var(--success)]' : cs >= 40 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'}`} />
                      </div>
                    </div>
                    <ProgressBar value={cs} />
                  </div>
                )
              })}
            </div>
          </div>
        </FadeIn>
      )}

      <FadeIn delay={200}>
        <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-5 hover:border-[var(--border-hover)] transition-colors">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">On-Chain Status</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Score', value: detail.on_chain?.score ?? '--' },
              { label: 'Verified', value: detail.on_chain?.verified ? 'Yes' : 'No', color: detail.on_chain?.verified ? 'text-[var(--success)]' : 'text-[var(--text-muted)]' },
              { label: 'Heartbeats', value: agent.heartbeats_count || 0 },
            ].map((item, i) => (
              <Tooltip key={i} content={item.label}>
                <div className="text-center p-3 rounded-md bg-[var(--bg-inset)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-default">
                  <AnimatedNumber value={typeof item.value === 'number' ? item.value : 0} className={`text-[16px] font-bold font-mono ${item.color || 'text-[var(--text-primary)]'}`} />
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1">{item.label}</div>
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
