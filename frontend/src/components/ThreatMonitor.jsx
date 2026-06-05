import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { FadeIn } from './Motion'

const API_BASE = '/api/v1'

const SEVERITY_CONFIG = {
  Critical: { color: 'var(--danger)', bg: 'bg-red-600/15', border: 'border-red-600/30', icon: 'CRIT' },
  High: { color: '#fb923c', bg: 'bg-orange-400/10', border: 'border-orange-400/20', icon: 'HIGH' },
  Medium: { color: 'var(--warning)', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: 'MED' },
  Low: { color: 'var(--text-muted)', bg: 'bg-white/5', border: 'border-white/10', icon: 'LOW' },
}

export default function ThreatMonitor() {
  const [threats, setThreats] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [wsConnected, setWsConnected] = useState(false)
  const [liveEvents, setLiveEvents] = useState([])

  const fetchThreats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/threats`, { params: { limit: 100 } })
      setThreats(res.data.threats || [])
    } catch {
      setThreats([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchThreats()
    const interval = setInterval(fetchThreats, 30000)
    return () => clearInterval(interval)
  }, [fetchThreats])

  useEffect(() => {
    let ws
    let reconnectTimer
    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      ws = new WebSocket(`${protocol}//${window.location.host}/api/v1/ws`)
      ws.onopen = () => setWsConnected(true)
      ws.onclose = () => {
        setWsConnected(false)
        reconnectTimer = setTimeout(connect, 3000)
      }
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data.type === 'agent_quarantined' || data.type === 'threat_detected') {
            setLiveEvents(prev => [{ ...data, id: Date.now() }, ...prev].slice(0, 10))
            fetchThreats()
          }
        } catch {}
      }
    }
    connect()
    return () => {
      clearTimeout(reconnectTimer)
      if (ws) ws.close()
    }
  }, [fetchThreats])

  const filtered = threats.filter(t => {
    if (filter === 'all') return true
    if (filter === 'critical') return t.severity === 'Critical'
    if (filter === 'high') return t.severity === 'High'
    if (filter === 'medium') return t.severity === 'Medium'
    return t.severity === filter
  })

  const counts = {
    critical: threats.filter(t => t.severity === 'Critical').length,
    high: threats.filter(t => t.severity === 'High').length,
    medium: threats.filter(t => t.severity === 'Medium').length,
    low: threats.filter(t => t.severity === 'Low').length,
  }

  return (
    <div className="max-w-5xl space-y-4">
      <FadeIn>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-2xl font-[400] tracking-tight text-[var(--text-primary)] flex items-center gap-2">
              Threat Monitor
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'} animate-pulse`} />
            </h1>
            <p className="font-serif italic text-sm text-[var(--text-muted)] mt-1">Real-time security event feed</p>
          </div>
          <div className="flex items-center gap-2">
            {['all', 'critical', 'high', 'medium'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                  filter === f ? 'bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && counts[f] !== undefined && ` (${counts[f]})`}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={50}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'CRITICAL', value: counts.critical, color: 'text-red-600', bg: 'bg-red-600/5' },
            { label: 'HIGH', value: counts.high, color: 'text-orange-400', bg: 'bg-orange-400/5' },
            { label: 'MEDIUM', value: counts.medium, color: 'text-amber-400', bg: 'bg-amber-400/5' },
            { label: 'LOW', value: counts.low, color: 'text-[var(--text-muted)]', bg: 'bg-white/5' },
          ].map((s, i) => (
            <div key={i} className={`rounded-lg ${s.bg} border border-[var(--border)] p-4`}>
              <div className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider mb-1">{s.label}</div>
              <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      </FadeIn>

      {liveEvents.length > 0 && (
        <FadeIn delay={75}>
          <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-4">
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
              Live Events
            </div>
            <div className="space-y-1.5">
              {liveEvents.map(ev => (
                <div key={ev.id} className="text-[11px] font-mono p-2 rounded bg-[var(--bg-inset)]">
                  <span className="text-[var(--accent)]">{ev.type}</span>
                  <span className="text-[var(--text-muted)] ml-2">{ev.wallet?.slice(0, 10)}...</span>
                  {ev.reason && <span className="text-[var(--warning)] ml-2">- {ev.reason}</span>}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <FadeIn delay={100}>
          <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-12 text-center">
            <svg className="w-10 h-10 mx-auto text-[var(--success)] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="text-[13px] font-semibold text-[var(--text-primary)]">No threats detected</p>
            <p className="text-[12px] text-[var(--text-muted)] mt-1">All monitored agents operating within safe parameters</p>
          </div>
        </FadeIn>
      ) : (
        <FadeIn delay={100}>
          <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Event Log</span>
              <span className="text-[10px] font-mono text-[var(--text-faint)]">{filtered.length} events</span>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filtered.map((t, i) => {
                const config = SEVERITY_CONFIG[t.severity] || SEVERITY_CONFIG.Low
                return (
                  <div key={t.id || i} className="flex items-start gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card-hover)] transition-colors">
                    <div className={`shrink-0 w-12 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-center ${config.bg} ${config.border} border`} style={{ color: config.color }}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[12px] font-semibold text-[var(--text-primary)]">{t.threat_type}</span>
                        <span className="font-mono text-[10px] text-[var(--text-muted)]">{t.wallet?.slice(0, 8)}...{t.wallet?.slice(-6)}</span>
                      </div>
                      {t.details && <div className="text-[11px] text-[var(--text-muted)]">{t.details}</div>}
                    </div>
                    <div className="text-[10px] text-[var(--text-faint)] font-mono shrink-0">
                      {new Date(t.timestamp * 1000).toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  )
}
