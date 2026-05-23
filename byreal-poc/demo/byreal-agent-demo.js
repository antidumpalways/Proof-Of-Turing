/**
 * Byreal Agent Demo — PoT Integration
 * 
 * Demonstrates how a Byreal agent uses Proof-of-Turing
 * to verify its AI identity on Mantle.
 * 
 * Run: node demo/byreal-agent-demo.js
 * Requires: PoT Oracle at localhost:8000
 */

const pot = require('../pot-agent-skill/src/index');

// Simulated Byreal agent trading actions
const simulatedTrades = [
  { action: 'swap', asset: 'mETH', amount: 500, strategy_type: 'grid_trading' },
  { action: 'add_liquidity', asset: 'MNT', amount: 2000, strategy_type: 'liquidity_provision', market_event: 'new_pool' },
  { action: 'trade', asset: 'fBTC', amount: 0.5, strategy_type: 'trend_following', market_event: 'price_up_5pct' },
  { action: 'swap', asset: 'USDY', amount: 10000, strategy_type: 'yield_farming' },
  { action: 'trade', asset: 'mETH', amount: 300, strategy_type: 'mean_reversion' },
  { action: 'swap', asset: 'MNT', amount: 1500, strategy_type: 'arbitrage', market_event: 'volume_spike' },
  { action: 'add_liquidity', asset: 'mETH', amount: 10, strategy_type: 'liquidity_provision' },
  { action: 'trade', asset: 'USDY', amount: 5000, strategy_type: 'grid_trading' },
  { action: 'swap', asset: 'fBTC', amount: 1.2, strategy_type: 'trend_following' },
  { action: 'remove_liquidity', asset: 'MNT', amount: 500, strategy_type: 'yield_farming' },
];

async function main() {
  console.log();
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║     🔗 PoT × Byreal — Agent Identity Demo           ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log();

  // Configuration
  const WALLET = process.env.AGENT_WALLET || `0xByrealAgent_${Date.now().toString(36)}`;
  const ORACLE_URL = process.env.POT_ORACLE_URL || 'http://localhost:8000';

  console.log(`Agent:     ${WALLET}`);
  console.log(`Oracle:    ${ORACLE_URL}`);
  console.log();

  // Initialize PoT skill
  pot.init({ wallet: WALLET, oracleUrl: ORACLE_URL });
  console.log();

  // Simulate trading loop
  console.log('─'.repeat(54));
  console.log('  Trading Loop — Submitting Heartbeats');
  console.log('─'.repeat(54));
  console.log();

  for (let i = 0; i < simulatedTrades.length; i++) {
    const trade = simulatedTrades[i];
    process.stdout.write(`  [${i + 1}/${simulatedTrades.length}] ${trade.action} ${trade.amount} ${trade.asset}... `);

    try {
      const result = await pot.heartbeat(trade);
      const score = result.score;
      const scoreStr = score >= 70 ? `\x1b[32m${score}\x1b[0m` : score >= 40 ? `\x1b[33m${score}\x1b[0m` : `\x1b[31m${score}\x1b[0m`;
      process.stdout.write(`Score: ${scoreStr}/100`);
      
      if (result.status === 'insufficient_data') {
        process.stdout.write(' (analyzing...)');
      }
      console.log();
    } catch (err) {
      console.log(`\x1b[31mError: ${err.message}\x1b[0m`);
    }

    // Real agent thinking time (1-3 seconds)
    const delay = 1000 + Math.random() * 2000;
    await new Promise(r => setTimeout(r, delay));
  }

  console.log();
  console.log('─'.repeat(54));
  console.log('  Verification Result');
  console.log('─'.repeat(54));
  console.log();

  // Get final score
  try {
    const scoreData = await pot.getScore(WALLET);
    const isVerified = scoreData.is_verified;

    console.log(`  Final Score:     ${scoreData.score}/100`);
    console.log(`  On-Chain Score:  ${scoreData.onchain_score}/100`);
    console.log(`  Status:          ${scoreData.status}`);
    console.log(`  Badge:           ${scoreData.badge}`);
    console.log();
    console.log(`  ${isVerified ? '✅ VERIFIED AI AGENT' : '❌ NOT VERIFIED'}`);
    
    if (isVerified) {
      // Generate badge
      const badge = await pot.getBadge(WALLET);
      console.log(`  Badge SVG: ${badge.length} chars`);
    }
  } catch (err) {
    console.log(`  Error getting score: ${err.message}`);
  }

  console.log();
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║     Demo Complete                                    ║');
  console.log('║     This agent can now prove it is AI, not human.    ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log();
}

main().catch(console.error);
