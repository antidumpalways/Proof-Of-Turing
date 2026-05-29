import React from 'react'
import AgentCard from './AgentCard'

/**
 * AgentList — paginated list of registered agents with search.
 *
 * Props:
 *   agents: array
 *   loading: bool
 *   error: string|null
 *   page: number
 *   totalPages: number
 *   totalAgents: number
 *   onPageChange: function(page)
 *   onAgentClick: function(agent)
 *   onSearch: function(address)
 */
export default function AgentList({
  agents,
  loading,
  error,
  page,
  totalPages,
  totalAgents,
  onPageChange,
  onAgentClick,
  onSearch,
}) {
  const [searchValue, setSearchValue] = React.useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch?.(searchValue)
  }

  // ── Loading State ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[var(--sidebar-border)] border-t-white/30 animate-spin" />
          <div className="absolute inset-1 rounded-full border-2 border-white/[0.02] border-t-emerald-400/30 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
        </div>
        <p className="text-sm text-[var(--text-muted)] font-medium">Scanning agents on Mantle...</p>
      </div>
    )
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="rounded-2xl bg-red-500/5 border border-red-500/10 p-6 flex items-start gap-3">
        <svg className="w-5 h-5 text-red-400/50 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <p className="text-sm font-medium text-red-400/70">Failed to load agents</p>
          <p className="text-xs text-red-400/40 mt-1 font-mono">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search wallet address (0x...)"
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl pl-11 pr-4 py-3
              text-sm font-mono text-white/70 placeholder-[var(--text-faint)]
              outline-none focus:border-[var(--border-hover)] focus:bg-[var(--bg-card-hover)] focus:ring-1 focus:ring-[var(--text-faint)]
              transition-all duration-200"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-white text-black text-xs font-semibold
            hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--overlay)]
            active:scale-[0.97] transition-all duration-200"
        >
          Verify
        </button>
      </form>

      {/* Agent List */}
      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[var(--text-faint)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--text-muted)]">No agents registered yet</p>
          <p className="text-xs text-[var(--text-faint)] mt-1">Agents will appear here once they submit heartbeats</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              {agents.length} of {totalAgents} agents
            </span>
          </div>

          <div className="space-y-2">
            {agents.map((agent) => (
              <AgentCard
                key={agent.wallet}
                agent={agent}
                onClick={onAgentClick}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium
                  text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]
                  disabled:opacity-20 disabled:pointer-events-none
                  transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Prev
              </button>
              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium
                  text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]
                  disabled:opacity-20 disabled:pointer-events-none
                  transition-all duration-200"
              >
                Next
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
