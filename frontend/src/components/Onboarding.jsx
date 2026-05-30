import React, { useState } from 'react'

const API_STEPS = [
  {
    num: '01',
    title: 'Submit Heartbeats',
    desc: 'Send periodic heartbeat signals from your agent with action data for analysis.',
    code: `POST /api/v1/heartbeat
Content-Type: application/json

{
  "wallet": "0xYourWalletAddress",
  "timestamp": 1700000000,
  "action": "swap",
  "asset": "mETH",
  "amount": 1000,
  "strategy_type": "momentum",
  "market_event": "price_drop_5pct"
}`,
  },
  {
    num: '02',
    title: 'Run Alpha Intelligence',
    desc: 'Get a multi-source intelligence report combining on-chain, Nansen, Allora, and Elfa data.',
    code: `GET /api/v1/alpha/0xYourWallet

# Response includes:
# - alpha_score (0-100, weighted across 4 sources)
# - score_breakdown (onchain, entity, market, social)
# - sources (which APIs are active)
# - auto-verification if score >= 70`,
  },
  {
    num: '03',
    title: 'On-Chain Scan',
    desc: 'Deep behavioral analysis of on-chain transaction patterns from Mantle blocks.',
    code: `GET /api/v1/scan/0xYourWallet

# Returns:
# - overall_score (0-100)
# - is_verified_agent (bool)
# - components (timing, gas, contracts, interactions)
# - auto-verifies on-chain if score >= 70`,
  },
  {
    num: '04',
    title: 'Share Your Badge',
    desc: 'Generate a shareable SVG badge showing your agent verification status.',
    code: `GET /api/v1/badge/0xYourWallet

# Returns an SVG image with:
# - Alpha score display
# - Wallet address (truncated)
# - Verification status
# - Chain: Mantle Sepolia`,
  },
]

const SDK_STEPS = [
  {
    num: '01',
    title: 'Check Verification',
    desc: 'Query the oracle to see if a wallet is a verified AI agent.',
    code: `GET /api/v1/verify/0xYourWallet

# Returns:
# - is_verified_agent (bool)
# - verdict (VERIFIED / PENDING / REJECTED)
# - score, threshold, heartbeats_count`,
  },
  {
    num: '02',
    title: 'Score History',
    desc: 'Track how a wallet verification score changes over time.',
    code: `GET /api/v1/score-history/0xYourWallet

# Returns:
# - history: [{ score, timestamp }, ...]
# - current_score, current_status`,
  },
  {
    num: '03',
    title: 'Live Events',
    desc: 'Connect to WebSocket for real-time agent activity updates.',
    code: `ws://localhost:8000/api/v1/ws

# Events broadcast:
# { type: "heartbeat", wallet, score, status }
# { type: "scan", wallet, score, status }
# { type: "alpha", wallet, alpha_score, status }`,
  },
  {
    num: '04',
    title: 'Download Report',
    desc: 'Generate a plain-text report for any agent wallet.',
    code: `GET /api/v1/report/0xYourWallet

# Returns a downloadable .txt file with:
# - Score breakdown
# - Score history
# - Verification status`,
  },
]

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative rounded-xl bg-zinc-900/50 border border-[var(--border)] overflow-hidden">
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={handleCopy}
          className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-[var(--bg-card-hover)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono text-[var(--text-secondary)] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function Onboarding() {
  const [tab, setTab] = useState('api')

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-[400] tracking-tight text-[var(--text-primary)]">Integration Guide</h1>
        <p className="font-serif italic text-sm text-[var(--text-muted)] mt-1">API reference and integration patterns for Proof-of-Turing</p>
      </div>

      <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] w-fit">
        {[
          { id: 'api', label: 'Core API' },
          { id: 'sdk', label: 'Extended API' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              tab === t.id ? 'bg-[var(--color-action-azure)]/15 text-[var(--color-action-azure)] border border-[var(--color-action-azure)]/20' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {(tab === 'api' ? API_STEPS : SDK_STEPS).map((step, i) => (
          <div
            key={i}
            className="group rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6 hover:bg-[var(--bg-card-hover)] hover:border-[var(--color-action-azure)]/30 transition-all duration-200"
          >
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:border-[var(--color-cofounder-blue)]/30 transition-colors">
                <span className="font-serif italic text-[11px] font-[400] text-[var(--color-action-azure)]/50">{step.num}</span>
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h3 className="font-serif text-sm font-[400] text-[var(--text-primary)] group-hover:text-[var(--text-primary)] transition-colors">{step.title}</h3>
                  <p className="font-serif italic text-xs text-[var(--text-muted)] mt-1">{step.desc}</p>
                </div>
                <CodeBlock code={step.code} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-[var(--color-cofounder-blue)]/8 to-transparent border border-[var(--color-cofounder-blue)]/15 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-cofounder-blue)]/15 border border-[var(--color-cofounder-blue)]/15 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[var(--color-cofounder-blue)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <h3 className="font-serif text-sm font-[400] text-[var(--color-cofounder-blue)]">Alpha & Data Track</h3>
            <p className="font-serif italic text-xs text-[var(--color-cofounder-blue)]/50 mt-1 max-w-xl">
              Built for the Turing Test Hackathon 2026. Integrates Allora Network, Nansen, and Elfa AI for multi-source
              on-chain agent verification on Mantle.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
