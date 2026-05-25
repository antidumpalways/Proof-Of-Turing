import React, { useState, useEffect, useRef } from 'react'

/**
 * LiveMonitor — real-time heartbeat event feed with premium glassmorphic styling.
 *
 * Props:
 *   onVerify: function(wallet)
 */
export default function LiveMonitor({ onVerify }) {
  const [events, setEvents] = useState([])
  const feedRef = useRef(null)

  // Simulate live events (in production, connect via WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      // Production: connect to WebSocket/SSE endpoint
      // setEvents(prev => [...prev.slice(-49), newEvent])
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll to bottom
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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-[11px] text-emerald-400/80 font-medium">
          <span className="relative flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
            <span className="relative rounded-full w-2 h-2 bg-emerald-400" />
          </span>
          Listening
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
