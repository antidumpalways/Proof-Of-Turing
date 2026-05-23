/**
 * Proof-of-Turing Agent Skill
 * 
 * Byreal Skills CLI compatible module that enables any AI agent
 * on Mantle to verify its identity, submit heartbeats, and
 * prove it's an autonomous AI — not a human or script.
 * 
 * Usage (with Byreal Skills CLI):
 *   const pot = require('pot-agent-skill');
 *   await pot.heartbeat({ action: 'swap', asset: 'mETH' });
 *   const status = await pot.verify(walletAddress);
 *   console.log(status.badge); // "✅ Verified AI Agent"
 */

const axios = require('axios');

const DEFAULT_ORACLE_URL = 'https://pot-oracle.mantle.xyz';
const DEFAULT_POT_CONTRACT = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

/**
 * @typedef {Object} PoTConfig
 * @property {string} oracleUrl - PoT Oracle API URL
 * @property {string} potContract - PoTRegistry contract address
 * @property {string} wallet - Agent wallet address
 */

/**
 * @typedef {Object} HeartbeatPayload
 * @property {string} action - Type of action (swap, trade, add_liquidity, etc.)
 * @property {string} [asset] - Asset involved (MNT, mETH, USDY, fBTC)
 * @property {number} [amount] - Amount of asset
 * @property {string} [strategy_type] - Strategy used
 * @property {string} [market_event] - Market event responded to
 * @property {string} [tx_hash] - Transaction hash
 */

const defaultConfig = {
  oracleUrl: process.env.POT_ORACLE_URL || DEFAULT_ORACLE_URL,
  potContract: process.env.POT_CONTRACT || DEFAULT_POT_CONTRACT,
  wallet: process.env.AGENT_WALLET || '',
};

/**
 * Initialize PoT skill with custom configuration.
 * @param {Partial<PoTConfig>} config
 * @returns {PoTConfig}
 */
function init(config = {}) {
  Object.assign(defaultConfig, config);
  console.log(`[PoT] Initialized — Oracle: ${defaultConfig.oracleUrl}`);
  console.log(`[PoT] Contract: ${defaultConfig.potContract}`);
  console.log(`[PoT] Wallet: ${defaultConfig.wallet || 'Not set'}`);
  return { ...defaultConfig };
}

/**
 * Submit a heartbeat to the PoT Oracle.
 * Records the agent's action for behavioral analysis.
 * 
 * @param {HeartbeatPayload} payload
 * @param {PoTConfig} [config]
 * @returns {Promise<{score: number, status: string, heartbeats_count: number}>}
 */
async function heartbeat(payload, config = defaultConfig) {
  const wallet = config.wallet || process.env.AGENT_WALLET;
  if (!wallet) throw new Error('[PoT] Wallet not configured. Set AGENT_WALLET or pass config.wallet');

  const heartbeatData = {
    wallet,
    timestamp: Math.floor(Date.now() / 1000),
    action: payload.action || 'unknown',
    asset: payload.asset || null,
    amount: payload.amount || null,
    strategy_type: payload.strategy_type || null,
    market_event: payload.market_event || null,
    tx_hash: payload.tx_hash || null,
  };

  try {
    const res = await axios.post(`${config.oracleUrl}/api/v1/heartbeat`, heartbeatData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    const analysis = res.data.analysis || {};
    return {
      score: analysis.overall_score || 0,
      status: analysis.status || 'pending',
      heartbeats_count: res.data.heartbeats_count || 0,
    };
  } catch (err) {
    throw new Error(`[PoT] Heartbeat failed: ${err.message}`);
  }
}

/**
 * Batch submit multiple heartbeats for historical data.
 * @param {HeartbeatPayload[]} payloads
 * @param {PoTConfig} [config]
 * @returns {Promise<Array>}
 */
async function heartbeatBatch(payloads, config = defaultConfig) {
  const results = [];
  for (const p of payloads) {
    const r = await heartbeat(p, config);
    results.push(r);
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }
  return results;
}

/**
 * Get current agentic score and verification status.
 * @param {string} [wallet] - Wallet to check (defaults to configured wallet)
 * @param {PoTConfig} [config]
 * @returns {Promise<{score: number, is_verified: boolean, badge: string, status: string}>}
 */
async function getScore(wallet, config = defaultConfig) {
  const addr = wallet || config.wallet;
  if (!addr) throw new Error('[PoT] No wallet specified');

  try {
    const res = await axios.get(`${config.oracleUrl}/api/v1/score/${addr}`, { timeout: 10000 });
    const data = res.data;

    return {
      score: data.off_chain?.score || 0,
      onchain_score: data.on_chain?.score || 0,
      is_verified: data.verification?.verdict === 'PASSED',
      badge: data.verification?.badge || 'No data',
      status: data.off_chain?.status || 'unknown',
      components: data.off_chain?.components || {},
    };
  } catch (err) {
    throw new Error(`[PoT] Score query failed: ${err.message}`);
  }
}

/**
 * Quick verification check — returns true/false.
 * @param {string} [wallet]
 * @param {PoTConfig} [config]
 * @returns {Promise<boolean>}
 */
async function isVerified(wallet, config = defaultConfig) {
  const addr = wallet || config.wallet;
  if (!addr) return false;

  try {
    const res = await axios.get(`${config.oracleUrl}/api/v1/verify/${addr}`, { timeout: 10000 });
    return res.data.is_verified_agent === true;
  } catch {
    return false;
  }
}

/**
 * Get a verifiable badge SVG that proves agent identity.
 * Can be embedded in websites or shared on Twitter/X.
 * 
 * @param {string} [wallet]
 * @param {PoTConfig} [config]
 * @returns {Promise<string>} SVG badge markup
 */
async function getBadge(wallet, config = defaultConfig) {
  const addr = wallet || config.wallet;
  const score = await getScore(addr, config);
  const verified = score.is_verified;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="96" viewBox="0 0 240 96">
    <rect width="240" height="96" rx="12" fill="${verified ? '#0a0a0a' : '#0a0a0a'}" stroke="${verified ? '#34d399' : '#f87171'}" stroke-width="1"/>
    <text x="16" y="32" font-family="monospace" font-size="11" fill="#888">PROOF-OF-TURING</text>
    <text x="16" y="58" font-family="sans-serif" font-size="20" font-weight="bold" fill="${verified ? '#34d399' : '#f87171'}">
      ${verified ? 'VERIFIED AI' : 'NOT VERIFIED'}
    </text>
    <text x="16" y="78" font-family="monospace" font-size="10" fill="#555">Score: ${score.score}/100</text>
    <text x="180" y="78" font-family="monospace" font-size="10" fill="#555">Mantle</text>
  </svg>`;
}

module.exports = {
  init,
  heartbeat,
  heartbeatBatch,
  getScore,
  isVerified,
  getBadge,
  VERSION: '1.0.0',
};
