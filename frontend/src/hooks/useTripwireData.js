import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API_BASE = '/api/v1'

export function useTripwireData() {
  const [agents, setAgents] = useState([])
  const [totalAgents, setTotalAgents] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [oracleStatus, setOracleStatus] = useState(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/health`)
      setOracleStatus(res.data)
      return res.data
    } catch {
      setOracleStatus({ status: 'offline' })
      return null
    }
  }, [])

  const fetchAgents = useCallback(async (p) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API_BASE}/agents`, {
        params: { page: p ?? page, limit: pageSize },
      })
      setAgents(res.data.agents || [])
      setTotalAgents(res.data.total || 0)
      setPage(p ?? page)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch agents')
      setAgents([])
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  const getAgentScore = useCallback(async (wallet) => {
    const res = await axios.get(`${API_BASE}/score/${wallet}`)
    return res.data
  }, [])

  const verifyAgent = useCallback(async (wallet) => {
    const res = await axios.get(`${API_BASE}/verify/${wallet}`)
    return res.data
  }, [])

  const scanWallet = useCallback(async (wallet) => {
    const res = await axios.get(`${API_BASE}/scan/${wallet}`, { timeout: 120000 })
    return res.data
  }, [])

  const alphaIntelligence = useCallback(async (wallet) => {
    const res = await axios.get(`${API_BASE}/alpha/${wallet}`, { timeout: 120000 })
    return res.data
  }, [])

  const submitHeartbeat = useCallback(async (heartbeatData) => {
    const res = await axios.post(`${API_BASE}/heartbeat`, heartbeatData)
    return res.data
  }, [])

  const getScoreHistory = useCallback(async (wallet) => {
    const res = await axios.get(`${API_BASE}/score-history/${wallet}`)
    return res.data
  }, [])

  // ─── Guard-Specific APIs ───

  const getGuardStatus = useCallback(async (wallet) => {
    const res = await axios.get(`${API_BASE}/guard-status/${wallet}`)
    return res.data
  }, [])

  const getThreats = useCallback(async (limit = 50) => {
    const res = await axios.get(`${API_BASE}/threats`, { params: { limit } })
    return res.data
  }, [])

  const getThreatHistory = useCallback(async (wallet) => {
    const res = await axios.get(`${API_BASE}/threat-history/${wallet}`)
    return res.data
  }, [])

  const quarantineAgent = useCallback(async (wallet, reason = 'Manual quarantine') => {
    const res = await axios.post(`${API_BASE}/quarantine/${wallet}`, null, {
      params: { reason },
    })
    return res.data
  }, [])

  const unquarantineAgent = useCallback(async (wallet) => {
    const res = await axios.post(`${API_BASE}/unquarantine/${wallet}`)
    return res.data
  }, [])

  const setGuardPolicy = useCallback(async (wallet, policy) => {
    const res = await axios.post(`${API_BASE}/guard-policy`, { wallet, ...policy })
    return res.data
  }, [])

  const getGuardPolicy = useCallback(async (wallet) => {
    const res = await axios.get(`${API_BASE}/guard-policy/${wallet}`)
    return res.data
  }, [])

  const getAlerts = useCallback(async (limit = 50) => {
    const res = await axios.get(`${API_BASE}/alerts`, { params: { limit } })
    return res.data
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    fetchAgents(page)
  }, [page, fetchAgents])

  return {
    agents,
    totalAgents,
    loading,
    error,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalAgents / pageSize)),
    oracleStatus,
    fetchAgents,
    setPage,
    getAgentScore,
    verifyAgent,
    scanWallet,
    alphaIntelligence,
    submitHeartbeat,
    getScoreHistory,
    fetchStatus,
    getGuardStatus,
    getThreats,
    getThreatHistory,
    quarantineAgent,
    unquarantineAgent,
    setGuardPolicy,
    getGuardPolicy,
    getAlerts,
  }
}
