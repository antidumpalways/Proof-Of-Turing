import React from 'react'
import VerificationBadge from './VerificationBadge'

/**
 * AgentCard — a sleek, interactive card for displaying an agent's summary.
 *
 * Props:
 *   agent: { wallet, agentic_score, status, is_verified, heartbeats_count, last_seen }
 *   onClick: function(agent)
 */
export default function AgentCard({ agent, onClick }) {
  const score = agent.agentic_score || 0
  const isVerified = agent.is_verified

  const statusLabel = isVerified ? 'verified' : score >= 40 ? 'pending' : 'failed'
  const accentColor = isVerified
    ? 'from-emerald-500/20 to-emerald-400/5'
    : score >= 40
      ? 'from-amber-500/20 to-amber-400/5'
      : 'from-red-500/20 to-red-400/5'
  const borderColor = isVerified
    ? 'border-emerald-500/15 group-hover:border-emerald-500/30'
    : score >= 40
      ? 'border-amber-500/15 group-hover:border-amber-500/30'
      : 'border-red-500/15 group-hover:border-red-500/30'

  const addr = agent.wallet
    ? `${agent.wallet.slice(0, 8)}...${agent.wallet.slice(-6)}`
    : 'Unknown'

  const timeAgo = agent.last_seen
    ? formatTimeAgo(agent.last_seen)
    : null

  return (
    <div
      onClick={() => onClick?.(agent)}
      className="group relative rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] p-5
        cursor-pointer overflow-hidden
        hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)]
        transition-all duration-300 ease-out
        hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10
        active:scale-[0.99]"
    >
      {/* Gradient accent overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      {/* Left indicator bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full transition-all duration-300 
        opacity-0 group-hover:opacity-100 scale-y-0 group-hover:scale-y-100 origin-top
        ${isVerified ? 'bg-emerald-400/60' : score >= 40 ? 'bg-amber-400/60' : 'bg-red-400/60'}`}
      />

      <div className="relative flex items-center gap-4">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
          bg-[var(--bg-card-hover)] border ${isVerified ? 'border-emerald-500/15' : score >= 40 ? 'border-amber-500/15' : 'border-red-500/15'}
          group-hover:scale-105 transition-transform duration-300`}
        >
          <span className="text-lg">{isVerified ? '🤖' : score >= 40 ? '🤔' : '👤'}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-sm font-medium text-[var(--text-primary)] group-hover:text-white/90 transition-colors duration-200 truncate">
            {addr}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <VerificationBadge status={statusLabel} />
            {agent.heartbeats_count > 0 && (
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                {agent.heartbeats_count} beats
              </span>
            )}
            {timeAgo && (
              <span className="text-[10px] text-[var(--text-faint)] font-mono">· {timeAgo}</span>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="text-right shrink-0">
          <div className={`text-2xl font-bold font-mono tracking-tight
            ${isVerified ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'}
            group-hover:scale-105 transition-transform duration-300`}
          >
            {score}
          </div>
          <div className="text-[8px] text-[var(--text-muted)] uppercase tracking-[1.5px] font-semibold mt-0.5">
            Score
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTimeAgo(timestamp) {
  const seconds = Math.floor(Date.now() / 1000) - timestamp
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
