<div align="center">

# Tripwire

### Where the Wire Snaps First — Trust & Policy Enforcement for the AI Agent Economy

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?logo=solidity)](contracts/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](backend/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](frontend/)
[![Mantle](https://img.shields.io/badge/Mantle-Network-00D395?logo=ethereum)](https://mantle.xyz)

**Turing Test Hackathon 2026**
**Tracks: Grand Champion | Agentic Economy | Alpha & Data | Best UI/UX**

</div>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
- [Backend](#backend)
- [Frontend](#frontend)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Tracks & Awards](#tracks--awards)
- [Tech Stack](#tech-stack)

---

## Overview

### The Problem

As AI agents proliferate on Web3, users face a critical trust gap:

- **The Delegation Paradox:** Users want automation but fear giving agents full control over their assets
- **Auditability Gap:** No standard way to verify if an agent's off-chain "reasoning" matches its on-chain actions
- **Reputation Fragmentation:** New agents lack a neutral platform to prove their reliability

### The Solution

Tripwire is a trip-line defense layer for the AI agent economy on Mantle — the moment an agent's behavior crosses a red line, the wire snaps and the alarm fires. Tripwire introduces a three-pillar architecture:

| Pillar | Description |
|--------|-------------|
| **GuardVault** | Programmable guardrails — users set spending limits, protocol whitelists, slippage protection |
| **Behavioral Attestation** | Oracle-based verification — every transaction validated against policies |
| **RepScore** | Dynamic reputation scoring — compliance, ROI, community rating, liveliness |

### RepScore Formula

```
RepScore = (Compliance Rate x 0.4) + (Performance ROI x 0.3) + 
           (Community Rating x 0.2) + (Liveliness x 0.1)
```

### Insurance Fund

Agents stake MNT as collateral. If they violate policies, stakes are slashed to compensate affected users — creating economic incentives for good behavior.

---

## Architecture

### System Overview

```
+-------------------------------------------------------------+
|                  Tripwire Dashboard (React)                 |
|  Policy Designer - Trust Dashboard - Threat Monitor        |
+-----------------------------+-------------------------------+
                              | REST + WebSocket
                              v
+-------------------------------------------------------------+
|                 Tripwire Oracle (FastAPI)                   |
|                                                             |
|  +--------------+ +--------------+ +------------------+   |
|  | Compliance   | | Risk Engine  | | Behavioral       |   |
|  | Checker      | | (4 analyzer) | | Attestation      |   |
|  +------+-------+ +------+-------+ +--------+---------+   |
|         +----------------+------------------+              |
|                          v                                  |
|                   RepScore Engine                           |
+------------------------------+------------------------------+
                                |
                                v
+-------------------------------------------------------------+
|                  Tripwire Contracts (Solidity)              |
|                                                             |
|  GuardVault.sol - TripwireRegistry.sol - InsuranceFund     |
|  (Vault + Policy)  (Identity + Reputation)  (Staking)     |
+-------------------------------------------------------------+
```

---

## Smart Contracts

### GuardVault.sol

Programmable guardrails for AI agent asset management.

| Function | Description |
|----------|-------------|
| `createVault(agent)` | Create vault with policy engine |
| `deposit()` | User deposits assets into vault |
| `withdraw(amount)` | User withdraws assets |
| `executeWithPolicy(protocol, amount)` | Execute trade with policy validation |
| `setPolicy(maxTx, daily, slippage)` | Set spending limits |
| `setProtocolAllowance(protocol, allowed)` | Whitelist a DeFi protocol |

**Policies enforced:**
- Max transaction size
- Daily spending limit
- Slippage protection (basis points)
- Protocol whitelist

### TripwireRegistry.sol

Agent identity, reputation, and threat management.

| Function | Description |
|----------|-------------|
| `registerAgent(tokenId)` | Register agent with ERC-8004 |
| `submitRiskScore(wallet, score, level, type, details)` | Oracle submits risk assessment |
| `quarantineAgent(wallet, reason)` | Quarantine malicious agent |
| `unquarantineAgent(wallet)` | Release from quarantine |
| `getRepScore(wallet)` | Get reputation score |
| `getThreatHistory(wallet)` | Get threat event history |
| `getGuardStatus(wallet)` | Get guard status |

### InsuranceFund.sol

Staking and compensation mechanism.

| Function | Description |
|----------|-------------|
| `stakeAsAgent()` | Agent stakes MNT as collateral |
| `slashAgent(agent, amount, reason)` | Slash stake for violations |
| `claimCompensation(user, amount, reason)` | Compensate affected users |
| `getAgentStake(agent)` | Check agent's staked amount |
| `getPoolInfo()` | Pool statistics |

---

## Backend

### Risk Engine

4 behavioral analyzers + risk detection:

**Behavioral:**
| Analyzer | What It Detects |
|----------|----------------|
| Time Entropy | Timing patterns (AI vs human vs script) |
| Response Time | Market event reaction speed |
| Decision Pattern | Strategy diversity |
| Data Access | Data analysis behavior |

### Telegram Alerts

Real-time security notifications:

| Alert Type | Trigger |
|------------|---------|
| THREAT DETECTED | Risk score >= 80 |
| AGENT QUARANTINED | Auto-quarantine triggered |
| POLICY VIOLATION | Trade blocked by policy |
| COMPENSATION PAID | User compensated from insurance |

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check + on-chain stats |
| POST | `/api/v1/heartbeat` | Submit agent action |
| GET | `/api/v1/alpha/{wallet}` | 4-source alpha intelligence |
| GET | `/api/v1/scan/{wallet}` | On-chain behavioral scan |
| GET | `/api/v1/verify/{wallet}` | Quick verification |
| GET | `/api/v1/badge/{wallet}` | SVG badge generation |
| GET | `/api/v1/agents` | List all agents |
| GET | `/api/v1/score/{wallet}` | Get detailed score |
| GET | `/api/v1/guard-status/{wallet}` | **Guard status** |
| GET | `/api/v1/threats` | **List all threats** |
| GET | `/api/v1/threat-history/{wallet}` | **Threat history** |
| POST | `/api/v1/quarantine/{wallet}` | **Quarantine agent** |
| POST | `/api/v1/unquarantine/{wallet}` | **Release agent** |
| POST | `/api/v1/guard-policy` | **Set guard policy** |
| GET | `/api/v1/alerts` | **Security alerts** |
| WebSocket | `/api/v1/ws` | Real-time events |

---

## Frontend

### Pages

| Page | Description |
|------|-------------|
| **Landing** | Product overview + architecture |
| **Dashboard** | Stats + agent list + wallet lookup |
| **Trust Dashboard** | RepScore + risk score + threat history |
| **Policy Designer** | No-code policy configuration |
| **Threat Monitor** | Real-time security alerts |
| **Leaderboard** | Ranked wallets by RepScore + risk |
| **Insurance Fund** | Pool stats + claim log |
| **Activity Log** | Live WebSocket events |

### Features

- **Command Palette** (Cmd+K) — quick navigation
- **Animated Numbers** — smooth count-up effects
- **Progress Bars** — animated score visualization
- **Toasts** — real-time notifications
- **Dark Theme** — Mantle-inspired design

---

## Getting Started

### Prerequisites

- Node.js v18+
- Python 3.12+
- npm 11+

### Quick Start

```bash
# 1. Clone
git clone https://github.com/yourusername/tripwire.git
cd tripwire

# 2. Install backend deps
pip install -r backend/requirements.txt

# 3. Install frontend deps
cd frontend && npm install && cd ..

# 4. Train ML model
cd backend && python train_model.py && cd ..

# 5. Start backend
cd backend && uvicorn main:app --reload --port 8000

# 6. Start frontend (new terminal)
cd frontend && npm run dev

# 7. Open http://localhost:3000
```

### Environment Variables

```env
# .env
GUARD_REGISTRY_ADDRESS=0x...
GUARD_VAULT_ADDRESS=0x...
INSURANCE_FUND_ADDRESS=0x...
ORACLE_PRIVATE_KEY=your_key
ORACLE_ADDRESS=your_address
MANTLE_RPC_URL=https://rpc.mantle.xyz

# Telegram Alerts (optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TELEGRAM_ALERTS_ENABLED=false
```

### Deploy Contracts

```bash
# Deploy to Mantle Sepolia (testnet)
npx hardhat run scripts/deploy.js --network mantleTestnet

# Deploy to Mantle Mainnet
npx hardhat run scripts/deploy.js --network mantle

# Verify on explorer
npx hardhat verify --network mantleTestnet <CONTRACT_ADDRESS>
```

---

## Testing

```bash
# Smart contracts (74 tests)
npx hardhat test

# Backend health
curl http://localhost:8000/api/v1/health

# Tripwire status
curl http://localhost:8000/api/v1/guard-status/0xYourWallet

# View threats
curl http://localhost:8000/api/v1/threats

# View SVG badge
curl http://localhost:8000/api/v1/badge/0xYourWallet
```

---

## Tracks & Awards

| Track | Why Tripwire Wins |
|-------|-------------------|
| **Grand Champion** | Infrastructure project solving fundamental trust problem for entire Mantle ecosystem |
| **Agentic Economy (Byreal)** | Security layer for Byreal agents — verifies agent safety before execution |
| **Alpha & Data (Mirana)** | Verifiable agent performance data + 4-source intelligence analysis |
| **Best UI/UX** | Policy Designer (no-code) + Trust Dashboard + Threat Monitor |
| **Community Voting** | Consumer-friendly security tool with clear value proposition |
| **20 Project Deployment Award** | Deployed on Mantle with runnable demo |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contract** | Solidity ^0.8.20, Hardhat, Mantle |
| **Backend** | Python 3.12, FastAPI, web3.py |
| **ML** | scikit-learn, numpy, pandas |
| **Data Sources** | Nansen, Allora Network, Elfa AI |
| **Frontend** | React 18, Tailwind CSS 4, Vite 5 |
| **Database** | SQLite (WAL mode) |
| **Alerts** | Telegram Bot API |

---

## License

MIT — Built for [Turing Test Hackathon 2026](https://dorahacks.io) on Mantle Network

<div align="center">
  <sub>Where the wire snaps first — securing the AI Agent Economy on Mantle</sub>
</div>
