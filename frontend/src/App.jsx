import React, { useState, useCallback, useEffect } from 'react'
import { usePotData } from './hooks/usePotData'
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
          <span className="text-sm font-semibold">Proof of Turing</span>
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
              Alpha & Data Track — Turing Test Hackathon 2026
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 className="text-[clamp(40px,6vw,64px)] font-bold leading-[1.1] tracking-tight mb-6">
              Multi-source intelligence<br /><span style={{ color: '#65B3AE' }}>for on-chain agents</span>
            </h1>
          </FadeIn>
      <FadeIn delay={150}>
        <ArchitectureDiagram />
      </FadeIn>

      <FadeIn delay={200}>
            <p className="text-lg text-white/50 max-w-2xl leading-relaxed mb-10">Detect and verify AI agents on Mantle using behavioral analysis, Nansen labels, Allora ML inference, and Elfa social sentiment.</p>
          </FadeIn>
          <FadeIn delay={300}>
            <div className="flex items-center gap-3 mb-16">
              <button onClick={onEnter} className="px-5 py-2.5 rounded-md text-white text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all" style={{ background: 'linear-gradient(135deg, #65B3AE, #4a9d99)' }}>Open Dashboard</button>
              <a href="https://github.com/antidumpalways/Proof-Of-Turing" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-md bg-white/5 text-white/70 text-sm font-medium border border-white/10 hover:bg-white/10 transition-colors">View Source</a>
            </div>
          </FadeIn>
          <Stagger stagger={80} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'On-chain Behavior', desc: 'Timing, gas, contract diversity', color: '#58a6ff' },
              { label: 'Entity Labels', desc: 'Nansen Smart Money, Fund, Trader', color: '#a371f7' },
              { label: 'Market Verification', desc: 'Allora ML inference patterns', color: '#d29922' },
              { label: 'Social Context', desc: 'Elfa sentiment & social volume', color: '#34d399' },
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
  const { agents, totalAgents, loading, error, page, totalPages, oracleStatus, getAgentScore, scanWallet, alphaIntelligence, getScoreHistory, setPage: setPageHook } = usePotData()
  const [nav, setNav] = useState('dashboard')
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [scanLoading, setScanLoading] = useState(false)
  const [alphaResult, setAlphaResult] = useState(null)
  const [alphaLoading, setAlphaLoading] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  const stats = {
    total: totalAgents,
    verified: agents.filter(a => a.is_verified).length,
    avgScore: agents.length ? Math.round(agents.reduce((s, a) => s + (a.agentic_score || 0), 0) / agents.length) : 0,
    heartbeats: agents.reduce((s, a) => s + (a.heartbeats_count || 0), 0),
  }

  const cmdActions = [
    { label: 'Go to Dashboard', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>, action: () => setNav('dashboard'), shortcut: 'G D' },
    { label: 'Go to Alpha Intel', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>, action: () => setNav('alpha'), shortcut: 'G A' },
    { label: 'Go to Leaderboard', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0012 0V2z" /></svg>, action: () => setNav('leaderboard'), shortcut: 'G L' },
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
    setSelected(agent); setDetailLoading(true)
    try {
      const [d, h] = await Promise.all([getAgentScore(agent.wallet), getScoreHistory(agent.wallet)])
      setDetail({ ...d, history: h })
    } catch (e) { setDetail({ error: e.message }) }
    finally { setDetailLoading(false) }
  }, [getAgentScore, getScoreHistory])

  const handleScan = useCallback(async (address) => {
    setScanLoading(true); setScanResult(null); setAlphaResult(null)
    try {
      const res = await scanWallet(address); setScanResult(res)
      addToast(`Scan: ${res.analysis?.is_verified_agent ? 'AI detected' : 'Likely human'}`, res.analysis?.is_verified_agent ? 'success' : 'info')
    } catch (e) { setScanResult({ error: e.message }); addToast('Scan failed', 'error') }
    finally { setScanLoading(false) }
  }, [scanWallet, addToast])

  const handleAlphaScan = useCallback(async (address) => {
    setAlphaLoading(true); setAlphaResult(null); setScanResult(null)
    try {
      const res = await alphaIntelligence(address); setAlphaResult(res)
      addToast(`Alpha: score ${res.alpha_score}`, 'success')
    } catch (e) { setAlphaResult({ error: e.message }); addToast('Alpha failed', 'error') }
    finally { setAlphaLoading(false) }
  }, [alphaIntelligence, addToast])

  const isOnline = oracleStatus?.status === 'running'
  const navLabel = { dashboard: 'Dashboard', alpha: 'Alpha Intel', leaderboard: 'Leaderboard', analytics: 'Analytics', monitor: 'Activity Log', guide: 'API Reference' }

  const renderContent = () => {
    if (selected) return <AgentDetail agent={selected} detail={detail} loading={detailLoading} onBack={() => { setSelected(null); setDetail(null); setScanResult(null); setAlphaResult(null) }} />
    switch (nav) {
      case 'dashboard': return <DashboardView agents={agents} loading={loading} error={error} page={page} totalPages={totalPages} totalAgents={totalAgents} stats={stats} onPageChange={setPageHook} onAgentClick={handleAgentClick} onScan={handleScan} onAlphaScan={handleAlphaScan} />
      case 'alpha': return <AlphaIntelView scanResult={scanResult} scanLoading={scanLoading} onScan={handleScan} alphaResult={alphaResult} alphaLoading={alphaLoading} onAlphaScan={handleAlphaScan} />
      case 'leaderboard': return <Leaderboard onAgentClick={handleAgentClick} />
      case 'analytics': return <Analytics />
      case 'monitor': return <LiveMonitor />
      case 'guide': return <Guide />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-body)] font-sans">
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} actions={cmdActions} />
      <Sidebar activeNav={selected ? null : nav} onNavChange={(id) => { setSelected(null); setDetail(null); setScanResult(null); setAlphaResult(null); setNav(id) }} oracleOnline={isOnline} onHome={onHome} />
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

