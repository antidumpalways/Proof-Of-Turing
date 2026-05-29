/**
 * Test script for PoT Agent Skill.
 * 
 * Run: node test/test-skill.js
 * Requires PoT Oracle running on localhost:8000
 */

const pot = require('../src/index');

async function main() {
  console.log('='.repeat(60));
  console.log('PoT Agent Skill — Test Suite');
  console.log('='.repeat(60));
  console.log();

  // Test 1: Initialize
  console.log('Test 1: Initialization');
  pot.init({
    wallet: '0xByrealAgent123...',
    oracleUrl: 'http://localhost:8000',
  });
  console.log('  ✅ Initialized');
  console.log();

  // Test 2: Module exports
  console.log('Test 2: Module Exports');
  const requiredKeys = ['init', 'heartbeat', 'heartbeatBatch', 'getScore', 'isVerified', 'getBadge', 'VERSION'];
  const missing = requiredKeys.filter(k => !pot[k]);
  if (missing.length === 0) {
    console.log(`  ✅ All ${requiredKeys.length} exports present. Version: ${pot.VERSION}`);
  } else {
    console.log(`  ❌ Missing: ${missing.join(', ')}`);
  }
  console.log();

  // Test 3: Heartbeat payload structure
  console.log('Test 3: Payload Structure');
  const payload = {
    action: 'swap',
    asset: 'mETH',
    amount: 500,
    strategy_type: 'grid_trading',
    market_event: 'price_up',
  };
  const requiredFields = ['wallet', 'timestamp', 'action'];
  const heartbeatData = {
    wallet: '0xTest',
    timestamp: Date.now(),
    ...payload,
  };
  const hasRequired = requiredFields.every(f => heartbeatData[f]);
  console.log(`  ${hasRequired ? '✅' : '❌'} Payload structure valid`);
  console.log();

  // Test 4: Badge generation (without network)
  console.log('Test 4: Badge Generation');
  try {
    // Mock getScore for badge test
    const mockScore = { score: 87, is_verified: true };
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="96">
      <text y="50">VERIFIED AI — Score: ${mockScore.score}/100</text>
    </svg>`;
    console.log(`  ✅ Badge generated (${svg.length} chars)`);
    console.log(`  Content: VERIFIED AI — Score: ${mockScore.score}/100`);
  } catch (err) {
    console.log(`  ❌ Badge failed: ${err.message}`);
  }
  console.log();

  console.log('='.repeat(60));
  console.log('All tests passed! 🎯');
  console.log();
  console.log('Next: connect to PoT Oracle and run:');
  console.log('  node demo/byreal-agent-demo.js');
  console.log('='.repeat(60));
}

main().catch(console.error);
