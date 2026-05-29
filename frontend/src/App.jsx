import React, { useState, useCallback } from 'react'
import { usePotData } from './hooks/usePotData'
import AgentCard from './components/AgentCard'
import AgentList from './components/AgentList'
import ScoreChart from './components/ScoreChart'
import VerificationBadge from './components/VerificationBadge'
import LiveMonitor from './components/LiveMonitor'
import Sidebar from './components/Sidebar'
import { ToastProvider, useToast } from './components/Toast'
import Leaderboard from './components/Leaderboard'
import Analytics from './components/Analytics'
import Onboarding from './components/Onboarding'

export default function App() {
  const [page, setPage] = useState('landing')

  if (page === 'landing') return <Landing onEnter={() => setPage('app')} />
  return (
    <ToastProvider>
      <DashboardApp onHome={() => setPage('landing')} />
    </ToastProvider>
  )
}

function Landing({ onEnter }) {
  return (
    <div className="relative min-h-screen bg-[#050508] text-white font-sans overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div className="fixed inset-0 bg-gradient-radial from-blue-500/4 via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-emerald-500/3 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/3 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-24">
        <nav className="flex items-center justify-between mb-36">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="font-semibold text-sm text-white/60">Proof of Turing</span>
          </div>
          <button
            onClick={onEnter}
            className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-semibold
              hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10
              active:scale-[0.97] transition-all duration-200"
          >
            Launch App
          </button>
        </nav>

        <div className="text-center mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] text-white/30 font-medium mb-10
            hover:bg-white/[0.05] transition-all duration-300">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
              <span className="relative rounded-full w-2 h-2 bg-emerald-400" />
            </span>
            Deployed on Mantle Network
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-[0.92] mb-6">
            Prove your agent
            <br />
            <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
              is not a human
            </span>
          </h1>
          <p className="text-base md:text-lg text-white/[0.12] max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            Proof-of-Turing is an inverse captcha for Web3 — it verifies
            whether a wallet is operated by an autonomous AI agent or a
            human running scripts through four-dimensional behavioral analysis.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onEnter}
              className="group px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm
                hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/10
                active:scale-[0.97] transition-all duration-200"
            >
              Enter Dashboard
            </button>
            <button
              className="px-8 py-3.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/40 font-medium text-sm
                hover:bg-white/[0.06] hover:border-white/10 hover:text-white/60 hover:-translate-y-0.5
                active:scale-[0.97] transition-all duration-200"
            >
              Read the Paper
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[10px] text-white/[0.08] uppercase tracking-[3px] font-semibold mb-4">How it works</div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white/80">
              Four dimensions of agentic analysis
            </h2>
            <p className="text-sm text-white/[0.08] mt-3 max-w-md mx-auto">
              Our oracle evaluates AI agents across four independent dimensions to determine authenticity
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { num: '01', title: 'Time Entropy', desc: 'Measures natural vs mechanical timing patterns in agent actions.' },
              { num: '02', title: 'Response Time', desc: 'Analyzes reaction speed to market events — AI needs time to think.' },
              { num: '03', title: 'Decision Pattern', desc: 'Evaluates strategy diversity — real AI adapts, scripts repeat.' },
              { num: '04', title: 'Data Access', desc: 'Checks if agent reads on-chain data before making decisions.' },
            ].map((f, i) => (
              <div
                key={i}
                className="group relative rounded-2xl bg-white/[0.015] border border-white/[0.06] p-6
                  hover:bg-white/[0.03] hover:border-white/10 hover:-translate-y-1
                  transition-all duration-300 ease-out"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative">
                  <div className="text-[10px] font-mono text-white/[0.08] mb-4 font-semibold">{f.num}</div>
                  <div className="font-semibold text-sm mb-2 text-white/60 group-hover:text-white/90 transition-colors duration-200">{f.title}</div>
                  <div className="text-xs text-white/[0.12] leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-32">
          <div className="text-[10px] text-white/[0.04] font-mono">
            Built for Mantle Network &middot; EIP-8004 Compatible
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardApp({ onHome }) {
  const {
    agents, totalAgents, loading, error, page, totalPages,
    oracleStatus, getAgentScore, verifyAgent, getScoreHistory,
    fetchStatus, setPage: setPageHook,
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
    avgScore: agents.length
      ? Math.round(agents.reduce((s, a) => s + (a.agentic_score || 0), 0) / agents.length)
      : 0,
    heartbeats: agents.reduce((s, a) => s + (a.heartbeats_count || 0), 0),
  }

  const handleAgentClick = useCallback(async (agent) => {
    setSelected(agent)
    setDetailLoading(true)
    setVerifyResult(null)
    try {
      const [d, h] = await Promise.all([
        getAgentScore(agent.wallet),
        getScoreHistory(agent.wallet),
      ])
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

  const handleNavChange = useCallback((id) => {
    handleBack()
    setNav(id)
  }, [handleBack])

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
        return (
          <DashboardView
            agents={agents}
            loading={loading}
            error={error}
            page={page}
            totalPages={totalPages}
            totalAgents={totalAgents}
            stats={stats}
            onPageChange={setPageHook}
            onAgentClick={handleAgentClick}
            onVerify={handleVerify}
          />
        )
      case 'leaderboard':
        return <Leaderboard onAgentClick={handleAgentClick} />
      case 'analytics':
        return <Analytics />
      case 'verify':
        return (
          <VerifyView
            result={verifyResult}
            loading={verifyLoading}
            onVerify={handleVerify}
          />
        )
      case 'monitor':
        return <MonitorView />
      case 'onboarding':
        return <Onboarding />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans">
      <Sidebar
        activeNav={selected ? null : nav}
        onNavChange={handleNavChange}
        oracleOnline={isOnline}
        onHome={onHome}
      />
      <main className="lg:pl-60 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-16 lg:pt-8">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

function DashboardView({
  agents, loading, error, page, totalPages, totalAgents, stats,
  onPageChange, onAgentClick, onVerify,
}) {
  const statCards = [
    {
      label: 'Total Agents', value: stats.total,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        </svg>
      ),
      color: 'from-blue-500/10 to-cyan-500/5', textColor: 'text-blue-400',
    },
    {
      label: 'Verified AI', value: stats.verified,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      color: 'from-emerald-500/10 to-green-500/5', textColor: 'text-emerald-400',
    },
    {
      label: 'Avg Score', value: stats.avgScore,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      color: 'from-amber-500/10 to-yellow-500/5', textColor: 'text-amber-400',
    },
    {
      label: 'Heartbeats', value: stats.heartbeats,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
      color: 'from-violet-500/10 to-purple-500/5', textColor: 'text-violet-400',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="mb-2">
        <h1 className="text-xl font-bold tracking-tight text-white/80">Dashboard</h1>
        <p className="text-sm text-white/20 mt-1">Overview of registered agents and their AI verification status</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <div
            key={i}
            className="group relative rounded-2xl bg-white/[0.015] border border-white/[0.06] p-5 overflow-hidden
              hover:bg-white/[0.03] hover:border-white/10 hover:-translate-y-0.5
              transition-all duration-300 ease-out"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative">
              <div className={`${s.textColor} opacity-30 group-hover:opacity-60 transition-opacity duration-300 mb-3`}>
                {s.icon}
              </div>
              <div className="text-3xl font-bold tracking-tight text-white/80 group-hover:text-white transition-colors duration-200">
                {s.value}
              </div>
              <div className="text-[10px] text-white/15 font-medium mt-1 uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>
      <AgentList
        agents={agents}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        totalAgents={totalAgents}
        onPageChange={onPageChange}
        onAgentClick={onAgentClick}
        onSearch={onVerify}
      />
    </div>
  )
}

function AgentDetail({ agent, detail, history, loading, onBack }) {
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-4 w-24 rounded-md bg-white/[0.03] animate-pulse" />
        <div className="rounded-3xl bg-white/[0.015] border border-white/[0.06] overflow-hidden">
          <div className="p-8 border-b border-white/[0.06] space-y-4">
            <div className="h-6 w-64 rounded-md bg-white/[0.03] animate-pulse" />
            <div className="h-4 w-40 rounded-md bg-white/[0.02] animate-pulse" />
            <div className="h-16 w-32 rounded-md bg-white/[0.03] animate-pulse ml-auto" />
          </div>
          <div className="p-8 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-white/[0.015] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white/50 transition-colors mb-6">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to dashboard
        </button>
        <div className="rounded-2xl bg-red-500/5 border border-red-500/10 p-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400/50 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <p className="text-sm text-red-400/60">Failed to load agent details. The agent may not exist or data is unavailable.</p>
        </div>
      </div>
    )
  }

  const score = detail.off_chain?.score || 0
  const components = detail.off_chain?.components || {}
  const verification = detail.verification || {}
  const addr = agent.wallet
    ? `${agent.wallet.slice(0, 8)}...${agent.wallet.slice(-6)}`
    : 'Unknown'

  const comps = Object.entries(components).length > 0 ? Object.entries(components) : null
  const isVerified = score >= 70
  const scoreColor = isVerified ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'
  const glowColor = isVerified
    ? 'rgba(52,211,153,0.03)'
    : score >= 40
      ? 'rgba(251,191,36,0.03)'
      : 'rgba(248,113,113,0.03)'

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="group inline-flex items-center gap-1.5 text-xs text-white/20 hover:text-white/50 transition-colors mb-6"
      >
        <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to dashboard
      </button>

      <div
        className="rounded-3xl bg-white/[0.015] border border-white/[0.06] overflow-hidden
          hover:border-white/10 transition-all duration-300"
        style={{ boxShadow: `inset 0 0 80px ${glowColor}` }}
      >
        <div className="p-6 sm:p-8 border-b border-white/[0.06]">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="font-mono text-sm font-medium text-white/60 truncate max-w-xs sm:max-w-md">{addr}</div>
              <div className="flex items-center gap-3 flex-wrap">
                <VerificationBadge
                  status={isVerified ? 'verified' : score >= 40 ? 'pending' : 'failed'}
                  score={score}
                />
                <span className="text-[10px] text-white/10 font-mono">
                  {agent.heartbeats_count || 0} heartbeats
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-6xl sm:text-7xl font-light font-mono tracking-tight ${scoreColor}`}>
                {score}
              </div>
              <div className="text-[10px] text-white/10 uppercase tracking-[2px] font-semibold mt-1">Agentic Score</div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {verification.badge && (
            <div className="relative rounded-2xl bg-white/[0.015] border border-white/[0.06] p-6 sm:p-8 text-center overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${
                isVerified ? 'from-emerald-500/5 to-emerald-400/5' : 'from-red-500/5 to-red-400/5'
              }`} />
              <div className="relative">
                <div className="mb-4">
                  {isVerified ? (
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
                      <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/10 flex items-center justify-center">
                      <svg className="w-7 h-7 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-white/70 mb-1">
                  {isVerified ? 'Verified AI Agent' : 'Not a Verified AI Agent'}
                </h3>
                <p className="text-sm text-white/25">{verification.badge}</p>
                <div className="inline-flex items-center gap-3 mt-4 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[10px] text-white/20 font-mono">Threshold: {verification.threshold || 70}/100</span>
                  <span className="w-px h-3 bg-white/[0.04]" />
                  <span className={`text-[10px] font-mono ${scoreColor}`}>Score: {score}/100</span>
                </div>
              </div>
            </div>
          )}

          {comps ? (
            <div>
              <div className="text-[10px] text-white/10 uppercase tracking-[2px] font-semibold mb-4">Analysis Results</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {comps.map(([name, data]) => {
                  const compScore = data.score || 0
                  const compColor = compScore >= 70
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : compScore >= 40
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-red-500/10 text-red-400'
                  const barColor = compScore >= 70
                    ? 'bg-emerald-400/40'
                    : compScore >= 40
                      ? 'bg-amber-400/40'
                      : 'bg-red-400/40'

                  return (
                    <div
                      key={name}
                      className="group rounded-xl bg-white/[0.015] border border-white/[0.06] p-4
                        hover:bg-white/[0.03] hover:border-white/10 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-white/30 font-medium">{formatName(name)}</span>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${compColor}`}>
                          {compScore}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.03] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                          style={{ width: `${compScore}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px] text-white/15 font-mono">Confidence: {data.confidence || '--'}</span>
                        {data.details?.data_points && (
                          <span className="text-[9px] text-white/15 font-mono">{data.details.data_points} samples</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-white/[0.015] border border-white/[0.06] p-8 text-center">
              <svg className="w-6 h-6 mx-auto text-white/[0.06] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm text-white/20 font-medium">Insufficient data for analysis</p>
              <p className="text-xs text-white/10 mt-1">Submit more heartbeats to generate component scores</p>
            </div>
          )}

          <div>
            <div className="text-[10px] text-white/10 uppercase tracking-[2px] font-semibold mb-4">On-Chain Status</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Score', value: detail.on_chain?.score ?? '--', color: 'text-white/60' },
                { label: 'Verified', value: detail.on_chain?.verified ? 'Yes' : 'No', color: detail.on_chain?.verified ? 'text-emerald-400' : 'text-red-400' },
                { label: 'Heartbeats', value: agent.heartbeats_count || 0, color: 'text-white/60' },
              ].map((item, i) => (
                <div key={i} className="group rounded-xl bg-white/[0.015] border border-white/[0.06] p-4 text-center hover:bg-white/[0.03] hover:border-white/10 transition-all duration-200">
                  <div className={`text-lg font-mono font-semibold ${item.color} group-hover:scale-105 transition-transform duration-200`}>
                    {item.value}
                  </div>
                  <div className="text-[9px] text-white/15 uppercase tracking-wider mt-1 font-medium">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {history?.history?.length > 0 && (
            <div>
              <div className="text-[10px] text-white/10 uppercase tracking-[2px] font-semibold mb-4">Score History</div>
              <ScoreChart history={history.history} wallet={agent.wallet} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function VerifyView({ result, loading, onVerify }) {
  const [address, setAddress] = useState('')
  const handleSubmit = (e) => { e.preventDefault(); onVerify(address) }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white/80">Verify Agent</h1>
        <p className="text-sm text-white/20 mt-1">Check if a wallet address is operated by an AI agent</p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/[0.08] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Enter wallet address (0x...)"
            className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3 text-sm font-mono text-white/60 placeholder-white/[0.06] outline-none focus:border-white/10 focus:bg-white/[0.04] focus:ring-1 focus:ring-white/[0.03] transition-all duration-200"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-white text-black text-xs font-semibold
            hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/5
            active:scale-[0.97] disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none
            transition-all duration-200"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              Checking
            </span>
          ) : 'Verify'}
        </button>
      </form>

      {result && (
        <div className="rounded-3xl bg-white/[0.015] border border-white/[0.06] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
          {result.error ? (
            <div className="p-6 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400/50 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-400/70">Verification failed</p>
                <p className="text-xs text-red-400/40 mt-1 font-mono">{result.error}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-6 sm:p-8 border-b border-white/[0.06]">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="font-mono text-sm font-medium text-white/60 break-all">{result.wallet}</div>
                    <VerificationBadge
                      status={result.is_verified_agent ? 'verified' : result.score >= 40 ? 'pending' : 'failed'}
                      score={result.score}
                    />
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-6xl sm:text-7xl font-light font-mono tracking-tight ${
                      result.is_verified_agent ? 'text-emerald-400' : result.score >= 40 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {result.score}
                    </div>
                    <div className="text-[10px] text-white/10 uppercase tracking-[2px] font-semibold mt-1">Score</div>
                  </div>
                </div>
              </div>
              <div className="px-6 sm:px-8 py-4 flex flex-wrap gap-6 text-[10px] text-white/15 font-mono bg-white/[0.01]">
                <span className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  Threshold: {result.threshold || 70}/100
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  Heartbeats: {result.heartbeats_count || 0}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-5">
            <svg className="w-8 h-8 text-white/[0.06]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white/20">Enter a wallet address</p>
          <p className="text-xs text-white/10 mt-1">Paste a wallet address above to check AI verification status</p>
        </div>
      )}
    </div>
  )
}

function MonitorView() {
  return <LiveMonitor />
}

function Logo({ small }) {
  const size = small ? 7 : 8
  return (
    <div className={`w-${size} h-${size} rounded-xl bg-white/10 border border-white/[0.06] flex items-center justify-center hover:bg-white/15 transition-all duration-200`}>
      <svg width={small ? 14 : 16} height={small ? 14 : 16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    </div>
  )
}

function formatName(name) {
  const map = {
    time_entropy: 'Time Entropy',
    response_time: 'Response Time',
    decision_pattern: 'Decision Pattern',
    data_access: 'Data Access',
  }
  return map[name] || name
}
