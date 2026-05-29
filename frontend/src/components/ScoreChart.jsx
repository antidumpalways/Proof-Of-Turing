import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

/**
 * ScoreChart — premium area chart for agent score history with glassmorphic container.
 *
 * Props:
 *   history: array of { score, timestamp }
 *   wallet: string (optional)
 */
export default function ScoreChart({ history = [], wallet }) {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] p-8">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg className="w-8 h-8 text-[var(--text-faint)] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 20V10M12 20V4M6 20v-6" />
          </svg>
          <p className="text-sm text-[var(--text-muted)] font-medium">No score history available yet</p>
          <p className="text-xs text-[var(--text-faint)] mt-1">Score data will appear once the agent submits heartbeats</p>
        </div>
      </div>
    )
  }

  const data = history.map((record, i) => ({
    name: `#${i + 1}`,
    score: record.score,
    time: record.timestamp
      ? new Date(record.timestamp * 1000).toLocaleString()
      : `Check #${i + 1}`,
  }))

  const currentScore = data[data.length - 1]?.score || 0
  const scoreColor = currentScore >= 70 ? '#34d399' : currentScore >= 40 ? '#fbbf24' : '#f87171'
  const scoreGradId = `scoreGrad_${wallet || 'main'}`

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-3 shadow-2xl">
          <p className="text-[11px] text-[var(--text-secondary)] font-mono mb-1">{payload[0].payload.time}</p>
          <p className="text-sm font-bold" style={{ color: scoreColor }}>
            Score: {payload[0].value}/100
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] p-5 hover:bg-[var(--bg-card-hover)] transition-all duration-300">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id={scoreGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={scoreColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={scoreColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            stroke="rgba(255,255,255,0.08)"
            tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
          />
          <YAxis
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            stroke="rgba(255,255,255,0.08)"
            tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)' }} />
          <Area
            type="monotone"
            dataKey="score"
            stroke={scoreColor}
            strokeWidth={2.5}
            fill={`url(#${scoreGradId})`}
            dot={{ fill: scoreColor, r: 3, stroke: 'none' }}
            activeDot={{ r: 5, fill: scoreColor, stroke: 'rgba(0,0,0,0.5)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--sidebar-border)]">
        <span className="text-[10px] text-[var(--text-muted)] font-mono">Score threshold: 70</span>
        <span className="text-[10px] font-mono" style={{ color: scoreColor }}>
          Current: {currentScore}/100
        </span>
      </div>
    </div>
  )
}
