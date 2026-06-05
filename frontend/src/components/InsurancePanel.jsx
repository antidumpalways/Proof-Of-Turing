import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useToast } from './Toast'
import { FadeIn, AnimatedNumber } from './Motion'

const API_BASE = '/api/v1'

export default function InsurancePanel() {
  const addToast = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalStaked: '0', totalClaims: '0', claimBalance: '0' })
  const [quarantineLog, setQuarantineLog] = useState([])
  const [demoAgentWallet, setDemoAgentWallet] = useState('')
  const [stakeAmount, setStakeAmount] = useState('10')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Get pool info from on-chain via a sample wallet (since backend doesn't expose directly)
      // In production, would have a dedicated /api/v1/insurance-pool endpoint
      const [threatsRes] = await Promise.all([
        axios.get(`${API_BASE}/threats`, { params: { limit: 50 } }),
      ])
      // Count quarantines
      const quarantined = threatsRes.data.threats?.filter(t => t.threat_type === 'QUARANTINED').length || 0
      setQuarantineLog(threatsRes.data.threats?.slice(0, 10) || [])
    } catch {
      setQuarantineLog([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleDemoStake = () => {
    addToast('Demo: Agent stake requires deployed InsuranceFund contract. Use deploy script first.', 'info')
  }

  const handleDemoSlash = () => {
    addToast('Demo: Slashing requires oracle private key. Configure in .env', 'info')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-4">
      <FadeIn>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-2xl font-[400] tracking-tight text-[var(--text-primary)]">Insurance Fund</h1>
            <p className="font-serif italic text-sm text-[var(--text-muted)] mt-1">Stake MNT as collateral - slashed on policy violation</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={50}>
        <div className="rounded-lg bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-inset)] border border-[var(--border)] p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider mb-1">TOTAL STAKED</div>
              <AnimatedNumber value={parseFloat(stats.totalStaked) || 0} className="text-2xl font-bold font-mono text-[var(--text-primary)]" />
              <div className="text-[10px] text-[var(--text-faint)] mt-1">MNT locked by all agents</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider mb-1">CLAIM BALANCE</div>
              <AnimatedNumber value={parseFloat(stats.claimBalance) || 0} className="text-2xl font-bold font-mono text-[var(--accent)]" />
              <div className="text-[10px] text-[var(--text-faint)] mt-1">Available for compensation</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider mb-1">TOTAL CLAIMS</div>
              <AnimatedNumber value={parseFloat(stats.totalClaims) || 0} className="text-2xl font-bold font-mono text-[var(--text-primary)]" />
              <div className="text-[10px] text-[var(--text-faint)] mt-1">Compensation paid out</div>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-5">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">How It Works</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-md bg-[var(--bg-inset)]">
              <div className="w-10 h-10 mx-auto rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-2">
                <span className="text-[var(--accent)] text-lg font-bold">1</span>
              </div>
              <div className="text-[12px] font-medium text-[var(--text-primary)] mb-1">Agent Stakes</div>
              <div className="text-[10px] text-[var(--text-muted)]">Agent locks MNT as collateral to operate on the platform</div>
            </div>
            <div className="text-center p-4 rounded-md bg-[var(--bg-inset)]">
              <div className="w-10 h-10 mx-auto rounded-full bg-[var(--warning)]/10 flex items-center justify-center mb-2">
                <span className="text-[var(--warning)] text-lg font-bold">2</span>
              </div>
              <div className="text-[12px] font-medium text-[var(--text-primary)] mb-1">Violation Detected</div>
              <div className="text-[10px] text-[var(--text-muted)]">If agent violates policy, oracle slashes stake automatically</div>
            </div>
            <div className="text-center p-4 rounded-md bg-[var(--bg-inset)]">
              <div className="w-10 h-10 mx-auto rounded-full bg-[var(--success)]/10 flex items-center justify-center mb-2">
                <span className="text-[var(--success)] text-lg font-bold">3</span>
              </div>
              <div className="text-[12px] font-medium text-[var(--text-primary)] mb-1">User Compensated</div>
              <div className="text-[10px] text-[var(--text-muted)]">Slashed funds compensate affected users from insurance pool</div>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={150}>
        <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-5">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Stake as Agent (Demo)</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">Agent Wallet</label>
              <input
                value={demoAgentWallet}
                onChange={e => setDemoAgentWallet(e.target.value)}
                placeholder="0x..."
                className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-md px-3 py-2 text-[12px] font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">Amount (MNT)</label>
              <input
                value={stakeAmount}
                onChange={e => setStakeAmount(e.target.value)}
                type="number"
                className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-md px-3 py-2 text-[12px] font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>
            <div className="flex items-end">
              <button onClick={handleDemoStake} className="w-full px-4 py-2 rounded-md text-white text-[12px] font-semibold transition-all" style={{ background: 'linear-gradient(135deg, #65B3AE, #4a9d99)' }}>
                Stake
              </button>
            </div>
          </div>
          <p className="text-[10px] text-[var(--text-faint)] mt-3 font-mono">
            Requires deployed InsuranceFund contract. Run: npx hardhat run scripts/deploy.js --network mantleTestnet
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-5">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Recent Insurance Activity</div>
          {quarantineLog.length === 0 ? (
            <p className="text-[12px] text-[var(--text-muted)] text-center py-6">No insurance events recorded yet</p>
          ) : (
            <div className="space-y-2">
              {quarantineLog.slice(0, 5).map((q, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-md bg-[var(--bg-inset)]">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]" />
                    <span className="text-[12px] font-mono text-[var(--text-primary)]">{q.wallet?.slice(0, 8)}...{q.wallet?.slice(-6)}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">{q.threat_type}</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-faint)] font-mono">
                    {new Date(q.timestamp * 1000).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  )
}
