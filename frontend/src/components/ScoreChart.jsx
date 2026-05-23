import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

/**
 * Historical score chart for an agent.
 * 
 * Props:
 *   history: array of { score, timestamp }
 *   wallet: string
 */
export default function ScoreChart({ history = [], wallet }) {
  if (!history || history.length === 0) {
    return (
      <div className="chart-container">
        <div className="empty-state" style={{ padding: 24 }}>
          <p style={{ color: 'var(--text-muted)' }}>No score history available yet</p>
        </div>
      </div>
    )
  }

  // Format data for chart
  const data = history.map((record, i) => ({
    name: `#${i + 1}`,
    score: record.score,
    time: new Date(record.timestamp * 1000).toLocaleString(),
  }))

  const currentScore = data[data.length - 1]?.score || 0
  const scoreColor = currentScore >= 70 ? '#00ff88' : currentScore >= 40 ? '#ffaa00' : '#ff4444'

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#1a1a3e',
          border: '1px solid #2a2a55',
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 12,
        }}>
          <p style={{ color: '#8888aa' }}>{payload[0].payload.time}</p>
          <p style={{ color: '#00ff88', fontWeight: 700 }}>
            Score: {payload[0].value}/100
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="chart-container">
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
        Score History — {shortenAddress(wallet)}
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a55" />
          <XAxis
            dataKey="name"
            stroke="#555577"
            tick={{ fill: '#555577', fontSize: 11 }}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#555577"
            tick={{ fill: '#555577', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke={scoreColor}
            strokeWidth={2}
            dot={{ fill: scoreColor, r: 4 }}
            activeDot={{ r: 6 }}
          />
          {/* Threshold line */}
          <CartesianGrid
            horizontalPoints={[70]}
            stroke="#00ff88"
            strokeDasharray="5 5"
            strokeOpacity={0.3}
          />
        </LineChart>
      </ResponsiveContainer>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 11,
        color: 'var(--text-muted)',
        marginTop: 8,
      }}>
        <span>Score threshold: 70</span>
        <span>Current: {currentScore}/100</span>
      </div>
    </div>
  )
}

function shortenAddress(address) {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
