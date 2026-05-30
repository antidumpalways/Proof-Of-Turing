import React from 'react'

/**
 * VerificationBadge — premium pill badge showing agent verification status.
 *
 * Props:
 *   status: "verified" | "pending" | "failed" | "no_data" | "likely_agent" | "uncertain" | "insufficient_data"
 *   score (optional): number 0-100
 */
export default function VerificationBadge({ status = 'no_data', score, size = 'sm' }) {
  const config = {
    verified: {
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      label: 'Verified AI',
      classes: 'bg-[var(--color-cofounder-blue)]/10 text-[var(--color-cofounder-blue)] border-[var(--color-cofounder-blue)]/20',
    },
    pending: {
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      label: 'Pending',
      classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    failed: {
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
      label: 'Likely Human',
      classes: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
    likely_agent: {
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      label: 'Likely AI',
      classes: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    },
    uncertain: {
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
      label: 'Uncertain',
      classes: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    },
    insufficient_data: {
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      ),
      label: 'Insufficient Data',
      classes: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    },
    no_data: {
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
      label: 'No Data',
      classes: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    },
  }

  const cfg = config[status] || config.no_data

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold 
        transition-all duration-200 ${cfg.classes}`}
    >
      {cfg.icon}
      <span>{cfg.label}</span>
      {score !== undefined && (
        <span className="opacity-60">· {score}/100</span>
      )}
    </span>
  )
}
