import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { FadeIn, AnimatedNumber, ProgressBar, Tooltip } from './Motion'
import { useToast } from './Toast'

const API_BASE = '/api/v1'

const THREAT_COLORS = {
  None: 'var(--text-muted)',
  Low: 'var(--warning)',
  Medium: '#fb923c',
  High: 'var(--danger)',
  Critical: '#dc2626',
}

const THREAT_BG = {
  None: 'bg-[var(--text-muted)]/10',
  Low: 'bg-[var(--warning)]/10',
  Medium: 'bg-orange-400/10',
  High: 'bg-[var(--danger)]/10',
  Critical: 'bg-red-600/20',
}

export default function TrustDashboard({ initialWallet }) {
  const addToast = useToast()
  const [wallet, setWallet] = useState(initialWallet || '')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [history, setHistory] = useState([])
  const [threats, setThreats] = useState([])

  const isValid = /^0x[a-fA-F0-9]{40}$/.test(wallet)

  const fetchData = useCallback(async (w) => {
    setLoading(true)
    try {
      const [guard, hist, ths] = await Promise.all([
        axios.get(`${API_BASE}/guard-status/${w}`),
        axios.get(`${API_BASE}/score-history/${w}`).catch(() => ({ data: { history: [] } })),
        axios.get(`${API_BASE}/threat-history/${w}`).catch(() => ({ data: { threats: [] } })),
      ])
      setData(guard.data)
      setHistory(hist.data.history || [])
      setThreats(ths.data.threats || [])
    } catch (e) {
      addToast('Failed to load guard status: ' + (e.response?.data?.detail || e.message), 'error')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    if (initialWallet) {
      setWallet(initialWallet)
      fetchData(initialWallet)
    }
  }, [initialWallet, fetchData])

  const handleQuarantine = async () => {
    if (!data || !wallet) return
    try {
      await axios.post(`${API_BASE}/quarantine/${wallet}`, null, {
        params: { reason: 'Manual quarantine from Trust Dashboard' },
      })
      addToast('Agent quarantined', 'success')
      fetchData(wallet)
    } catch (e) {
      addToast('Quarantine failed: ' + (e.response?.data?.detail || e.message), 'error')
    }
  }

  const handleUnquarantine = async () => {
    if (!wallet) return
    try {
      await axios.post(`${API_BASE}/unquarantine/${wallet}`)
      addToast('Agent released from quarantine', 'success')
      fetchData(wallet)
    } catch (e) {
      addToast('Release failed: ' + (e.response?.data?.detail || e.message), 'error')
    }
  }

  const threatLevel = data?.guard_status?.threat_level || 'None'
  const riskScore = data?.guard_status?.risk_score || 0
  const repScore = data?.rep_score || 0
  const isQuarantined = data?.guard_status?.is_quarantined || false

  // Synthetic RepScore breakdown (since backend doesn't expose yet, compute heuristically)
  const breakdown = {
    compliance: Math.max(0, 100 - riskScore),
    roi: repScore || 0,
    community: repScore || 0,
    liveliness: Math.min(100, (history.length || 0) * 5),
  }

  return (
    <div className="max-w-4xl space-y-4">
      <FadeIn>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-2xl font-[400] tracking-tight text-[var(--text-primary)]">Trust Dashboard</h1>
            <p className="font-serif italic text-sm text-[var(--text-muted)] mt-1">Real-time reputation & risk monitoring</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={50}>
        <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-4">
          <div className="flex gap-2">
            <input
              value={wallet}
              onChange={e => setWallet(e.target.value)}
              placeholder="Enter wallet address (0x...)"
              className="flex-1 bg-[var(--bg-inset)] border border-[var(--border)] rounded-md px-3 py-2 text-[13px] font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-all"
            />
            <button
              onClick={() => fetchData(wallet.toLowerCase())}
              disabled={!isValid || loading}
              className="px-4 py-2 rounded-md bg-[var(--accent-subtle)] text-[var(--accent)] text-[12px] font-semibold border border-[var(--accent)]/20 hover:bg-[var(--accent)]/15 disabled:opacity-40 transition-all"
            >
              {loading ? 'Loading...' : 'Analyze'}
            </button>
          </div>
        </div>
      </FadeIn>

      {data && (
        <>
          <FadeIn delay={100}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-4 hover:border-[var(--border-hover)] transition-colors">
                <div className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider mb-1">REPSCORE</div>
                <AnimatedNumber value={repScore} className={`text-2xl font-bold font-mono ${repScore >= 70 ? 'text-[var(--success)]' : repScore >= 40 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'}`} />
              </div>
              <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-4 hover:border-[var(--border-hover)] transition-colors">
                <div className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider mb-1">RISK SCORE</div>
                <AnimatedNumber value={riskScore} className={`text-2xl font-bold font-mono ${riskScore >= 60 ? 'text-[var(--danger)]' : riskScore >= 30 ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`} />
              </div>
              <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-4 hover:border-[var(--border-hover)] transition-colors">
                <div className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider mb-1">THREAT LEVEL</div>
                <div className={`mt-1 text-[12px] font-mono font-semibold px-2 py-1 inline-block rounded ${THREAT_BG[threatLevel]}`} style={{ color: THREAT_COLORS[threatLevel] }}>
                  {threatLevel}
                </div>
              </div>
              <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-4 hover:border-[var(--border-hover)] transition-colors">
                <div className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider mb-1">STATUS</div>
                <div className={`mt-1 text-[12px] font-mono font-semibold ${isQuarantined ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                  {isQuarantined ? 'QUARANTINED' : 'ACTIVE'}
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">RepScore Breakdown</div>
                {isQuarantined ? (
                  <button onClick={handleUnquarantine} className="text-[11px] font-mono text-[var(--success)] hover:underline">Release</button>
                ) : (
                  <button onClick={handleQuarantine} className="text-[11px] font-mono text-[var(--danger)] hover:underline">Quarantine</button>
                )}
              </div>
              <div className="space-y-3">
                {[
                  { key: 'compliance', label: 'Compliance Rate', weight: 0.4 },
                  { key: 'roi', label: 'Performance ROI', weight: 0.3 },
                  { key: 'community', label: 'Community Rating', weight: 0.2 },
                  { key: 'liveliness', label: 'Liveliness', weight: 0.1 },
                ].map(dim => {
                  const v = breakdown[dim.key] || 0
                  return (
                    <div key={dim.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-medium text-[var(--text-primary)]">{dim.label}</span>
                          <span className="text-[10px] font-mono text-[var(--text-muted)]">{Math.round(dim.weight * 100)}%</span>
                        </div>
                        <AnimatedNumber value={v} className="text-[13px] font-bold font-mono text-[var(--text-primary)]" />
                      </div>
                      <ProgressBar value={v} />
                    </div>
                  )
                })}
              </div>
            </div>
          </FadeIn>

          {threats.length > 0 && (
            <FadeIn delay={200}>
              <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-5">
                <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Recent Threats</div>
                <div className="space-y-2">
                  {threats.slice(0, 5).map((t, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-[var(--bg-inset)]">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${t.severity === 'Critical' ? 'bg-[var(--danger)]' : t.severity === 'High' ? 'bg-orange-400' : 'bg-[var(--warning)]'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-[var(--text-primary)]">{t.threat_type}</div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{t.details}</div>
                      </div>
                      <div className="text-[10px] text-[var(--text-faint)] font-mono shrink-0">
                        {new Date(t.timestamp * 1000).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {history.length > 0 && (
            <FadeIn delay={250}>
              <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-5">
                <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Score History</div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {history.slice(-10).reverse().map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[var(--text-muted)]">{new Date(h.timestamp * 1000).toLocaleString()}</span>
                      <span className={h.score >= 70 ? 'text-[var(--success)]' : h.score >= 40 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'}>
                        {h.score}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}
        </>
      )}

      {!data && !loading && (
        <FadeIn delay={100}>
          <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-12 text-center">
            <svg className="w-10 h-10 mx-auto text-[var(--text-faint)] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            <p className="text-[13px] font-semibold text-[var(--text-secondary)]">Enter a wallet to view trust status</p>
            <p className="text-[12px] text-[var(--text-muted)] mt-1">View RepScore, risk level, threats, and quarantine controls</p>
          </div>
        </FadeIn>
      )}
    </div>
  )
}
