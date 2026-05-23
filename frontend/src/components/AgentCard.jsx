import React from 'react'
import VerificationBadge from './VerificationBadge'

/**
 * Card displaying a single agent's summary.
 * 
 * Props:
 *   agent: { wallet, agentic_score, status, is_verified, heartbeats_count, last_seen }
 *   onClick: function(agent)
 */
export default function AgentCard({ agent, onClick }) {
  const score = agent.agentic_score || 0
  const scoreClass = score >= 70 ? 'score-high' : score >= 40 ? 'score-medium' : 'score-low'
  const avatar = score >= 70 ? '🤖' : score >= 40 ? '🤔' : '👤'

  const status = agent.is_verified
    ? 'verified'
    : agent.status?.replace('_', ' ') || 'no_data'

  const timeAgo = agent.last_seen
    ? formatTimeAgo(agent.last_seen)
    : 'never'

  return (
    <div className="agent-card" onClick={() => onClick?.(agent)}>
      <div className="agent-card-avatar" style={{
        background: score >= 70 ? 'rgba(0,255,136,0.1)' : 'rgba(255,170,0,0.1)',
      }}>
        {avatar}
      </div>
      <div className="agent-card-info">
        <div className="agent-card-address">
          {shortenAddress(agent.wallet)}
        </div>
        <div className="agent-card-meta">
          <VerificationBadge status={agent.status || 'no_data'} />
          {' · '}
          {agent.heartbeats_count || 0} heartbeats · {timeAgo}
        </div>
      </div>
      <div className="agent-card-score">
        <div className={`agent-card-score-value ${scoreClass}`}>
          {score}
        </div>
        <div className="agent-card-score-label">
          Agentic Score
        </div>
      </div>
    </div>
  )
}

function shortenAddress(address) {
  if (!address || address.length < 10) return address || 'Unknown'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatTimeAgo(timestamp) {
  const seconds = Math.floor(Date.now() / 1000) - timestamp
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
