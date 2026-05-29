#!/usr/bin/env node

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
    }).on('error', () => {
      reject(new Error(`Connection refused — is PoT Oracle running at ${ORACLE_URL}?`));
    });
  });
}

function httpPost(path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, ORACLE_URL);
    const lib = url.protocol === 'https:' ? https : http;
    const payload = JSON.stringify(body);
    const req = lib.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid JSON response')); }
      });
    });
    req.on('error', () => reject(new Error(`Connection refused — is PoT Oracle running at ${ORACLE_URL}?`)));
    req.write(payload);
    req.end();
  });
}

async function main() {
  const cmd = process.argv[2];
  const arg = process.argv[3];

  if (!cmd || cmd === '--help' || cmd === '-h') {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║     Proof-of-Turing — pot-verify CLI     ║
  ╚══════════════════════════════════════════╝

  Usage:
    pot-verify check <wallet>       Quick verification check
    pot-verify analyze <wallet>     Full behavioral analysis
    pot-verify me [wallet]          Self-verification
    pot-verify heartbeat <wallet>   Submit a test heartbeat
    pot-verify report <wallet>      Download verification report
    pot-verify --help               Show this help

  Environment:
    POT_ORACLE_URL  Oracle endpoint (default: http://localhost:8000)
    POT_WALLET      Default wallet for 'me' command
    `);
    return;
  }

  try {
    if (cmd === 'check' && arg) {
      await check(arg);
    } else if (cmd === 'analyze' && arg) {
      await analyze(arg);
    } else if (cmd === 'me') {
      const wallet = arg || process.env.POT_WALLET;
      if (!wallet) {
        console.log('\n  Provide a wallet: pot-verify me 0x...  or set POT_WALLET\n');
        return;
      }
      await check(wallet);
    } else if (cmd === 'heartbeat' && arg) {
      await heartbeat(arg);
    } else if (cmd === 'report' && arg) {
      await report(arg);
    } else {
      console.log(`Unknown: ${cmd}. Use pot-verify --help`);
    }
  } catch (err) {
    console.log(`  \x1b[31mError: ${err.message}\x1b[0m`);
  }
}

async function check(wallet) {
  console.log(`\n  Checking: ${wallet}`);
  console.log(`  ${'─'.repeat(50)}`);
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
  console.log();
}

async function analyze(wallet) {
  console.log(`\n  Analyzing: ${wallet}`);
  console.log(`  ${'─'.repeat(50)}`);
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
    console.log(`  No component data available.`);
  }
  console.log();
}

async function heartbeat(wallet) {
  console.log(`\n  Submitting test heartbeat for: ${wallet}`);
  console.log(`  ${'─'.repeat(50)}`);
  const payload = {
    wallet: wallet,
    timestamp: Math.floor(Date.now() / 1000),
    action: 'check_balance',
    asset: 'MNT',
    amount: 0,
  };
  const data = await httpPost(`${ORACLE_URL}/api/v1/heartbeat`, payload);
  console.log(`  Status:     ${data.status || 'processed'}`);
  console.log(`  Heartbeats: ${data.heartbeats_count || 0}`);
  console.log(`  Score:      ${data.analysis?.overall_score || 0}/100`);
  console.log();
}

async function report(wallet) {
  console.log(`\n  Generating report for: ${wallet}`);
  console.log(`  ${'─'.repeat(50)}`);
  const url = `${ORACLE_URL}/api/v1/report/${wallet}`;
  console.log(`  Report URL: ${url}`);
  console.log(`  Open in browser or curl to download.\n`);
}

const labels = {
  time_entropy: 'Time Entropy',
  response_time: 'Response Time',
  decision_pattern: 'Decision Pattern',
  data_access: 'Data Access',
  ml_classifier: 'ML Classifier',
};

main().catch(console.error);
