import React, { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'

const API_BASE = '/api/v1'
const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${API_BASE}/ws`

export default function LiveMonitor({ onVerify }) {
  const [events, setEvents] = useState([])
  const [wsConnected, setWsConnected] = useState(false)
  const feedRef = useRef(null)
  const prevWalletsRef = useRef(new Set())
  const wsRef = useRef(null)

  // WebSocket connection
  useEffect(() => {
    let ws
    let reconnectTimer

    function connect() {
      try {
        ws = new WebSocket(WS_URL)
        wsRef.current = ws

        ws.onopen = () => {
          setWsConnected(true)
          console.log('LiveMonitor: WebSocket connected')
        }

        ws.onmessage = (msg) => {
          try {
            const data = JSON.parse(msg.data)
            if (data.type === 'heartbeat') {
              setEvents(prev => [{
                wallet: data.wallet,
                score: data.score || 0,
                action: data.status || 'heartbeat',
                timestamp: data.timestamp || Math.floor(Date.now() / 1000),
              }, ...prev].slice(0, 50))
            }
          } catch { /* ignore */ }
        }

        ws.onclose = () => {
          setWsConnected(false)
          wsRef.current = null
          reconnectTimer = setTimeout(connect, 3000)
        }

        ws.onerror = () => {
          ws?.close()
        }
      } catch {
        reconnectTimer = setTimeout(connect, 3000)
      }
    }

    connect()
    return () => {
      clearTimeout(reconnectTimer)
      if (ws) ws.close()
    }
  }, [])

  // Poll fallback (runs alongside WebSocket for missed events)
  const fetchAgents = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/agents`, { params: { page: 1, limit: 50 } })
      const agents = res.data.agents || []
      const currentWallets = new Set(agents.map(a => a.wallet))

      if (prevWalletsRef.current.size > 0) {
        const newAgents = agents.filter(a => !prevWalletsRef.current.has(a.wallet))
        if (newAgents.length > 0) {
          setEvents(prev => [...newAgents.map(a => ({
            wallet: a.wallet,
            score: a.agentic_score || 0,
            action: 'agent_detected',
            timestamp: a.last_seen || Math.floor(Date.now() / 1000),
          })), ...prev].slice(0, 50))
        }
      }

      setEvents(prev => {
        const walletMap = {}
        agents.forEach(a => { walletMap[a.wallet] = a })
        return prev.map(e => {
          const u = walletMap[e.wallet]
          return u ? { ...e, score: u.agentic_score || 0 } : e
        })
      })

      prevWalletsRef.current = currentWallets
    } catch { /* retry */ }
  }, [])

  useEffect(() => {
    fetchAgents()
    const interval = setInterval(fetchAgents, 10000) // slower poll as backup
    return () => clearInterval(interval)
  }, [fetchAgents])

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [events])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-white/80">Live Heartbeat Monitor</h2>
          <p className="text-xs text-white/20 mt-1">Real-time agent activity on the Mantle network</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-medium ${
          wsConnected
            ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400/80'
            : 'bg-amber-500/5 border-amber-500/10 text-amber-400/80'
        }`}>
          <span className="relative flex w-2 h-2">
            {wsConnected && <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />}
            <span className={`relative rounded-full w-2 h-2 ${wsConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </span>
          {wsConnected ? 'Live' : 'Polling'}
        </div>
      </div>

      {/* Feed */}
      <div
        ref={feedRef}
        className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden
          backdrop-blur-xl max-h-[480px] overflow-y-auto
          shadow-inner shadow-black/5
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-white/[0.04]
          [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {/* Pulse animation */}
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 animate-pulse" />
              <div className="absolute inset-2 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-white/20">Waiting for heartbeats...</p>
            <p className="text-xs text-white/10 mt-1">Connect the backend oracle to see live events</p>
          </div>
        ) : (
          <div className="p-1">
            {events.map((event, i) => {
              const scoreColor = event.score >= 70
                ? 'text-emerald-400'
                : event.score >= 40
                  ? 'text-amber-400'
                  : 'text-red-400'
              const scoreBg = event.score >= 70
                ? 'bg-emerald-500/5'
                : event.score >= 40
                  ? 'bg-amber-500/5'
                  : 'bg-red-500/5'

              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/[0.02] transition-all duration-150 group"
                >
                  <span className="text-[10px] text-white/[0.12] font-mono w-16 shrink-0">
                    {event.timestamp
                      ? new Date(event.timestamp * 1000).toLocaleTimeString()
                      : '--:--:--'}
                  </span>
                  <span className="text-xs font-mono text-blue-400/50 group-hover:text-blue-400/80 transition-colors truncate">
                    {shortenAddress(event.wallet)}
                  </span>
                  <span className="text-[10px] text-white/20 truncate flex-1">{event.action}</span>
                  <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md ${scoreColor} ${scoreBg}`}>
                    {event.score}/100
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-[10px] text-white/20 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Verified (&ge;70)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Pending (40&ndash;69)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          Human ({'<'}40)
        </span>
      </div>
    </div>
  )
}

function shortenAddress(address) {
  if (!address || address.length < 10) return address || 'Unknown'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
