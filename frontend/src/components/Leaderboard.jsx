import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import VerificationBadge from './VerificationBadge'

const API_BASE = '/api/v1'

const MEDALS = ['🥇', '🥈', '🥉']

const PAGE_SIZE = 20

export default function Leaderboard({ onAgentClick }) {
  const [allAgents, setAllAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/agents`, { params: { page: 1, limit: 100 } })
      const list = (res.data.agents || []).sort((a, b) => (b.agentic_score || 0) - (a.agentic_score || 0))
      setAllAgents(list)
    } catch {
      setAllAgents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Reset page when filter or search changes
  useEffect(() => { setPage(1) }, [filter, search])

  const filtered = allAgents.filter(a => {
    if (filter === 'verified') return a.is_verified
    if (filter === 'pending') return !a.is_verified && (a.agentic_score || 0) >= 40
    if (filter === 'failed') return (a.agentic_score || 0) < 40
    if (filter === 'quarantined') return a.is_quarantined
    if (filter === 'at_risk') return (a.risk_score || 0) >= 60
    return true
  }).filter(a => {
    if (!search) return true
    return a.wallet?.toLowerCase().includes(search.toLowerCase())
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const getRiskColor = (risk) => {
    if (risk >= 80) return 'text-red-600'
    if (risk >= 60) return 'text-[var(--danger)]'
    if (risk >= 40) return 'text-amber-400'
    return 'text-[var(--text-muted)]'
  }
  const getThreatStyle = (level) => {
    const map = {
      Critical: 'bg-red-600/15 text-red-400 border-red-600/30',
      High: 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20',
      Medium: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
      Low: 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20',
      None: 'bg-[var(--bg-inset)] text-[var(--text-muted)] border-[var(--border)]',
    }
    return map[level] || map.None
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl font-[400] tracking-tight text-[var(--text-primary)]">Leaderboard</h1>
          <p className="font-serif italic text-sm text-[var(--text-muted)] mt-1">Top ranked wallets by alpha score</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All' },
            { id: 'verified', label: 'Verified' },
            { id: 'pending', label: 'Pending' },
            { id: 'failed', label: 'Failed' },
            { id: 'at_risk', label: 'At Risk' },
            { id: 'quarantined', label: 'Quarantined' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 ${
                filter === f.id ? 'bg-[var(--color-action-azure)]/15 text-[var(--color-action-azure)] border border-[var(--color-action-azure)]/20' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by address..."
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl pl-11 pr-4 py-2.5 text-sm font-mono text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none focus:border-[var(--color-action-azure)]/30 focus:bg-[var(--bg-card-hover)] transition-all duration-200"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--sidebar-border)] border-t-white/30 animate-spin" />
            <div className="absolute inset-1 rounded-full border-2 border-white/[0.02] border-t-[var(--color-action-azure)]/30 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[var(--text-faint)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          </div>
          <p className="font-serif italic text-sm font-medium text-[var(--text-muted)]">No wallets found</p>
          <p className="font-serif italic text-xs text-[var(--text-faint)] mt-1">Try a different filter or search term</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {paged.map((agent, i) => {
            const score = agent.agentic_score || 0
            const risk = agent.risk_score || 0
            const threat = agent.threat_level || 'None'
            const quarantined = agent.is_quarantined
            const globalRank = filtered.indexOf(agent) + 1
            const isMedal = globalRank <= 3 && filter === 'all'
            return (
              <div
                key={agent.wallet}
                onClick={() => onAgentClick?.(agent)}
                className={`group relative rounded-xl bg-[var(--bg-card)] border px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-[var(--bg-card-hover)] hover:border-[var(--color-action-azure)]/30 hover:-translate-y-0.5 transition-all duration-200 ${
                  quarantined ? 'border-[var(--danger)]/40' : 'border-[var(--border)]'
                }`}
              >
                <div className="w-8 text-center shrink-0">
                  {isMedal ? (
                    <span className="text-lg">{MEDALS[globalRank - 1]}</span>
                  ) : (
                    <span className="text-xs font-mono text-[var(--text-faint)] font-semibold">#{globalRank}</span>
                  )}
                </div>
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-card-hover)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  <span className="text-sm">{quarantined ? '⛔' : agent.is_verified ? '🤖' : score >= 40 ? '🤔' : '👤'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs font-medium text-[var(--text-secondary)] group-hover:text-white/70 transition-colors truncate">
                    {agent.wallet ? `${agent.wallet.slice(0, 8)}...${agent.wallet.slice(-6)}` : 'Unknown'}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <VerificationBadge status={agent.is_verified ? 'verified' : score >= 40 ? 'pending' : 'failed'} />
                    {threat !== 'None' && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold border ${getThreatStyle(threat)}`}>
                        {threat}
                      </span>
                    )}
                    {quarantined && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-[var(--danger)]/15 text-[var(--danger)] border border-[var(--danger)]/30">
                        QUARANTINED
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-[9px] text-[var(--text-faint)] uppercase tracking-wider">Risk</div>
                    <div className={`text-sm font-bold font-mono ${getRiskColor(risk)}`}>
                      {risk}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-[var(--text-faint)] uppercase tracking-wider">RepScore</div>
                    <div className={`text-lg font-bold font-mono tracking-tight ${
                      agent.is_verified ? 'text-[var(--color-action-azure)]' : score >= 40 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {score}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[var(--bg-card-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Prev
          </button>
          <span className="text-[11px] text-[var(--text-muted)] font-mono px-3">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[var(--bg-card-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
