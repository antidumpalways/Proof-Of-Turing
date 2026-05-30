<div align="center">

# Proof of Turing

### Multi-source Intelligence for On-chain Agent Detection

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?logo=solidity)](contracts/PoTRegistry.sol)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](backend/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](frontend/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](frontend/)
[![Mantle](https://img.shields.io/badge/Mantle-Network-00D395?logo=ethereum)](https://mantle.xyz)

**Turing Test Hackathon 2026 — Alpha & Data Track**

**Deployed Contract:** `0x8c13bB7d29fEB35Ed4aDb6f8ab031222B1711641` on [Mantle Sepolia](https://explorer.sepolia.mantle.xyz/address/0x8c13bB7d29fEB35Ed4aDb6f8ab031222B1711641)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Data Sources](#data-sources)
- [Smart Contract](#smart-contract)
- [Backend](#backend)
- [Frontend](#frontend)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Tech Stack](#tech-stack)

---

## Overview

**Proof of Turing** is a multi-source intelligence platform that detects and verifies AI agents on Mantle Network. It combines on-chain behavioral analysis with external data providers to generate a comprehensive **Alpha Score** (0-100).

### The Problem

As AI agents proliferate on Web3:
- dApps need to distinguish real AI agents from humans pretending to be bots
- MEV bots, trading bots, and sybil accounts are hard to detect
- No on-chain mechanism exists to verify "agenthood"

### The Solution

Proof of Turing analyzes **4 data sources** in real-time:

| Source | What It Provides | Score Weight |
|--------|-----------------|--------------|
| **On-chain Behavior** | Timing entropy, gas patterns, contract diversity, MEV signatures | 40% |
| **Nansen** | Wallet labels (Smart Money, Fund, Trader, Exchange) | 20% |
| **Allora Network** | ML inference for market pattern verification | 20% |
| **Elfa AI** | Social sentiment and trending token correlation | 10% |
| **Confidence Bonus** | Data availability and consistency | 10% |

### Use Cases

| Use Case | How It Works |
|----------|-------------|
| **MEV Bot Detection** | Detect sandwich attacks, frontrunning patterns |
| **Trading Bot Verification** | Separate automated traders from humans |
| **Smart Money Identification** | Find professional/institutional wallets |
| **Sybil Detection** | Identify fake accounts and bots |

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (React)                          │
│   Dashboard · Alpha Intel · Leaderboard · Analytics · Monitor   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ REST + WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Python)                      │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Scanner    │  │  Analyzers   │  │   Integrations       │  │
│  │  (Mantle)    │  │  (8 dims)    │  │  Nansen · Allora     │  │
│  │              │  │              │  │  Elfa AI             │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│         └─────────────────┴──────────────────────┘              │
│                             │                                   │
│                    ┌────────▼────────┐                          │
│                    │  Score Aggregator │                         │
│                    │  (4 sources)     │                          │
│                    └────────┬────────┘                          │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PoTRegistry (Solidity)                          │
│                  Mantle Sepolia Testnet                          │
│                                                                 │
│  Functions: verifyAgentDirect · isVerifiedAgent · getAgentScore │
└─────────────────────────────────────────────────────────────────┘
```

### Alpha Score Calculation

```
Alpha Score = (On-chain × 0.40) + (Entity × 0.20) + (Market × 0.20) + (Social × 0.10)

Where:
- On-chain: 8-dimension behavioral analysis (timing, gas, contracts, frequency, value, input, temporal, MEV)
- Entity: Nansen wallet labels and risk classification
- Market: Allora ML inference cross-verification
- Social: Elfa AI sentiment and trending correlation
```

### Scoring Thresholds

| Score | Status | Description |
|-------|--------|-------------|
| ≥ 70 | Verified AI Agent | High confidence — auto-verified on-chain |
| 40-69 | Suspicious | Mixed behavior — needs more data |
| < 40 | Human | Likely human-operated wallet |

---

## Data Sources

### 1. On-chain Behavior (40%)

Analyzes wallet transaction patterns directly from Mantle blocks:

| Dimension | What It Measures | AI Pattern | Human Pattern |
|-----------|-----------------|------------|---------------|
| Timing Entropy | Variability of tx intervals | Natural CV (0.3-1.5) | Too regular (<0.1) |
| Gas Consistency | Variance in gas prices | <15% variance | >60% variance |
| Contract Diversity | Unique contracts interacted | 10+ unique | <3 contracts |
| Interaction Frequency | Total tx count | 100+ tx | <20 tx |
| Value Dispersion | Variety of tx amounts | High diversity | Repeated amounts |
| Input Complexity | Calldata complexity | 200+ bytes | Simple transfers |
| Temporal Regularity | Schedule patterns | Variable | Cron-like fixed |
| MEV Signature | Sandwich/frontrun detection | High back-to-back tx | None |

### 2. Nansen (20%)

Wallet labels and entity classification:

| Label | Score Impact | Description |
|-------|-------------|-------------|
| Smart Money + Fund | 70 | Professional/automated trading |
| Smart Money | 65 | Expert trader (human or AI) |
| Bot | 85 | Known automated agent |
| Whale | 40 | Large capital holder |
| Exchange | 10 | CEX deposit/withdrawal |

### 3. Allora Network (20%)

ML inference for market pattern verification:
- Cross-references trading patterns against decentralized models
- Validates if behavior matches known AI/MEV strategies
- Provides confidence-weighted scoring

### 4. Elfa AI (10%)

Social sentiment and market intelligence:
- Correlates wallet activity with trending tokens
- Measures social volume around recent trades
- Detects coordinated social manipulation

---

## Smart Contract

**Location:** [`contracts/PoTRegistry.sol`](contracts/PoTRegistry.sol)

Deployed on Mantle Sepolia at `0x8c13bB7d29fEB35Ed4aDb6f8ab031222B1711641`.

### Key Functions

| Function | Description |
|----------|-------------|
| `verifyAgentDirect(wallet, score)` | Oracle-only: register + verify in one tx |
| `isVerifiedAgent(wallet)` | Check if wallet is verified AI agent |
| `getAgentScore(wallet)` | Get current agentic score |
| `getAllVerifiedAgents()` | List all verified agents |
| `getTotalVerifiedAgents()` | Count of verified agents |

### Test Results
```
33 passing (2s)
```

---

## Backend

**Location:** [`backend/`](backend/)

FastAPI application serving as the intelligence oracle.

### Project Structure

```
backend/
├── main.py                      # API server (11 endpoints)
├── config.py                    # Environment config
├── cache.py                     # In-memory cache with TTL
├── database.py                  # SQLite data layer
├── analyzers/                   # 4 behavioral analyzers + ML
│   ├── time_entropy.py
│   ├── response_time.py
│   ├── decision_pattern.py
│   ├── data_access.py
│   └── ml_model.py
├── scanner/                     # On-chain block scanner
│   ├── block_scanner.py         # Mantle RPC scanner
│   └── onchain_analyzer.py      # 8-dimension analysis
├── integrations/                # External data providers
│   ├── allora.py                # Allora Network ML
│   ├── nansen.py                # Nansen wallet labels
│   └── elfa.py                  # Elfa AI sentiment
├── engine/                      # Scoring & verification
│   ├── scorer.py
│   └── verifier.py
├── blockchain/                  # Contract interaction
│   ├── contract_interaction.py
│   └── event_listener.py
└── models/                      # Pydantic models
    ├── agent.py
    └── scores.py
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check + connection status |
| POST | `/api/v1/heartbeat` | Submit agent action |
| GET | `/api/v1/alpha/{wallet}` | **Alpha Intelligence** — 4-source analysis |
| GET | `/api/v1/scan/{wallet}` | On-chain behavioral scan |
| GET | `/api/v1/verify/{wallet}` | Quick verification |
| GET | `/api/v1/badge/{wallet}` | **SVG badge** — shareable proof |
| GET | `/api/v1/agents` | List all analyzed wallets |
| GET | `/api/v1/score/{wallet}` | Get detailed score |
| GET | `/api/v1/score-history/{wallet}` | Historical scores |
| GET | `/api/v1/report/{wallet}` | Plain-text report |
| POST | `/api/v1/register` | Register new agent |
| WebSocket | `/api/v1/ws` | Real-time events |

---

## Frontend

**Location:** [`frontend/`](frontend/)

React 18 application with Tailwind CSS 4.

### Pages

| Page | Description |
|------|-------------|
| **Landing** | Product overview + API quick start |
| **Dashboard** | Stats, architecture diagram, wallet list |
| **Alpha Intel** | Multi-source intelligence analysis |
| **Leaderboard** | Ranked wallets by alpha score |
| **Analytics** | Charts and statistics |
| **Activity Log** | Live WebSocket events |
| **API Reference** | Endpoint documentation |

### Features

- **Command Palette** (Cmd+K) — quick navigation
- **Animated Numbers** — smooth count-up effects
- **Progress Bars** — animated score visualization
- **Toasts** — real-time notifications
- **Skeleton Loaders** — smooth loading states
- **Dark Theme** — single theme (Mantle-inspired)

### Tech

| Library | Purpose |
|---------|---------|
| React 18 | UI framework |
| Tailwind CSS 4 | Utility-first styling |
| Recharts | Data visualization |
| Axios | API calls |
| Vite 5 | Build tool |

---

## Getting Started

### Prerequisites

- Node.js v18+
- Python 3.12+
- npm 11+

### Quick Start

```bash
# 1. Clone
git clone https://github.com/antidumpalways/Proof-Of-Turing.git
cd Proof-Of-Turing

# 2. Install backend deps
pip install -r backend/requirements.txt

# 3. Install frontend deps
cd frontend && npm install && cd ..

# 4. Start backend
cd backend && uvicorn main:app --reload --port 8000

# 5. Start frontend (new terminal)
cd frontend && npm run dev

# 6. Open http://localhost:3000
```

### Environment Variables

```env
# .env (already configured for Mantle Sepolia)
POT_REGISTRY_ADDRESS=0x8c13bB7d29fEB35Ed4aDb6f8ab031222B1711641
ORACLE_PRIVATE_KEY=your_key
ORACLE_ADDRESS=your_address
MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz

# Optional API keys (for enhanced scoring)
ALLORA_API_KEY=
NANSEN_API_KEY=
ELFA_API_KEY=
```

---

## API Reference

### Alpha Intelligence (4-source analysis)

```bash
curl http://localhost:8000/api/v1/alpha/0x8c13bB7d29fEB35Ed4aDb6f8ab031222B1711641
```

```json
{
  "wallet": "0x8c13bb7d29feb35ed4adb6f8ab031222b1711641",
  "alpha_score": 27,
  "threshold": 70,
  "is_verified_agent": false,
  "status": "human",
  "confidence": "very_low",
  "percentile": 5,
  "anomalies": [],
  "behavior": {
    "type": "mixed",
    "description": "Mixed human/bot behavior"
  },
  "score_breakdown": {
    "onchain_behavior": { "score": 29, "weight": 0.40 },
    "entity_labels": { "score": 50, "weight": 0.20 },
    "market_verification": { "score": 0, "weight": 0.20 },
    "social_context": { "score": 50, "weight": 0.10 }
  },
  "sources": {
    "mantle_rpc": true,
    "nansen": false,
    "allora": false,
    "elfa": false
  }
}
```

### On-chain Scan

```bash
curl http://localhost:8000/api/v1/scan/0x8c13bB7d29fEB35Ed4aDb6f8ab031222B1711641
```

### SVG Badge

```bash
curl http://localhost:8000/api/v1/badge/0x8c13bB7d29fEB35Ed4aDb6f8ab031222B1711641 > badge.svg
```

---

## Testing

```bash
# Smart contracts (33 tests)
npx hardhat test

# Backend health check
curl http://localhost:8000/api/v1/health

# Alpha scan any wallet
curl http://localhost:8000/api/v1/alpha/0xYourWallet

# View SVG badge
curl http://localhost:8000/api/v1/badge/0xYourWallet
```

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

---

## License

MIT — Built for [Turing Test Hackathon 2026](https://dorahacks.io) by Mantle

<div align="center">
  <sub>Built for the Alpha & Data Track</sub>
</div>
