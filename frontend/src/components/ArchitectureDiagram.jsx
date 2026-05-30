import React from 'react'

export default function ArchitectureDiagram() {
  return (
    <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
        </svg>
        <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">System Architecture</span>
      </div>

      <div className="relative font-mono text-[10px]">
        {/* SVG Diagram */}
        <svg viewBox="0 0 800 320" className="w-full h-auto" fill="none">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
            </pattern>
            <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#65B3AE" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#65B3AE" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <rect width="800" height="320" fill="url(#grid)"/>

          {/* Client */}
          <rect x="20" y="120" width="120" height="80" rx="8" fill="#1a1a25" stroke="#1f2937" strokeWidth="1"/>
          <rect x="20" y="120" width="120" height="3" rx="1.5" fill="#65B3AE"/>
          <text x="80" y="150" textAnchor="middle" fill="#e8eaed" fontSize="11" fontWeight="600">Client</text>
          <text x="80" y="168" textAnchor="middle" fill="#6b7280" fontSize="9">React Dashboard</text>
          <text x="80" y="182" textAnchor="middle" fill="#6b7280" fontSize="8">+ WebSocket</text>

          {/* Arrow: Client -> Backend */}
          <line x1="140" y1="160" x2="200" y2="160" stroke="#374151" strokeWidth="1" strokeDasharray="4"/>
          <polygon points="198,156 206,160 198,164" fill="#374151"/>

          {/* Backend */}
          <rect x="210" y="80" width="160" height="160" rx="8" fill="#1a1a25" stroke="#1f2937" strokeWidth="1"/>
          <rect x="210" y="80" width="160" height="3" rx="1.5" fill="#65B3AE"/>
          <text x="290" y="105" textAnchor="middle" fill="#e8eaed" fontSize="11" fontWeight="600">FastAPI Backend</text>
          <text x="290" y="122" textAnchor="middle" fill="#6b7280" fontSize="8">REST + WebSocket</text>

          {/* Backend modules */}
          <rect x="225" y="135" width="65" height="40" rx="4" fill="#12121a" stroke="#374151" strokeWidth="0.5"/>
          <text x="257" y="155" textAnchor="middle" fill="#9ca3af" fontSize="7">Scanner</text>
          <text x="257" y="165" textAnchor="middle" fill="#6b7280" fontSize="6">On-chain</text>

          <rect x="300" y="135" width="65" height="40" rx="4" fill="#12121a" stroke="#374151" strokeWidth="0.5"/>
          <text x="332" y="155" textAnchor="middle" fill="#9ca3af" fontSize="7">Analyzers</text>
          <text x="332" y="165" textAnchor="middle" fill="#6b7280" fontSize="6">4 Dimensions</text>

          <rect x="225" y="185" width="65" height="40" rx="4" fill="#12121a" stroke="#374151" strokeWidth="0.5"/>
          <text x="257" y="205" textAnchor="middle" fill="#9ca3af" fontSize="7">Scorer</text>
          <text x="257" y="215" textAnchor="middle" fill="#6b7280" fontSize="6">ML + Weighted</text>

          <rect x="300" y="185" width="65" height="40" rx="4" fill="#12121a" stroke="#374151" strokeWidth="0.5"/>
          <text x="332" y="205" textAnchor="middle" fill="#9ca3af" fontSize="7">Contract</text>
          <text x="332" y="215" textAnchor="middle" fill="#6b7280" fontSize="6">On-chain Tx</text>

          {/* Arrow: Backend -> Integrations */}
          <line x1="370" y1="120" x2="430" y2="80" stroke="#374151" strokeWidth="1" strokeDasharray="4"/>
          <polygon points="428,76 436,80 428,84" fill="#374151"/>

          <line x1="370" y1="160" x2="430" y2="160" stroke="#374151" strokeWidth="1" strokeDasharray="4"/>
          <polygon points="428,156 436,160 428,164" fill="#374151"/>

          <line x1="370" y1="200" x2="430" y2="240" stroke="#374151" strokeWidth="1" strokeDasharray="4"/>
          <polygon points="428,236 436,240 428,244" fill="#374151"/>

          {/* Integrations */}
          <rect x="440" y="50" width="140" height="50" rx="8" fill="#1a1a25" stroke="#1f2937" strokeWidth="1"/>
          <rect x="440" y="50" width="140" height="3" rx="1.5" fill="#a371f7"/>
          <text x="510" y="72" textAnchor="middle" fill="#e8eaed" fontSize="10" fontWeight="600">Nansen API</text>
          <text x="510" y="86" textAnchor="middle" fill="#6b7280" fontSize="7">Entity Labels</text>

          <rect x="440" y="135" width="140" height="50" rx="8" fill="#1a1a25" stroke="#1f2937" strokeWidth="1"/>
          <rect x="440" y="135" width="140" height="3" rx="1.5" fill="#f59e0b"/>
          <text x="510" y="157" textAnchor="middle" fill="#e8eaed" fontSize="10" fontWeight="600">Allora Network</text>
          <text x="510" y="171" textAnchor="middle" fill="#6b7280" fontSize="7">ML Inference</text>

          <rect x="440" y="220" width="140" height="50" rx="8" fill="#1a1a25" stroke="#1f2937" strokeWidth="1"/>
          <rect x="440" y="220" width="140" height="3" rx="1.5" fill="#34d399"/>
          <text x="510" y="242" textAnchor="middle" fill="#e8eaed" fontSize="10" fontWeight="600">Elfa AI</text>
          <text x="510" y="256" textAnchor="middle" fill="#6b7280" fontSize="7">Social Sentiment</text>

          {/* Arrow: Integrations -> Blockchain */}
          <line x1="580" y1="160" x2="640" y2="160" stroke="#374151" strokeWidth="1" strokeDasharray="4"/>
          <polygon points="638,156 646,160 638,164" fill="#374151"/>

          {/* Blockchain */}
          <rect x="650" y="100" width="130" height="120" rx="8" fill="#1a1a25" stroke="#1f2937" strokeWidth="1"/>
          <rect x="650" y="100" width="130" height="3" rx="1.5" fill="#65B3AE"/>
          <text x="715" y="125" textAnchor="middle" fill="#e8eaed" fontSize="11" fontWeight="600">Mantle</text>
          <text x="715" y="142" textAnchor="middle" fill="#6b7280" fontSize="8">Sepolia Testnet</text>

          <rect x="665" y="155" width="100" height="50" rx="4" fill="#12121a" stroke="#374151" strokeWidth="0.5"/>
          <text x="715" y="175" textAnchor="middle" fill="#9ca3af" fontSize="8" fontWeight="500">PoTRegistry</text>
          <text x="715" y="188" textAnchor="middle" fill="#6b7280" fontSize="7">EIP-8004</text>

          {/* Data flow labels */}
          <text x="170" y="150" textAnchor="middle" fill="#65B3AE" fontSize="7" fontWeight="500">REST</text>
          <text x="400" y="100" textAnchor="middle" fill="#a371f7" fontSize="7" fontWeight="500">Labels</text>
          <text x="400" y="150" textAnchor="middle" fill="#f59e0b" fontSize="7" fontWeight="500">Inference</text>
          <text x="400" y="230" textAnchor="middle" fill="#34d399" fontSize="7" fontWeight="500">Sentiment</text>
          <text x="615" y="150" textAnchor="middle" fill="#65B3AE" fontSize="7" fontWeight="500">Verify</text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#65B3AE]" />
          <span className="text-[10px] text-[var(--text-muted)]">Core</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#a371f7]" />
          <span className="text-[10px] text-[var(--text-muted)]">Nansen</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
          <span className="text-[10px] text-[var(--text-muted)]">Allora</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#34d399]" />
          <span className="text-[10px] text-[var(--text-muted)]">Elfa</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          <span className="text-[10px] text-[var(--text-muted)]">Mantle</span>
        </div>
      </div>
    </div>
  )
}