function DashboardView({ agents, loading, error, page, totalPages, totalAgents, stats, onPageChange, onAgentClick, onScan, onAlphaScan }) {
  const [quickWallet, setQuickWallet] = useState('')
  const isValid = /^0x[a-fA-F0-9]{40}$/.test(quickWallet)

  return (
    <div className="space-y-6 animate-in">
      <FadeIn>
        <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-4 hover:border-[var(--border-hover)] transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" /></svg>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Quick Analysis</span>
            <Tooltip content="Analyze any wallet on Mantle">
              <svg className="w-3.5 h-3.5 text-[var(--text-faint)] cursor-help" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
            </Tooltip>
          </div>
          <div className="flex gap-2">
            <input value={quickWallet} onChange={e => setQuickWallet(e.target.value)} placeholder="Enter wallet address (0x...)" className="flex-1 bg-[var(--bg-inset)] border border-[var(--border)] rounded-md px-3 py-2 text-[13px] font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all" />
            <Tooltip content="On-chain behavioral scan" side="bottom">
              <button onClick={() => onScan(quickWallet)} disabled={!isValid} className="px-3 py-2 rounded-md bg-[var(--accent-subtle)] text-[var(--accent)] text-[12px] font-semibold border border-[var(--accent)]/20 hover:bg-[var(--accent)]/15 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 transition-all">Scan</button>
            </Tooltip>
            <Tooltip content="4-source alpha intelligence" side="bottom">
              <button onClick={() => onAlphaScan(quickWallet)} disabled={!isValid} className="px-3 py-2 rounded-md bg-[#a371f7]/10 text-[#a371f7] text-[12px] font-semibold border border-[#a371f7]/20 hover:bg-[#a371f7]/15 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 transition-all">Alpha Intel</button>
            </Tooltip>
          </div>
        </div>
      </FadeIn>

      <Stagger stagger={60} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'WALLETS SCANNED', value: stats.total },
          { label: 'VERIFIED AGENTS', value: stats.verified },
          { label: 'AVG ALPHA SCORE', value: stats.avgScore },
          { label: 'TOTAL HEARTBEATS', value: stats.heartbeats },
        ].map((s, i) => (
          <div key={i} className="group rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-4 hover:border-[var(--border-hover)] hover:shadow-sm transition-all cursor-default">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider">{s.label}</span>
            </div>
            <AnimatedNumber value={s.value} className="text-2xl font-bold text-[var(--text-primary)] font-mono" />
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

function AlphaIntelView({ scanResult, scanLoading, onScan, alphaResult, alphaLoading, onAlphaScan }) {
  const [address, setAddress] = useState('')
  const isValid = /^0x[a-fA-F0-9]{40}$/.test(address)

  return (
    <div className="max-w-4xl space-y-6 animate-in">
      <FadeIn>
        <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-4 hover:border-[var(--border-hover)] transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-[#a371f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Alpha Intelligence</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#a371f7]/10 text-[#a371f7]">4 sources</span>
          </div>
          <form onSubmit={e => { e.preventDefault(); if (isValid) onAlphaScan(address) }} className="flex gap-2">
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter wallet address (0x...)" className="flex-1 bg-[var(--bg-inset)] border border-[var(--border)] rounded-md px-3 py-2 text-[13px] font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all" />
            <button type="button" onClick={() => onScan(address)} disabled={!isValid || scanLoading} className="px-3 py-2 rounded-md bg-[var(--accent-subtle)] text-[var(--accent)] text-[12px] font-semibold border border-[var(--accent)]/20 hover:bg-[var(--accent)]/15 disabled:opacity-40 transition-all">
              {scanLoading ? 'Scanning...' : 'Scan'}
            </button>
            <button type="submit" disabled={!isValid || alphaLoading} className="px-3 py-2 rounded-md bg-[#a371f7]/10 text-[#a371f7] text-[12px] font-semibold border border-[#a371f7]/20 hover:bg-[#a371f7]/15 disabled:opacity-40 transition-all">
              {alphaLoading ? 'Analyzing...' : 'Alpha Intel'}
            </button>
          </form>
        </div>
      </FadeIn>

      {alphaResult && !alphaResult.error && <AlphaResultCard result={alphaResult} />}
      {scanResult && !scanResult.error && <ScanResultCard result={scanResult} />}

      {(alphaResult?.error || scanResult?.error) && (
        <FadeIn>
          <div className="rounded-lg bg-[var(--danger)]/5 border border-[var(--danger)]/20 p-4 flex items-start gap-3">
            <svg className="w-4 h-4 text-[var(--danger)] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            <div>
              <p className="text-[13px] font-semibold text-[var(--danger)]">Error</p>
              <p className="text-[12px] text-[var(--danger)]/60 mt-0.5 font-mono">{alphaResult?.error || scanResult?.error}</p>
            </div>
          </div>
        </FadeIn>
      )}

      {!alphaResult && !scanResult && (
        <FadeIn delay={100}>
          <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-12 text-center hover:border-[var(--border-hover)] transition-colors">
            <svg className="w-10 h-10 mx-auto text-[var(--text-faint)] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" /></svg>
            <p className="text-[13px] font-semibold text-[var(--text-secondary)]">Enter a wallet address to begin</p>
            <p className="text-[12px] text-[var(--text-muted)] mt-1">Run Deep Scan or Alpha Intelligence on any Mantle wallet</p>
          </div>
        </FadeIn>
      )}
    </div>
  )
}

function AlphaResultCard({ result }) {
  const { alpha_score, threshold, is_verified_agent, score_breakdown, onchain_data, sources, wallet, confidence, percentile, anomalies, behavior } = result
  const scoreColor = alpha_score >= 70 ? 'text-[var(--success)]' : alpha_score >= 40 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'
  const statusLabel = alpha_score >= 70 ? 'AI Agent' : alpha_score >= 40 ? 'Suspicious' : 'Human'
  const statusColor = alpha_score >= 70 ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20' : alpha_score >= 40 ? 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20' : 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20'
  const srcMap = { mantle_rpc: { label: 'Mantle', active: !!sources?.mantle_rpc }, nansen: { label: 'Nansen', active: !!sources?.nansen }, allora: { label: 'Allora', active: !!sources?.allora }, elfa: { label: 'Elfa', active: !!sources?.elfa } }
  const confColor = { very_high: 'text-[var(--success)]', high: 'text-[var(--success)]', medium: 'text-[var(--warning)]', low: 'text-[var(--danger)]', very_low: 'text-[var(--danger)]' }

  return (
    <FadeIn>
      <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden hover:border-[var(--border-hover)] transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#a371f7]/10 text-[#a371f7]">Alpha Intel</span>
                {is_verified_agent && <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[var(--success)]/10 text-[var(--success)]">Verified</span>}
              </div>
              <div className="font-mono text-[12px] text-[var(--text-muted)] mt-1">{wallet}</div>
            </div>
            <div className="text-right">
              <AnimatedNumber value={alpha_score} className={`text-4xl font-bold font-mono ${scoreColor}`} />
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Alpha Score</div>
            </div>
          </div>
        </div>

        {/* Sources + Status */}
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-3 flex-wrap">
          <span className="text-[11px] font-semibold text-[var(--text-muted)]">Sources:</span>
          {Object.entries(srcMap).map(([k, v]) => (
            <Tooltip key={k} content={v.active ? 'Connected' : 'Stub mode'}>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono cursor-default transition-colors ${v.active ? 'bg-[var(--success)]/10 text-[var(--success)] hover:bg-[var(--success)]/15' : 'bg-[var(--bg-inset)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'}`}>
                <span className={`w-1 h-1 rounded-full ${v.active ? 'bg-[var(--success)]' : 'bg-[var(--text-faint)]'}`} />{v.label}
              </span>
            </Tooltip>
          ))}
          <span className={`ml-auto px-2 py-0.5 rounded text-[10px] font-semibold border ${statusColor}`}>{statusLabel}</span>
        </div>

        {/* Behavior + Confidence + Percentile */}
        <div className="px-5 py-3 border-b border-[var(--border)] grid grid-cols-3 gap-4">
          <div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Behavior</div>
            <div className="text-[12px] font-semibold text-[var(--text-primary)]">{behavior?.type?.replace(/_/g, ' ') || 'Unknown'}</div>
            <div className="text-[10px] text-[var(--text-muted)]">{behavior?.description || ''}</div>
          </div>
          <div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Confidence</div>
            <div className={`text-[12px] font-semibold capitalize ${confColor[confidence] || 'text-[var(--text-muted)]'}`}>{confidence || 'low'}</div>
            <div className="text-[10px] text-[var(--text-muted)]">{onchain_data?.tx_count || 0} tx analyzed</div>
          </div>
          <div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Percentile</div>
            <div className="text-[12px] font-semibold text-[var(--text-primary)]">Top {100 - (percentile || 50)}%</div>
            <div className="text-[10px] text-[var(--text-muted)]">vs all wallets</div>
          </div>
        </div>

        {/* Anomalies */}
        {anomalies && anomalies.length > 0 && (
          <div className="px-5 py-3 border-b border-[var(--border)]">
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Anomalies Detected</div>
            <div className="space-y-1">
              {anomalies.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${a.severity === 'high' ? 'bg-[var(--danger)]' : 'bg-[var(--warning)]'}`} />
                  <span className="text-[var(--text-primary)]">{a.detail}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score Breakdown */}
        <div className="p-5">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Score Breakdown</div>
          <div className="space-y-3">
            {score_breakdown && [
              { key: 'onchain_behavior', label: 'On-chain Behavior', weight: 0.40 },
              { key: 'entity_labels', label: 'Entity Labels', weight: 0.20 },
              { key: 'market_verification', label: 'Market Verification', weight: 0.20 },
              { key: 'social_context', label: 'Social Context', weight: 0.10 },
            ].map((dim) => {
              const data = score_breakdown[dim.key]
              const v = data?.score ?? 0
              return (
                <div key={dim.key} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-[var(--text-primary)]">{dim.label}</span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">{Math.round(dim.weight * 100)}%</span>
                    </div>
                    <AnimatedNumber value={v} className={`text-[13px] font-bold font-mono ${v >= 70 ? 'text-[var(--success)]' : v >= 40 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'}`} />
                  </div>
                  <ProgressBar value={v} />
                  {data?.detail && <p className="text-[10px] text-[var(--text-muted)] mt-1">{data.detail}</p>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
          <span>{result.analyzed_at ? new Date(result.analyzed_at * 1000).toLocaleString() : ''}</span>
          <div className="flex items-center gap-3">
            <span>{onchain_data?.tx_count || 0} tx</span>
            <span>Threshold: {threshold}</span>
            <a href={`/api/v1/badge/${wallet}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Badge</a>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}

function ScanResultCard({ result }) {
  const a = result.analysis
  const scoreColor = a?.is_verified_agent ? 'text-[var(--success)]' : 'text-[var(--danger)]'

  return (
    <FadeIn>
      <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden hover:border-[var(--border-hover)] transition-colors">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[var(--accent-subtle)] text-[var(--accent)]">On-Chain Scan</span>
                {a?.on_chain_tx && <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[var(--success)]/10 text-[var(--success)]">Verified</span>}
              </div>
              <div className="font-mono text-[12px] text-[var(--text-muted)] mt-1">{result.wallet}</div>
            </div>
            <div className="text-right">
              <AnimatedNumber value={a?.overall_score || 0} className={`text-3xl font-bold font-mono ${scoreColor}`} />
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">AI Score</div>
            </div>
          </div>
        </div>
        {a?.components && (
          <div className="p-5">
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Components</div>
            <div className="space-y-2">
              {Object.entries(a.components).map(([k, c]) => (
                <div key={k} className="flex items-center gap-3">
                  <span className="w-32 text-[11px] text-[var(--text-muted)] font-medium">{c.label}</span>
                  <ProgressBar value={c.score} className="flex-1" />
                  <span className="w-8 text-right text-[11px] font-mono font-semibold text-[var(--text-primary)]">{c.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="px-5 py-3 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
          <span>Source: {a?.source || 'onchain'}</span>
          <a href={`/api/v1/badge/${result.wallet}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Badge</a>
        </div>
      </div>
    </FadeIn>
  )
}

function AgentDetail({ agent, detail, loading, onBack }) {
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

  return (
    <div className="space-y-4 animate-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        Back
      </button>

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
