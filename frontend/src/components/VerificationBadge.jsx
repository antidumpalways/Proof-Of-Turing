import React from 'react'

/**
 * Visual badge indicating agent verification status.
 * 
 * Props:
 *   status: "verified" | "pending" | "failed" | "no_data"
 *   score (optional): number 0-100
 */
export default function VerificationBadge({ status = 'no_data', score }) {
  const config = {
    verified: {
      className: 'verified',
      icon: '✅',
      label: 'Verified AI Agent',
    },
    pending: {
      className: 'pending',
      icon: '⏳',
      label: 'Pending Verification',
    },
    failed: {
      className: 'failed',
      icon: '❌',
      label: 'Likely Human / Script',
    },
    'likely_agent': {
      className: 'pending',
      icon: '🤖',
      label: 'Likely AI Agent',
    },
    uncertain: {
      className: 'pending',
      icon: '⚠️',
      label: 'Uncertain',
    },
    insufficient_data: {
      className: 'no-data',
      icon: '📝',
      label: 'Insufficient Data',
    },
    no_data: {
      className: 'no-data',
      icon: '—',
      label: 'No Data Yet',
    },
  }

  const cfg = config[status] || config.no_data

  return (
    <span className={`verification-badge ${cfg.className}`}>
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
      {score !== undefined && <span>({score}/100)</span>}
    </span>
  )
}
