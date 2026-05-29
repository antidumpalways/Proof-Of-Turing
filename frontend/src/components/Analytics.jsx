import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const API_BASE = '/api/v1'

const scoreColors = {
  verified: '#34d399',
  pending: '#fbbf24',
  failed: '#f87171',
}

export default function Analytics() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/agents`, { params: { page: 1, limit: 100 } })
      setAgents(res.data.agents || [])
    } catch {
      setAgents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/[0.04] border-t-white/30 animate-spin" />
          <div className="absolute inset-1 rounded-full border-2 border-white/[0.02] border-t-emerald-400/30 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
        </div>
      </div>
    )
  }

  const total = agents.length
  const verified = agents.filter(a => a.is_verified).length
  const pending = agents.filter(a => !a.is_verified && (a.agentic_score || 0) >= 40).length
  const failed = agents.filter(a => (a.agentic_score || 0) < 40).length
  const avgScore = total ? Math.round(agents.reduce((s, a) => s + (a.agentic_score || 0), 0) / total) : 0
  const totalBeats = agents.reduce((s, a) => s + (a.heartbeats_count || 0), 0)

  // Score distribution
  const distribution = [
    { name: 'Verified (70-100)', value: verified, color: scoreColors.verified },
    { name: 'Pending (40-69)', value: pending, color: scoreColors.pending },
    { name: 'Failed (0-39)', value: failed, color: scoreColors.failed },
  ]

  // Top agents bar chart data
  const topAgents = [...agents]
    .sort((a, b) => (b.agentic_score || 0) - (a.agentic_score || 0))
    .slice(0, 10)
    .map(a => ({
      name: a.wallet ? `${a.wallet.slice(0, 6)}..` : '??',
      score: a.agentic_score || 0,
    }))

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white/80">Analytics</h1>
        <p className="text-sm text-white/20 mt-1">Network-wide statistics and agent insights</p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Agents', value: total, icon: 'users', color: 'text-blue-400' },
          { label: 'Verified AI', value: verified, icon: 'check', color: 'text-emerald-400' },
          { label: 'Avg Score', value: avgScore, icon: 'trending', color: 'text-amber-400' },
          { label: 'Total Heartbeats', value: totalBeats, icon: 'activity', color: 'text-violet-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl bg-white/[0.015] border border-white/[0.06] p-5 hover:bg-white/[0.03] hover:border-white/10 transition-all duration-200">
            <div className={`${s.color} opacity-30 mb-3`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {s.icon === 'users' && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></>}
                {s.icon === 'check' && <><polyline points="20 6 9 17 4 12" /></>}
                {s.icon === 'trending' && <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></>}
                {s.icon === 'activity' && <><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></>}
              </svg>
            </div>
            <div className="text-3xl font-bold tracking-tight text-white/80">{s.value}</div>
            <div className="text-[10px] text-white/15 font-medium mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Score Distribution Pie */}
        <div className="rounded-2xl bg-white/[0.015] border border-white/[0.06] p-6 hover:bg-white/[0.03] hover:border-white/10 transition-all duration-200">
          <div className="text-[10px] text-white/10 uppercase tracking-[2px] font-semibold mb-6">Score Distribution</div>
          {total === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-white/20">No data yet</p>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie data={distribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                    {distribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        return (
                          <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-3 shadow-2xl">
                            <p className="text-[11px] text-white/80 font-medium">{payload[0].name}</p>
                            <p className="text-xs text-white/40 font-mono mt-1">{payload[0].value} agents</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {distribution.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] text-white/30 font-mono">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Agents Bar Chart */}
        <div className="rounded-2xl bg-white/[0.015] border border-white/[0.06] p-6 hover:bg-white/[0.03] hover:border-white/10 transition-all duration-200">
          <div className="text-[10px] text-white/10 uppercase tracking-[2px] font-semibold mb-6">Top 10 Agents by Score</div>
          {topAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-white/20">No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topAgents} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="rgba(255,255,255,0.08)" tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} stroke="rgba(255,255,255,0.08)" tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-3 shadow-2xl">
                          <p className="text-[11px] text-white/30 font-mono">{payload[0].payload.name}</p>
                          <p className="text-sm font-bold text-emerald-400">Score: {payload[0].value}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} fill="#34d399" opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Verification Rate Card */}
      <div className="rounded-2xl bg-white/[0.015] border border-white/[0.06] p-6 hover:bg-white/[0.03] hover:border-white/10 transition-all duration-200">
        <div className="text-[10px] text-white/10 uppercase tracking-[2px] font-semibold mb-4">Verification Overview</div>
        {total === 0 ? (
          <p className="text-sm text-white/20 py-8 text-center">No agents registered yet</p>
        ) : (
          <div className="flex items-center gap-8 flex-wrap">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <span className="text-xs text-white/30 font-medium w-24 shrink-0">Verification Rate</span>
              <div className="flex-1 h-2 rounded-full bg-white/[0.03] overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400/50 transition-all duration-1000" style={{ width: `${total ? (verified / total) * 100 : 0}%` }} />
              </div>
              <span className="text-xs font-mono text-white/30 w-12 text-right shrink-0">
                {total ? Math.round((verified / total) * 100) : 0}%
              </span>
            </div>
            <div className="flex gap-6 text-[10px] text-white/15 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {verified} verified
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {pending} pending
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {failed} failed
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
