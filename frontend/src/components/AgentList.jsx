import React from 'react'
import AgentCard from './AgentCard'

export default function AgentList({ agents, loading, error, page, totalPages, totalAgents, onPageChange, onAgentClick, onSearch }) {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
          <span className="w-4 h-4 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
          Loading wallets...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 m-4 rounded-md bg-[var(--danger)]/5 border border-[var(--danger)]/20">
        <p className="text-[12px] text-[var(--danger)] font-medium">Failed to load</p>
        <p className="text-[11px] text-[var(--danger)]/60 mt-0.5 font-mono">{error}</p>
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-[13px] text-[var(--text-muted)]">No wallets found</p>
        <p className="text-[11px] text-[var(--text-faint)] mt-1">Scan a wallet address to begin analysis</p>
      </div>
    )
  }

  return (
    <div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Wallet</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Threat</th>
            <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Risk</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Beats</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Last Seen</th>
            <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">RepScore</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <AgentCard key={agent.wallet} agent={agent} onClick={onAgentClick} />
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
          <span className="text-[11px] text-[var(--text-muted)]">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="px-2 py-1 rounded text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-inset)] disabled:opacity-30 transition-colors">Prev</button>
            <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="px-2 py-1 rounded text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-inset)] disabled:opacity-30 transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
