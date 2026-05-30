import React from 'react'
import VerificationBadge from './VerificationBadge'

export default function AgentCard({ agent, onClick }) {
  const score = agent.agentic_score || 0
  const isVerified = agent.is_verified
  const addr = agent.wallet ? `${agent.wallet.slice(0, 6)}...${agent.wallet.slice(-4)}` : '--'
  const timeAgo = agent.last_seen ? formatTimeAgo(agent.last_seen) : '--'

  return (
    <tr
      onClick={() => onClick?.(agent)}
      className="group cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors border-b border-[var(--border)] last:border-0"
    >
      <td className="px-4 py-3">
        <div className="font-mono text-[12px] text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{addr}</div>
      </td>
      <td className="px-4 py-3">
        <VerificationBadge status={isVerified ? 'verified' : score >= 40 ? 'pending' : 'failed'} />
      </td>
      <td className="px-4 py-3 text-[12px] font-mono text-[var(--text-muted)]">{agent.heartbeats_count || 0}</td>
      <td className="px-4 py-3 text-[12px] font-mono text-[var(--text-muted)]">{timeAgo}</td>
      <td className="px-4 py-3 text-right">
        <span className={`text-[14px] font-bold font-mono ${isVerified ? 'text-[var(--success)]' : score >= 40 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'}`}>{score}</span>
      </td>
    </tr>
  )
}

function formatTimeAgo(timestamp) {
  const seconds = Math.floor(Date.now() / 1000) - timestamp
  if (seconds < 60) return 'now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}
