import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useToast } from './Toast'
import { FadeIn, AnimatedNumber } from './Motion'

const API_BASE = '/api/v1'

const PROTOCOL_TEMPLATES = [
  { name: 'Merchant Moe', address: '0x0000000000000000000000000000000000000001', category: 'DEX' },
  { name: 'Agni Finance', address: '0x0000000000000000000000000000000000000002', category: 'DEX' },
  { name: 'Byreal', address: '0x0000000000000000000000000000000000000003', category: 'CLMM' },
  { name: 'Uniswap V3', address: '0x0000000000000000000000000000000000000004', category: 'DEX' },
  { name: 'Lendle', address: '0x0000000000000000000000000000000000000005', category: 'Lending' },
  { name: 'Aave V3', address: '0x0000000000000000000000000000000000000006', category: 'Lending' },
]

export default function PolicyDesigner({ initialWallet, onPolicySet }) {
  const addToast = useToast()
  const [wallet, setWallet] = useState(initialWallet || '')
  const [agent, setAgent] = useState('')
  const [maxTx, setMaxTx] = useState(500)
  const [dailyLimit, setDailyLimit] = useState(5000)
  const [slippage, setSlippage] = useState(3)
  const [autoQuarantine, setAutoQuarantine] = useState(true)
  const [alertThreshold, setAlertThreshold] = useState(60)
  const [selectedProtocols, setSelectedProtocols] = useState({})
  const [loading, setLoading] = useState(false)
  const [existingPolicy, setExistingPolicy] = useState(null)

  const isValidWallet = /^0x[a-fA-F0-9]{40}$/.test(wallet)

  useEffect(() => {
    if (initialWallet) {
      setWallet(initialWallet)
      loadExistingPolicy(initialWallet)
    }
  }, [initialWallet])

  const loadExistingPolicy = useCallback(async (w) => {
    try {
      const res = await axios.get(`${API_BASE}/guard-policy/${w}`)
      if (res.data.policy) {
        const p = res.data.policy
        setMaxTx(p.max_risk_score ? Number(p.max_risk_score) : 500)
        setAutoQuarantine(!!p.auto_quarantine)
        setAlertThreshold(p.alert_threshold ? Number(p.alert_threshold) : 60)
        setExistingPolicy(p)
      }
    } catch {
      setExistingPolicy(null)
    }
  }, [])

  const toggleProtocol = (addr) => {
    setSelectedProtocols(prev => ({ ...prev, [addr]: !prev[addr] }))
  }

  const handleSubmit = async () => {
    if (!isValidWallet) {
      addToast('Invalid wallet address', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(`${API_BASE}/guard-policy`, {
        wallet: wallet.toLowerCase(),
        max_risk_score: maxTx,
        auto_quarantine: autoQuarantine,
        alert_threshold: alertThreshold,
      })
      addToast('Policy deployed successfully', 'success')
      onPolicySet?.(res.data)
      loadExistingPolicy(wallet.toLowerCase())
    } catch (e) {
      addToast('Failed to set policy: ' + (e.response?.data?.detail || e.message), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-4">
      <FadeIn>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-2xl font-[400] tracking-tight text-[var(--text-primary)]">Policy Designer</h1>
            <p className="font-serif italic text-sm text-[var(--text-muted)] mt-1">Set financial guardrails for your AI agent</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={50}>
        <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-5">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Vault Configuration</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">Vault Owner (Your wallet)</label>
              <input
                value={wallet}
                onChange={e => setWallet(e.target.value)}
                placeholder="0x..."
                className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-md px-3 py-2 text-[12px] font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">Agent Wallet (Optional)</label>
              <input
                value={agent}
                onChange={e => setAgent(e.target.value)}
                placeholder="0x... (will manage this vault)"
                className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-md px-3 py-2 text-[12px] font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-5">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">Spending Limits</div>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] text-[var(--text-primary)]">Max TX Size</label>
                <span className="text-[12px] font-mono font-semibold text-[var(--accent)]">${maxTx.toLocaleString()} USDC</span>
              </div>
              <input
                type="range" min="10" max="10000" step="10"
                value={maxTx}
                onChange={e => setMaxTx(Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-faint)] mt-1">
                <span>$10</span>
                <span>$10,000</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] text-[var(--text-primary)]">Daily Limit</label>
                <span className="text-[12px] font-mono font-semibold text-[var(--accent)]">${dailyLimit.toLocaleString()} USDC</span>
              </div>
              <input
                type="range" min="100" max="100000" step="100"
                value={dailyLimit}
                onChange={e => setDailyLimit(Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-faint)] mt-1">
                <span>$100</span>
                <span>$100,000</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] text-[var(--text-primary)]">Max Slippage</label>
                <span className="text-[12px] font-mono font-semibold text-[var(--accent)]">{slippage}%</span>
              </div>
              <input
                type="range" min="0.1" max="10" step="0.1"
                value={slippage}
                onChange={e => setSlippage(Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-faint)] mt-1">
                <span>0.1%</span>
                <span>10%</span>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={150}>
        <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-5">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Protocol Whitelist</div>
          <p className="text-[11px] text-[var(--text-muted)] mb-4">Agent can only interact with selected protocols</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PROTOCOL_TEMPLATES.map(p => (
              <button
                key={p.address}
                onClick={() => toggleProtocol(p.address)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-[12px] transition-all ${
                  selectedProtocols[p.address]
                    ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)]'
                    : 'bg-[var(--bg-inset)] border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                  selectedProtocols[p.address] ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)]'
                }`}>
                  {selectedProtocols[p.address] && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </div>
                <span className="flex-1 text-left font-medium">{p.name}</span>
                <span className="text-[9px] font-mono opacity-60">{p.category}</span>
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-5">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">Risk Settings</div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[12px] text-[var(--text-primary)] font-medium">Auto-Quarantine</div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Quarantine agent automatically if risk &gt;= 80</div>
            </div>
            <button
              onClick={() => setAutoQuarantine(!autoQuarantine)}
              className={`relative w-11 h-6 rounded-full transition-colors ${autoQuarantine ? 'bg-[var(--accent)]' : 'bg-[var(--bg-inset)]'}`}
            >
              <div className={`absolute top-0.5 ${autoQuarantine ? 'left-5' : 'left-0.5'} w-5 h-5 rounded-full bg-white transition-all`} />
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] text-[var(--text-primary)]">Alert Threshold</label>
              <span className="text-[12px] font-mono font-semibold text-[var(--warning)]">{alertThreshold}/100</span>
            </div>
            <input
              type="range" min="20" max="95" step="5"
              value={alertThreshold}
              onChange={e => setAlertThreshold(Number(e.target.value))}
              className="w-full accent-[var(--warning)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-faint)] mt-1">
              <span>20 (more sensitive)</span>
              <span>95 (less sensitive)</span>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={250}>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={!isValidWallet || loading}
            className="px-5 py-2.5 rounded-md text-white text-[13px] font-semibold hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ background: 'linear-gradient(135deg, #65B3AE, #4a9d99)' }}
          >
            {loading ? 'Deploying...' : existingPolicy ? 'Update Policy' : 'Deploy Policy'}
          </button>
          {existingPolicy && (
            <span className="text-[11px] text-[var(--success)] font-mono">
              Policy active since {new Date(existingPolicy.created_at * 1000).toLocaleDateString()}
            </span>
          )}
        </div>
      </FadeIn>
    </div>
  )
}
