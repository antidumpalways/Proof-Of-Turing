import React, { useState } from 'react'

const STEPS = [
  {
    num: '01',
    title: 'Install Dependencies',
    desc: 'Install the PoT agent skill package and backend requirements.',
    code: `# Frontend (already included in PoT dashboard)
npm install

# Or for your own agent:
npm install pot-agent-skill axios`,
  },
  {
    num: '02',
    title: 'Initialize Your Agent',
    desc: 'Import and configure the agent skill with your wallet and oracle endpoint.',
    code: `const pot = require('pot-agent-skill');

// Initialize with your wallet
await pot.init({
  wallet: '0xYourWalletAddress',
  oracleUrl: 'https://your-oracle.url',
});`,
  },
  {
    num: '03',
    title: 'Submit Heartbeats',
    desc: 'Send periodic heartbeat signals with action data for analysis.',
    code: `// Submit a single heartbeat
await pot.heartbeat({
  action: 'swap',
  asset: 'mETH',
  amount: 1000,
  strategy_type: 'momentum',
  market_event: 'price_drop_5pct',
});

// Or batch multiple heartbeats
await pot.heartbeatBatch([
  { action: 'check_balance', asset: 'MNT' },
  { action: 'swap', asset: 'USDC', amount: 500 },
]);`,
  },
  {
    num: '04',
    title: 'Check Verification Status',
    desc: 'Query the oracle to see your agentic score and verification status.',
    code: `// Check if your agent is verified
const verified = await pot.isVerified();
console.log('Verified AI Agent:', verified);

// Get detailed score breakdown
const score = await pot.getScore();
console.log('Agentic Score:', score.off_chain.score);
console.log('Components:', score.off_chain.components);

// Generate a shareable badge
const badge = await pot.getBadge();
console.log(badge); // SVG string`,
  },
]

const CLI_STEPS = [
  {
    num: '01',
    title: 'Quick Verification',
    desc: 'Check any wallet address instantly via CLI.',
    code: `npx clawhub install pot-verify
pot-verify check 0xYourWalletAddress`,
  },
  {
    num: '02',
    title: 'Full Analysis',
    desc: 'Get a detailed breakdown of all four analysis dimensions.',
    code: `pot-verify analyze 0xYourWalletAddress`,
  },
  {
    num: '03',
    title: 'Mock Agent Demo',
    desc: 'Run a simulated AI or script agent to test the system.',
    code: `# Run a realistic AI agent simulation
python scripts/mock-agent.py --type real-ai --count 15

# Run a script/bot simulation for comparison
python scripts/mock-agent.py --type script --count 15

# Run both simultaneously
python scripts/mock-agent.py --type both --count 10`,
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
    <div className="group relative rounded-xl bg-zinc-900/50 border border-white/[0.06] overflow-hidden">
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={handleCopy}
          className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white/[0.04] border border-white/[0.06] text-white/20 hover:text-white/60 hover:bg-white/[0.08] transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono text-white/30 leading-relaxed">
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
        <h1 className="text-xl font-bold tracking-tight text-white/80">Agent Onboarding</h1>
        <p className="text-sm text-white/20 mt-1">Get started with Proof-of-Turing in minutes</p>
      </div>

      {/* Tab toggle */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.02] border border-white/[0.06] w-fit">
        {[
          { id: 'api', label: 'NPM Module' },
          { id: 'cli', label: 'CLI Tool' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              tab === t.id ? 'bg-white/10 text-white shadow-sm' : 'text-white/20 hover:text-white/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {(tab === 'api' ? STEPS : CLI_STEPS).map((step, i) => (
          <div
            key={i}
            className="group rounded-2xl bg-white/[0.015] border border-white/[0.06] p-6 hover:bg-white/[0.03] hover:border-white/10 transition-all duration-200"
          >
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:border-emerald-500/20 transition-colors">
                <span className="text-[10px] font-mono font-semibold text-white/20">{step.num}</span>
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-white/60 group-hover:text-white/80 transition-colors">{step.title}</h3>
                  <p className="text-xs text-white/20 mt-1">{step.desc}</p>
                </div>
                <CodeBlock code={step.code} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* API Reference Card */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-emerald-400/80">REST API Ready</h3>
            <p className="text-xs text-emerald-400/40 mt-1 max-w-xl">
              The PoT Oracle exposes a full REST API. Use the <span className="font-mono text-emerald-400/60">Verify</span> page to check any wallet,
              or integrate directly via the NPM module.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
