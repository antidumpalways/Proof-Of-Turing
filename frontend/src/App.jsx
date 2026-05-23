import React, { useState, useCallback, useEffect } from 'react'
import { usePotData } from './hooks/usePotData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

// ─── ─── ─── ─── ─── ─── ─── ───
//  ROOT
// ─── ─── ─── ─── ─── ─── ─── ───

export default function App() {
  const [page, setPage] = useState('landing')

  if (page === 'landing') return <Landing onEnter={() => setPage('app')} />
  return <DashboardApp onHome={() => setPage('landing')} />
}

// ─── ─── ─── ─── ─── ─── ─── ───
//  LANDING
// ─── ─── ─── ─── ─── ─── ─── ───

function Landing({ onEnter }) {
  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans overflow-hidden">
      {/* Animated grid */}
      <div className="fixed inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />
      <div className="fixed inset-0 bg-gradient-radial from-blue-500/3 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-24">
        {/* Header */}
        <nav className="flex items-center justify-between mb-36">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="font-semibold text-sm text-white/80">Proof of Turing</span>
          </div>
          <button
            onClick={onEnter}
            className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all active:scale-[0.97]"
          >
            Launch App
          </button>
        </nav>

        {/* Hero */}
        <div className="text-center mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[11px] text-white/40 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 animate-pulse" />
            Deployed on Mantle Network
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.95] mb-6">
            Prove your agent
            <br />
            <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
              is not a human
            </span>
          </h1>

          <p className="text-white/20 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-10">
            Proof-of-Turing is an inverse captcha for Web3 — it verifies
            whether a wallet is operated by an autonomous AI agent or a
            human running scripts.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button onClick={onEnter}
              className="px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all active:scale-[0.97] shadow-lg shadow-white/5">
              Enter Dashboard
            </button>
            <button className="px-8 py-3.5 rounded-full bg-white/5 border border-white/5 text-white/50 font-medium text-sm hover:bg-white/10 transition-all">
              Read the Paper
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] text-white/20 uppercase tracking-[2px] font-semibold mb-3">How it works</div>
            <h2 className="text-2xl font-semibold tracking-tight">Four dimensions of agentic analysis</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-3">
            {[
              { num: '01', title: 'Time Entropy', desc: 'Measures natural vs mechanical timing patterns in agent actions.' },
              { num: '02', title: 'Response Time', desc: 'Analyzes reaction speed to market events — AI needs time to think.' },
              { num: '03', title: 'Decision Pattern', desc: 'Evaluates strategy diversity — real AI adapts, scripts repeat.' },
              { num: '04', title: 'Data Access', desc: 'Checks if agent reads on-chain data before making decisions.' },
            ].map((f, i) => (
              <div key={i} className="group rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all">
                <div className="text-[10px] font-mono text-white/20 mb-4">{f.num}</div>
                <div className="font-semibold text-sm mb-2 text-white/80 group-hover:text-white transition-colors">{f.title}</div>
                <div className="text-xs text-white/25 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ─── ─── ─── ─── ─── ─── ───
//  DASHBOARD
// ─── ─── ─── ─── ─── ─── ─── ───

const NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'verify', label: 'Verify Agent' },
  { id: 'monitor', label: 'Live Monitor' },
]

function DashboardApp({ onHome }) {
  const {
    agents, totalAgents, loading, error, page, totalPages,
    oracleStatus, getAgentScore, verifyAgent, getScoreHistory,
    setPage,
  } = usePotData()

  const [nav, setNav] = useState('dashboard')
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [history, setHistory] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [verifyResult, setVerifyResult] = useState(null)
  const [verifyLoading, setVerifyLoading] = useState(false)

  const stats = {
    total: totalAgents,
    verified: agents.filter(a => a.is_verified).length,
    avgScore: agents.length ? Math.round(agents.reduce((s, a) => s + (a.agentic_score || 0), 0) / agents.length) : 0,
    heartbeats: agents.reduce((s, a) => s + (a.heartbeats_count || 0), 0),
  }

  const handleAgentClick = useCallback(async (agent) => {
    setSelected(agent)
    setDetailLoading(true)
    setVerifyResult(null)
    try {
      const [d, h] = await Promise.all([getAgentScore(agent.wallet), getScoreHistory(agent.wallet)])
      setDetail(d)
      setHistory(h)
    } catch (e) {
      setDetail({ error: e.message })
    } finally {
      setDetailLoading(false)
    }
  }, [getAgentScore, getScoreHistory])

  const handleVerify = useCallback(async (address) => {
    if (!address?.length) return
    setVerifyLoading(true)
    setVerifyResult(null)
    setSelected(null)
    try {
      const res = await verifyAgent(address)
      setVerifyResult(res)
      setNav('verify')
    } catch (e) {
      setVerifyResult({ error: e.message })
    } finally {
      setVerifyLoading(false)
    }
  }, [verifyAgent])

  const handleBack = useCallback(() => {
    setSelected(null); setDetail(null); setHistory(null); setVerifyResult(null)
  }, [])

  const isOnline = oracleStatus?.status === 'running'

  const renderContent = () => {
    if (selected) {
      return (
        <AgentDetail
          agent={selected}
          detail={detail}
          history={history}
          loading={detailLoading}
          onBack={handleBack}
        />
      )
    }
    switch (nav) {
      case 'dashboard':
        return <DashboardView agents={agents} loading={loading} error={error} page={page} totalPages={totalPages}
          totalAgents={totalAgents} stats={stats} onPageChange={setPage} onAgentClick={handleAgentClick}
          onVerify={handleVerify} />
      case 'verify':
        return <VerifyView result={verifyResult} loading={verifyLoading} onVerify={handleVerify} />
      case 'monitor':
        return <MonitorView />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050508]/70 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={onHome} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Logo small />
              <span className="text-sm font-semibold text-white/80 hidden sm:block">Proof of Turing</span>
            </button>
            <span className="w-px h-5 bg-white/[0.06]" />
            <nav className="flex items-center gap-1">
              {NAV.map(n => (
                <button key={n.id} onClick={() => { handleBack(); setNav(n.id) }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    nav === n.id && !selected ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
                  }`}>
                  {n.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-[11px] text-white/25 font-medium hidden sm:block">{isOnline ? 'Oracle Online' : 'Disconnected'}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderContent()}
      </main>
    </div>
  )
}

// ─── ─── ─── ─── ─── ─── ─── ───
//  DASHBOARD VIEW
// ─── ─── ─── ─── ─── ─── ─── ───

function DashboardView({ agents, loading, error, page, totalPages, totalAgents, stats, onPageChange, onAgentClick, onVerify }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => { e.preventDefault(); onVerify(query) }

  // Glowing stat cards
  const statCards = [
    { label: 'Total Agents', value: stats.total, color: 'from-blue-500/20 to-cyan-500/5' },
    { label: 'Verified AI', value: stats.verified, color: 'from-emerald-500/20 to-green-500/5' },
    { label: 'Avg Score', value: stats.avgScore, color: 'from-amber-500/20 to-yellow-500/5' },
    { label: 'Heartbeats', value: stats.heartbeats, color: 'from-violet-500/20 to-purple-500/5' },
  ]

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <div key={i} className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 overflow-hidden group hover:bg-white/[0.04] transition-all">
            <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative">
              <div className="text-3xl font-bold tracking-tight text-white/90">{s.value}</div>
              <div className="text-[11px] text-white/25 font-medium mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>
          </svg>
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search wallet address..."
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3 text-sm font-mono text-white/80 placeholder-white/15 outline-none focus:border-white/10 focus:bg-white/[0.05] transition-all"
          />
        </div>
        <button type="submit"
          className="px-6 py-3 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all active:scale-[0.97]">
          Verify
        </button>
      </form>

      {/* Agents */}
      {loading ? (
        <div className="flex justify-center py-24"><Spinner /></div>
      ) : error ? (
        <div className="rounded-xl bg-red-400/5 border border-red-400/10 p-4 text-sm text-red-400/60">{error}</div>
      ) : agents.length === 0 ? (
        <div className="text-center py-24"><p className="text-white/15 text-sm">No agents registered yet</p></div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/20 font-mono">{agents.length} of {totalAgents} agents</div>
          </div>
          <div className="space-y-2">
            {agents.map(a => <AgentRow key={a.wallet} agent={a} onClick={onAgentClick} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 pt-4">
              <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
                className="text-xs text-white/25 hover:text-white/60 disabled:opacity-20 transition-colors">← Prev</button>
              <span className="text-xs text-white/15 font-mono">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}
                className="text-xs text-white/25 hover:text-white/60 disabled:opacity-20 transition-colors">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── ─── ─── ─── ─── ─── ─── ───
//  AGENT ROW
// ─── ─── ─── ─── ─── ─── ─── ───

function AgentRow({ agent, onClick }) {
  const score = agent.agentic_score || 0
  const isVerified = agent.is_verified
  const addr = agent.wallet ? `${agent.wallet.slice(0, 8)}...${agent.wallet.slice(-6)}` : 'Unknown'

  const statusLabel = isVerified ? 'Verified AI' : score >= 40 ? 'Pending' : 'Human'
  const statusBorder = isVerified ? 'border-emerald-500/20' : score >= 40 ? 'border-amber-500/20' : 'border-red-500/20'
  const statusText = isVerified ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'
  const scoreColor = isVerified ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'
  const glowColor = isVerified ? 'rgba(52,211,153,0.06)' : score >= 40 ? 'rgba(251,191,36,0.06)' : 'rgba(248,113,113,0.06)'

  return (
    <div onClick={() => onClick?.(agent)}
      className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.06] px-5 py-4 flex items-center gap-4 cursor-pointer
        hover:bg-white/[0.04] hover:border-white/10 transition-all overflow-hidden"
      style={{ boxShadow: `inset 0 0 40px ${glowColor}` }}
    >
      {/* Left accent */}
      <div className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-opacity opacity-0 group-hover:opacity-100 ${
        isVerified ? 'bg-emerald-400/50' : score >= 40 ? 'bg-amber-400/50' : 'bg-red-400/50'
      }`} />

      <div className="flex-1 min-w-0">
        <div className="font-mono text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors">{addr}</div>
        <div className="flex items-center gap-3 mt-1.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBorder} ${statusText}`}>
            {statusLabel}
          </span>
          <span className="text-[11px] text-white/15">{agent.heartbeats_count || 0} heartbeats</span>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-xl font-bold font-mono ${scoreColor}`}>{score}</div>
        <div className="text-[9px] text-white/15 uppercase tracking-[1px] mt-0.5">Score</div>
      </div>
    </div>
  )
}

// ─── ─── ─── ─── ─── ─── ─── ───
//  AGENT DETAIL
// ─── ─── ─── ─── ─── ─── ─── ───

function AgentDetail({ agent, detail, history, loading, onBack }) {
  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>
  if (!detail) return <ErrorBox msg="Failed to load agent details" />

  const score = detail.off_chain?.score || 0
  const components = detail.off_chain?.components || {}
  const verification = detail.verification || {}
  const addr = agent.wallet ? `${agent.wallet.slice(0, 8)}...${agent.wallet.slice(-6)}` : 'Unknown'

  const comps = Object.entries(components).length > 0 ? Object.entries(components) : null

  const isVerified = score >= 70
  const scoreColor = isVerified ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'
  const glowColor = isVerified ? 'rgba(52,211,153,0.04)' : score >= 40 ? 'rgba(251,191,36,0.04)' : 'rgba(248,113,113,0.04)'

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white/50 transition-colors mb-6">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        Back to dashboard
      </button>

      {/* Main card */}
      <div className="rounded-3xl bg-white/[0.02] border border-white/[0.06] overflow-hidden" style={{ boxShadow: `inset 0 0 60px ${glowColor}` }}>
        {/* Header */}
        <div className="p-8 border-b border-white/[0.06]">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-mono text-base font-medium text-white/80 mb-3">{addr}</div>
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                  isVerified
                    ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                    : score >= 40
                    ? 'text-amber-400 border-amber-400/20 bg-amber-400/5'
                    : 'text-red-400 border-red-400/20 bg-red-400/5'
                }`}>
                  {verification.badge || (isVerified ? 'Verified AI Agent' : 'Not Verified')}
                </span>
                <span className="text-xs text-white/15">{agent.heartbeats_count || 0} heartbeats</span>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-7xl font-light font-mono tracking-tight ${scoreColor}`}>
                {score}
              </div>
              <div className="text-[10px] text-white/15 uppercase tracking-[2px] mt-1">Agentic Score</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
          {/* Verdict card */}
          {verification.badge && (
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 text-center">
              <div className="text-5xl mb-3">
                {isVerified ? (
                  <svg className="w-12 h-12 mx-auto text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
                  </svg>
                ) : (
                  <svg className="w-12 h-12 mx-auto text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
                  </svg>
                )}
              </div>
              <div className="text-xl font-semibold tracking-tight mb-1">
                {isVerified ? 'Verified AI Agent' : 'Not a Verified AI Agent'}
              </div>
              <div className="text-sm text-white/30">{verification.badge}</div>
              <div className="text-xs text-white/15 mt-3 font-mono">
                Threshold: {verification.threshold || 70}/100 · Score: {score}/100
              </div>
            </div>
          )}

          {/* Components */}
          {comps ? (
            <div>
              <SectionTitle>Analysis Results</SectionTitle>
              <div className="grid md:grid-cols-2 gap-2">
                {comps.map(([name, data]) => (
                  <div key={name} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-white/40 font-medium">{formatName(name)}</span>
                      <span className={`text-sm font-mono font-bold ${
                        data.score >= 70 ? 'text-emerald-400' : data.score >= 40 ? 'text-amber-400' : 'text-red-400'
                      }`}>{data.score}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${
                        data.score >= 70 ? 'bg-emerald-400/50' : data.score >= 40 ? 'bg-amber-400/50' : 'bg-red-400/50'
                      }`} style={{ width: `${data.score}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-white/20 font-mono">
                      <span>Confidence: {data.confidence}</span>
                      {data.details?.data_points && <span>{data.details.data_points} samples</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-white/20 text-center py-8">Insufficient data for analysis. Submit more heartbeats.</div>
          )}

          {/* On-chain */}
          <div>
            <SectionTitle>On-Chain Status</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Score', value: detail.on_chain?.score ?? '--', color: 'text-white/80' },
                { label: 'Verified', value: detail.on_chain?.verified ? 'Yes' : 'No',
                  color: detail.on_chain?.verified ? 'text-emerald-400' : 'text-red-400' },
                { label: 'Heartbeats', value: agent.heartbeats_count || 0, color: 'text-white/80' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 text-center">
                  <div className={`text-lg font-mono font-semibold ${item.color}`}>{item.value}</div>
                  <div className="text-[10px] text-white/20 uppercase tracking-wider mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          {history?.history?.length > 0 && (
            <div>
              <SectionTitle>Score History</SectionTitle>
              <ScoreChart history={history.history} scoreColor={scoreColor} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── ─── ─── ─── ─── ─── ─── ───
//  VERIFY VIEW
// ─── ─── ─── ─── ─── ─── ─── ───

function VerifyView({ result, loading, onVerify }) {
  const [address, setAddress] = useState('')
  const handleSubmit = (e) => { e.preventDefault(); onVerify(address) }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>
          </svg>
          <input value={address} onChange={e => setAddress(e.target.value)}
            placeholder="Enter wallet address..."
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3 text-sm font-mono text-white/80 placeholder-white/15 outline-none focus:border-white/10 transition-all" />
        </div>
        <button type="submit" disabled={loading}
          className="px-6 py-3 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all disabled:opacity-50 active:scale-[0.97]">
          {loading ? 'Checking...' : 'Verify'}
        </button>
      </form>

      {result && (
        <div className="rounded-3xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
          {result.error ? (
            <div className="p-6 text-sm text-red-400/60">{result.error}</div>
          ) : (
            <>
              <div className="p-8 border-b border-white/[0.06]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-sm font-medium text-white/80 mb-3">{result.wallet}</div>
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${
                      result.is_verified_agent ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' :
                      result.score >= 40 ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' :
                      'text-red-400 border-red-400/20 bg-red-400/5'
                    }`}>
                      {result.is_verified_agent ? 'Verified AI Agent' : result.badge || 'Not Verified'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-6xl font-light font-mono ${
                      result.is_verified_agent ? 'text-emerald-400' :
                      result.score >= 40 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {result.score}
                    </div>
                    <div className="text-[10px] text-white/15 uppercase tracking-[2px] mt-1">Score</div>
                  </div>
                </div>
              </div>
              <div className="px-8 py-4 text-xs text-white/20 font-mono flex gap-6">
                <span>Threshold: {result.threshold || 70}/100</span>
                <span>Heartbeats: {result.heartbeats_count || 0}</span>
              </div>
            </>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-16">
          <svg className="w-8 h-8 mx-auto text-white/10 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>
          </svg>
          <p className="text-sm text-white/20">Enter a wallet address to check AI verification status</p>
        </div>
      )}
    </div>
  )
}

// ─── ─── ─── ─── ─── ─── ─── ───
//  MONITOR VIEW
// ─── ─── ─── ─── ─── ─── ─── ───

function MonitorView() {
  const [events] = useState([])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-medium text-white/80">Heartbeat Monitor</h2>
          <p className="text-xs text-white/20 mt-1">Real-time agent activity on the Mantle network</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400/70">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Listening
        </div>
      </div>

      <div className="rounded-2xl bg-black/40 border border-white/[0.06] p-4 font-mono text-xs">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-6 h-6 mx-auto text-white/10 mb-3 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            <p className="text-white/15">Waiting for heartbeats...</p>
            <p className="text-white/10 mt-1">Agents will appear here once they submit data</p>
          </div>
        ) : (
          <div className="space-y-1">
            {events.map((e, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/[0.02]">
                <span className="text-white/20">{e.time}</span>
                <span className="text-blue-400/60">{e.wallet}</span>
                <span className="text-white/40">{e.action}</span>
                <span className="ml-auto font-semibold" style={{ color: e.score >= 70 ? '#34d399' : e.score >= 40 ? '#fbbf24' : '#f87171' }}>
                  {e.score}/100
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-6 mt-4 text-[11px] text-white/20">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Verified (score {'>='}70)</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Pending (40-69)</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Human ({'<'}40)</span>
      </div>
    </div>
  )
}

// ─── ─── ─── ─── ─── ─── ─── ───
//  SCORE CHART
// ─── ─── ─── ─── ─── ─── ─── ───

function ScoreChart({ history = [] }) {
  const data = history.map((r, i) => ({ name: `#${i + 1}`, score: r.score }))
  const lastScore = data[data.length - 1]?.score || 0
  const lineColor = lastScore >= 70 ? '#34d399' : lastScore >= 40 ? '#fbbf24' : '#f87171'

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5">
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 11 }} />
          <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: 'rgba(255,255,255,0.4)' }}
          />
          <Area type="monotone" dataKey="score" stroke={lineColor} strokeWidth={2} fill="url(#scoreGrad)" dot={{ fill: lineColor, r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── ─── ─── ─── ─── ─── ─── ───
//  SHARED COMPONENTS
// ─── ─── ─── ─── ─── ─── ─── ───

function Logo({ small }) {
  const s = small ? 7 : 8
  return (
    <div className={`w-${s} h-${s} rounded-lg bg-white/10 flex items-center justify-center`}>
      <svg width={small ? 14 : 16} height={small ? 14 : 16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    </div>
  )
}

function Spinner() {
  return <div className="w-5 h-5 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
}

function ErrorBox({ msg }) {
  return <div className="rounded-xl bg-red-400/5 border border-red-400/10 p-4 text-sm text-red-400/60">{msg}</div>
}

function SectionTitle({ children }) {
  return <div className="text-[11px] text-white/20 uppercase tracking-[1.5px] font-semibold mb-4">{children}</div>
}

function formatName(name) {
  const map = { time_entropy: 'Time Entropy', response_time: 'Response Time', decision_pattern: 'Decision Pattern', data_access: 'Data Access' }
  return map[name] || name
}
