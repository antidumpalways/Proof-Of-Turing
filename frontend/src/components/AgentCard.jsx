import React from 'react'
import VerificationBadge from './VerificationBadge'

const THREAT_STYLES = {
  Critical: 'bg-red-600/15 text-red-400 border-red-600/30',
  High: 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20',
  Medium: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  Low: 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20',
  None: 'bg-[var(--bg-inset)] text-[var(--text-muted)] border-[var(--border)]',
}

export default function AgentCard({ agent, onClick }) {
  const score = agent.agentic_score || 0
  const risk = agent.risk_score || 0
  const threat = agent.threat_level || 'None'
  const isVerified = agent.is_verified
  const isQuarantined = agent.is_quarantined
  const addr = agent.wallet ? `${agent.wallet.slice(0, 6)}...${agent.wallet.slice(-4)}` : '--'
  const timeAgo = agent.last_seen ? formatTimeAgo(agent.last_seen) : '--'
  const riskColor = risk >= 80 ? 'text-red-600' : risk >= 60 ? 'text-[var(--danger)]' : risk >= 40 ? 'text-amber-400' : 'text-[var(--text-muted)]'

  return (
    <tr
      onClick={() => onClick?.(agent)}
      className={`group cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors border-b border-[var(--border)] last:border-0 ${
        isQuarantined ? 'bg-[var(--danger)]/5' : ''
      }`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{addr}</span>
          {isQuarantined && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-[var(--danger)]/15 text-[var(--danger)] border border-[var(--danger)]/30">
              Q
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <VerificationBadge status={isVerified ? 'verified' : score >= 40 ? 'pending' : 'failed'} />
      </td>
      <td className="px-4 py-3">
        {threat !== 'None' ? (
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold border ${THREAT_STYLES[threat]}`}>
            {threat}
          </span>
        ) : (
          <span className="text-[10px] text-[var(--text-faint)] font-mono">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <span className={`text-[12px] font-bold font-mono ${riskColor}`}>{risk}</span>
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
