import React, { useState, useEffect, useRef } from 'react'

/**
 * Live monitor showing real-time heartbeat events.
 * 
 * Props:
 *   onVerify: function(wallet)
 */
export default function LiveMonitor({ onVerify }) {
  const [events, setEvents] = useState([])
  const feedRef = useRef(null)

  // Simulate live events (in production, this would use WebSocket)
  useEffect(() => {
    // Try to connect to a WebSocket or SSE endpoint
    // For now, we'll simulate with polling
    const interval = setInterval(() => {
      // In production, this would be a real event source
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

  const getScoreColor = (score) => {
    if (score >= 70) return 'var(--accent-green)'
    if (score >= 40) return 'var(--accent-yellow)'
    return 'var(--accent-red)'
  }

  return (
    <div className="live-monitor">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>📡 Live Heartbeat Monitor</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Real-time agent activity on Mantle
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          color: 'var(--accent-green)',
        }}>
          <span className="status-dot online" />
          <span>Listening</span>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="live-feed">
          <div className="empty-state" style={{ padding: 24 }}>
            <div className="empty-state-icon">⏳</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              Waiting for agent heartbeats...
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>
              Connect the backend oracle to see live events
            </p>
          </div>
        </div>
      ) : (
        <div className="live-feed" ref={feedRef}>
          {events.map((event, i) => (
            <div key={i} className="live-entry">
              <span className="live-entry-time">
                {new Date(event.timestamp * 1000).toLocaleTimeString()}
              </span>
              <span className="live-entry-wallet">
                {shortenAddress(event.wallet)}
              </span>
              <span className="live-entry-action">
                {event.action}
              </span>
              <span className="live-entry-score" style={{ color: getScoreColor(event.score) }}>
                {event.score}/100
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: 12,
        marginTop: 16,
        fontSize: 12,
        color: 'var(--text-muted)',
      }}>
        <span>🟢 Verified (≥70)</span>
        <span>🟡 Pending (40-69)</span>
        <span>🔴 Human {'<'}40</span>
      </div>
    </div>
  )
}

function shortenAddress(address) {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
