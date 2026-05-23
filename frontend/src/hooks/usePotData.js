import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API_BASE = '/api/v1'

/**
 * Custom hook for interacting with the PoT Oracle API.
 */
export function usePotData() {
  const [agents, setAgents] = useState([])
  const [totalAgents, setTotalAgents] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [oracleStatus, setOracleStatus] = useState(null)

  /**
   * Fetch oracle service status.
   */
  const fetchStatus = useCallback(async () => {
    try {
      const res = await axios.get('/')
      setOracleStatus(res.data)
      return res.data
    } catch (err) {
      setOracleStatus({ status: 'offline' })
      return null
    }
  }, [])

  /**
   * Fetch list of agents from the API.
   */
  const fetchAgents = useCallback(async (p = page) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API_BASE}/agents`, {
        params: { page: p, limit: pageSize },
      })
      setAgents(res.data.agents || [])
      setTotalAgents(res.data.total || 0)
      setPage(p)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch agents')
      setAgents([])
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  /**
   * Get detailed score for a specific wallet.
   */
  const getAgentScore = useCallback(async (wallet) => {
    try {
      const res = await axios.get(`${API_BASE}/score/${wallet}`)
      return res.data
    } catch (err) {
      throw new Error(err.response?.data?.detail || err.message || 'Failed to fetch score')
    }
  }, [])

  /**
   * Verify a specific wallet (check if it's an AI agent).
   */
  const verifyAgent = useCallback(async (wallet) => {
    try {
      const res = await axios.get(`${API_BASE}/verify/${wallet}`)
      return res.data
    } catch (err) {
      throw new Error(err.response?.data?.detail || err.message || 'Failed to verify agent')
    }
  }, [])

  /**
   * Submit a heartbeat for an agent.
   */
  const submitHeartbeat = useCallback(async (heartbeatData) => {
    try {
      const res = await axios.post(`${API_BASE}/heartbeat`, heartbeatData)
      return res.data
    } catch (err) {
      throw new Error(err.response?.data?.detail || err.message || 'Failed to submit heartbeat')
    }
  }, [])

  /**
   * Get score history for a wallet.
   */
  const getScoreHistory = useCallback(async (wallet) => {
    try {
      const res = await axios.get(`${API_BASE}/score-history/${wallet}`)
      return res.data
    } catch (err) {
      throw new Error(err.response?.data?.detail || err.message || 'Failed to fetch history')
    }
  }, [])

  // Fetch status on mount
  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Fetch agents on mount and page change
  useEffect(() => {
    fetchAgents(page)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

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
    submitHeartbeat,
    getScoreHistory,
    fetchStatus,
  }
}
