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
    return true
  }).filter(a => {
    if (!search) return true
    return a.wallet?.toLowerCase().includes(search.toLowerCase())
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white/80">Leaderboard</h1>
          <p className="text-sm text-white/20 mt-1">Top ranked AI agents by agentic score</p>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'verified', 'pending', 'failed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                filter === f ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40 hover:bg-white/[0.03]'
              }`}
            >
              {f === 'all' ? 'All' : f === 'verified' ? 'Verified' : f === 'pending' ? 'Pending' : 'Failed'}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/[0.08] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by address..."
          className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-11 pr-4 py-2.5 text-sm font-mono text-white/60 placeholder-white/[0.06] outline-none focus:border-white/10 focus:bg-white/[0.04] transition-all duration-200"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-white/[0.04] border-t-white/30 animate-spin" />
            <div className="absolute inset-1 rounded-full border-2 border-white/[0.02] border-t-emerald-400/30 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white/[0.06]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white/20">No agents found</p>
          <p className="text-xs text-white/10 mt-1">Try a different filter or search term</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {paged.map((agent, i) => {
            const score = agent.agentic_score || 0
            const globalRank = filtered.indexOf(agent) + 1
            const isMedal = globalRank <= 3 && filter === 'all'
            return (
              <div
                key={agent.wallet}
                onClick={() => onAgentClick?.(agent)}
                className="group relative rounded-xl bg-white/[0.015] border border-white/[0.06] px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/[0.03] hover:border-white/10 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-8 text-center shrink-0">
                  {isMedal ? (
                    <span className="text-lg">{MEDALS[globalRank - 1]}</span>
                  ) : (
                    <span className="text-xs font-mono text-white/10 font-semibold">#{globalRank}</span>
                  )}
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
                  <span className="text-sm">{agent.is_verified ? '🤖' : score >= 40 ? '🤔' : '👤'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs font-medium text-white/40 group-hover:text-white/70 transition-colors truncate">
                    {agent.wallet ? `${agent.wallet.slice(0, 8)}...${agent.wallet.slice(-6)}` : 'Unknown'}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <VerificationBadge status={agent.is_verified ? 'verified' : score >= 40 ? 'pending' : 'failed'} />
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[10px] text-white/10 font-mono">{agent.heartbeats_count || 0} beats</span>
                  <div className="text-right">
                    <div className={`text-lg font-bold font-mono tracking-tight ${
                      agent.is_verified ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'
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
            className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-white/60 hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Prev
          </button>
          <span className="text-[11px] text-white/20 font-mono px-3">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-white/60 hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
