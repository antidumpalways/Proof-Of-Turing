import React from 'react'
import AgentCard from './AgentCard'

/**
 * List of all registered agents with pagination.
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

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        <p>Scanning agents on Mantle...</p>
      </div>
    )
  }

  if (error) {
    return <div className="error">⚠️ {error}</div>
  }

  return (
    <div>
      {/* Search Bar */}
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder="Search wallet address (0x...)"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <button type="submit" className="search-btn">
          Verify
        </button>
      </form>

      {/* Agent List */}
      {agents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📡</div>
          <p>No agents found yet</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Agents will appear here once they submit heartbeats
          </p>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Showing {agents.length} of {totalAgents} agents
          </div>
          <div className="agent-list">
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
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
