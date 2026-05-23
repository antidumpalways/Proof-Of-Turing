#!/usr/bin/env node
/**
 * pot-verify CLI — Proof-of-Turing Agent Verification
 *
 * Usage:
 *   pot-verify check <wallet>     Quick verification check
 *   pot-verify analyze <wallet>   Full behavioral analysis
 *   pot-verify me                 Self-verification for agents
 */

const https = require('https');
const http = require('http');

const ORACLE_URL = (process.env.POT_ORACLE_URL || 'http://localhost:8000').replace(/\/+$/, '');

function httpGet(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, ORACLE_URL);
    const lib = url.protocol === 'https:' ? https : http;
    lib.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid JSON response')); }
      });
    }).on('error', (err) => {
      reject(new Error(`Connection refused — is the PoT Oracle running at ${ORACLE_URL}?`));
    });
  });
}

async function main() {
  const cmd = process.argv[2];
  const arg = process.argv[3];

  if (!cmd || cmd === '--help' || cmd === '-h') {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║        Proof-of-Turing — pot-verify      ║
  ╚══════════════════════════════════════════╝

  Usage:
    pot-verify check <wallet>     Quick verification check
    pot-verify analyze <wallet>   Full behavioral analysis
    pot-verify me                 Self-verification (agent only)
    pot-verify --help             Show this help
    `);
    return;
  }

  if (cmd === 'check' && arg) {
    await check(arg);
  } else if (cmd === 'analyze' && arg) {
    await analyze(arg);
  } else if (cmd === 'me') {
    console.log('\n  🤖 Self-Verification mode\n  Submit heartbeats first via your agent.\n');
  } else {
    console.log(`Unknown command: ${cmd}`);
  }
}

async function check(wallet) {
  console.log(`\n  Checking: ${wallet}`);
  console.log(`  ${'─'.repeat(50)}`);

  try {
    const data = await httpGet(`${ORACLE_URL}/api/v1/verify/${wallet}`);

    const score = data.score || 0;
    const color = score >= 70 ? '\x1b[32m' : score >= 40 ? '\x1b[33m' : '\x1b[31m';
    
    console.log(`  Score:      ${color}${score}/100\x1b[0m`);
    console.log(`  Verdict:    ${data.verdict || 'N/A'}`);
    console.log(`  Badge:      ${data.badge || 'N/A'}`);
    console.log(`  Heartbeats: ${data.heartbeats_count || 0}`);

    if (data.is_verified_agent) {
      console.log(`\n  \x1b[32m✅ VERIFIED AI AGENT\x1b[0m`);
    }
  } catch (err) {
    console.log(`  \x1b[31mError: ${err.message}\x1b[0m`);
    console.log(`  Make sure PoT Oracle is running at ${ORACLE_URL}`);
  }
  console.log();
}

async function analyze(wallet) {
  console.log(`\n  Analyzing: ${wallet}`);
  console.log(`  ${'─'.repeat(50)}`);

  try {
    const data = await httpGet(`${ORACLE_URL}/api/v1/score/${wallet}`);

    const score = data.off_chain?.score || 0;
    const color = score >= 70 ? '\x1b[32m' : score >= 40 ? '\x1b[33m' : '\x1b[31m';
    const components = data.off_chain?.components || {};

    console.log(`  Overall:    ${color}${score}/100\x1b[0m`);
    console.log(`  Status:     ${data.off_chain?.status || 'unknown'}`);
    console.log(`  On-chain:   ${data.on_chain?.verified ? '\x1b[32mVerified\x1b[0m' : '\x1b[31mNot verified\x1b[0m'}`);
    console.log(`  ML Model:   ${data.off_chain?.ml_enabled ? '\x1b[32mActive\x1b[0m' : '\x1b[33mInactive\x1b[0m'}`);
    console.log();

    if (Object.keys(components).length > 0) {
      console.log(`  Components:`);
      for (const [name, comp] of Object.entries(components)) {
        const s = comp.score || 0;
        const bars = '█'.repeat(Math.floor(s / 10)) + '░'.repeat(10 - Math.floor(s / 10));
        const c = s >= 70 ? '\x1b[32m' : s >= 40 ? '\x1b[33m' : '\x1b[31m';
        console.log(`    ${(labels[name] || name).padEnd(18)} ${bars} ${c}${s}/100\x1b[0m`);
      }
    } else {
      console.log(`  No component data available. Submit more heartbeats.`);
    }
  } catch (err) {
    console.log(`  \x1b[31mError: ${err.message}\x1b[0m`);
  }
  console.log();
}

const labels = {
  time_entropy: 'Time Entropy',
  response_time: 'Response Time',
  decision_pattern: 'Decision Pattern',
  data_access: 'Data Access',
  ml_classifier: 'ML Classifier',
};

main().catch(console.error);
