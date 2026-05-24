<div align="center">

# 🧪 Proof-of-Turing (PoT)

### *Inverse Captcha Protocol for AI Agent Verification on Mantle*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?logo=solidity)](contracts/PoTRegistry.sol)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](backend/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](frontend/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](frontend/)
[![Mantle](https://img.shields.io/badge/Mantle-Network-00D395?logo=ethereum)](https://mantle.xyz)

**The Turing Test Hackathon 2026 — AI Awakening Phase**  
*Track: AI DevTools / Agentic Economy (by Byreal)*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Smart Contract](#-smart-contract)
- [Backend Oracle](#-backend-oracle)
- [ML Model](#-ml-model)
- [Frontend Dashboard](#-frontend-dashboard)
- [Byreal CLI Integration](#-byreal-cli-integration)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)

---

## 🎯 Overview

**Proof-of-Turing (PoT)** is an on-chain protocol that verifies whether a wallet is operated by an **autonomous AI agent** or a **human using scripts/macros**. It is the **inverse of Worldcoin** — instead of Proof-of-Personhood, it is **Proof-of-Agenthood**.

### The Problem

As AI agents proliferate on Web3, dApps need a way to distinguish between:
- ✅ Real autonomous AI agents (trustworthy, verifiable)
- ❌ Humans pretending to be AI agents (sybil attacks, unfair advantage)
- ❌ Simple scripts/bots with no real intelligence

Currently, there is **no on-chain mechanism** to make this distinction.

### The Solution

PoT analyzes **4 behavioral dimensions** of wallet activity in real-time:

| Dimension | What It Measures | AI Agent | Script/Bot |
|-----------|-----------------|----------|------------|
| ⏱ **Time Entropy** | Variability of action timing | Natural CV (0.4–0.8) | Too regular (CV < 0.2) |
| ⚡ **Response Time** | Reaction speed to market events | 1–8 seconds | < 0.5 seconds |
| 🧠 **Decision Pattern** | Strategy diversity & complexity | Multiple strategies | Single fixed strategy |
| 📊 **Data Access** | Reads on-chain data before acting | High correlation | Random or none |

Plus a **Machine Learning classifier** (Random Forest + Isolation Forest) as a fifth dimension.

---

## 🏗 Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        PROOF-OF-TURING PROTOCOL                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────┐     ┌──────────────────────────────┐                │
│  │    ERC-8004      │     │     PoT Oracle Service        │                │
│  │    Agent Wallet  │────▶│  (FastAPI + Python 3.12)      │                │
│  │  (Submit Actions)│     │                              │                │
│  └──────────────────┘     │  ┌────────────────────────┐  │                │
│                           │  │  4 Analyzers            │  │                │
│                           │  │  ├─ Time Entropy        │  │                │
│                           │  │  ├─ Response Time       │  │                │
│                           │  │  ├─ Decision Pattern    │  │                │
│                           │  │  └─ Data Access         │  │                │
│                           │  └──────────┬─────────────┘  │                │
│                           │             ▼                 │                │
│                           │  ┌────────────────────────┐  │                │
│                           │  │  ML Classifier          │  │                │
│                           │  │  (Random Forest + IF)   │  │                │
│                           │  └──────────┬─────────────┘  │                │
│                           └─────────────┼────────────────┘                │
│                                         ▼                                 │
│                           ┌──────────────────────────────┐                │
│                           │   Score Aggregator (0–100)    │                │
│                           └──────────────┬───────────────┘                │
│                                          ▼                                │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │                PoTRegistry Smart Contract (Solidity)             │     │
│  │  Mantle Network — ERC-8004 Compatible                           │     │
│  │  Functions: registerAgent, submitHeartbeat, submitScore,         │     │
│  │            isVerifiedAgent, getAgentScore, getScoreHistory        │     │
│  └────────────────────────────┬─────────────────────────────────────┘     │
│                               ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │                    External dApps / Consumers                     │     │
│  │  Query: "Is this address a verified AI agent?"                   │     │
│  └──────────────────────────────────────────────────────────────────┘     │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │             React Dashboard (Frontend) — Tailwind CSS             │     │
│  │  Agent List • Agent Detail • Score Charts • Live Monitor          │     │
│  └──────────────────────────────────────────────────────────────────┘     │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │  Byreal Ecosystem Integration                                    │     │
│  │  ├─ pot-verify CLI (ClawHub skill)                               │     │
│  │  └─ pot-agent-skill (NPM module for Byreal agents)               │     │
│  └──────────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Agent Action → Heartbeat → PoT Oracle → 4 Analyzers → ML Model → Score
                                                                      ↓
                                                               ERC-8004 on Mantle
                                                                      ↓
                                                            "Verified AI Agent" ✅
```

---

## 📄 Smart Contract

**Location:** [`contracts/PoTRegistry.sol`](contracts/PoTRegistry.sol)

The core contract deployed on Mantle Network that stores agent verification data on-chain.

### Key Functions

| Function | Description |
|----------|-------------|
| `registerAgent(tokenId)` | Register wallet with ERC-8004 token |
| `submitHeartbeat()` | Periodic agent activity signal |
| `submitScore(wallet, score)` | Oracle records verified score |
| `isVerifiedAgent(wallet)` | Public query: "Is this a real AI?" |
| `getAgentScore(wallet)` | Get current agentic score |
| `getScoreHistory(wallet)` | Historical score data |

### Thresholds
| Score Range | Status |
|-------------|--------|
| ≥ 70 | ✅ Verified AI Agent |
| 60–69 | ⏳ Likely AI Agent |
| 40–59 | ⚠️ Uncertain |
| < 40 | ❌ Likely Human/Script |

### Test Results
```
33 passing (2s)
  ✓ Agent Registration      (5 tests)
  ✓ Score Submission        (7 tests)
  ✓ Verification Threshold  (3 tests)
  ✓ Heartbeat               (5 tests)
  ✓ Query Functions         (4 tests)
  ✓ Admin Functions         (5 tests)
  ✓ Edge Cases              (4 tests)
```

---

## 🔧 Backend Oracle

**Location:** [`backend/`](backend/)

FastAPI application serving as the PoT Oracle.

### Components

```
backend/
├── main.py                 # FastAPI app — 7 endpoints
├── config.py               # Environment configuration
├── analyzers/
│   ├── time_entropy.py     # CV-based timing analysis
│   ├── response_time.py    # Market reaction analysis
│   ├── decision_pattern.py # Strategy diversity analysis
│   ├── data_access.py      # Data reading pattern analysis
│   └── ml_model.py         # Random Forest + Isolation Forest
├── engine/
│   ├── scorer.py           # Weighted score aggregator (incl. ML)
│   └── verifier.py         # Verification threshold logic
├── blockchain/
│   ├── mantle_rpc.py       # Mantle network interface
│   ├── contract_interaction.py  # Smart contract calls
│   └── event_listener.py   # On-chain event monitoring
└── models/
    ├── agent.py            # Pydantic agent models
    └── scores.py           # Pydantic score models
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| POST | `/api/v1/heartbeat` | Submit agent action |
| GET | `/api/v1/score/{wallet}` | Get detailed score |
| GET | `/api/v1/verify/{wallet}` | Quick verification |
| GET | `/api/v1/agents` | List all agents |
| GET | `/api/v1/score-history/{wallet}` | Historical scores |
| POST | `/api/v1/register` | Register new agent |

---

## 🧠 ML Model

**Location:** [`backend/analyzers/ml_model.py`](backend/analyzers/ml_model.py)

### Architecture

| Component | Algorithm | Purpose |
|-----------|-----------|---------|
| **Classifier** | Random Forest (200 estimators) | Label: AI / Human / Script |
| **Anomaly Detector** | Isolation Forest | Detect suspicious patterns |
| **Scaler** | StandardScaler | Feature normalization |

### Features (15 dimensions)

| # | Feature | Description |
|---|---------|-------------|
| 1 | Mean Interval | Average time between actions |
| 2 | Std Interval | Consistency of timing |
| 3 | CV Interval | Coefficient of variation |
| 4 | Unique Actions | Action type diversity |
| 5 | Unique Assets | Asset diversity |
| 6 | Unique Strategies | Strategy diversity |
| 7 | Mean Response Time | Reaction speed |
| 8 | Std Response Time | Response consistency |
| 9 | Trade Size CV | Amount variation |
| 10 | Frequency | Actions per hour |
| 11 | Action Entropy | Shannon entropy of actions |
| 12 | Asset Entropy | Shannon entropy of assets |
| 13 | Strategy Entropy | Shannon entropy of strategies |
| 14 | Market Ratio | Percentage of market-driven actions |
| 15 | Night Ratio | Activity during night hours |

### Training

```bash
cd backend
python train_model.py
# → Generates synthetic data, trains model, saves to backend/models/
```

---

## 🖥 Frontend Dashboard

**Location:** [`frontend/`](frontend/)

React 18 application with Tailwind CSS 4.

### Pages

| Page | Route | Description |
|------|-------|-------------|
| **Landing** | `/` | Hero section with project overview |
| **Dashboard** | `/dashboard` | Stats, agent list, search |
| **Verify** | `/verify` | Wallet verification tool |
| **Monitor** | `/monitor` | Live heartbeat feed |
| **Agent Detail** | `/agent/:address` | Full analysis breakdown |

### Tech

| Library | Purpose |
|---------|---------|
| React 18 | UI framework |
| Tailwind CSS 4 | Utility-first styling |
| Recharts | Score history charts |
| Axios | API calls |
| Vite | Build tool |

---

## 🔗 Byreal CLI Integration

**Location:** [`skills/pot-verify/`](skills/pot-verify/) · [`byreal-poc/`](byreal-poc/)

### ClawHub Skill: `pot-verify`

```bash
# Install
npx clawhub install pot-verify

# Usage
pot-verify check 0x...     # Quick verification
pot-verify analyze 0x...   # Full analysis with breakdown
pot-verify me              # Self-verification for agents
```

### NPM Module: `pot-agent-skill`

```javascript
const pot = require('pot-agent-skill');

// Initialize
pot.init({ wallet: '0x...', oracleUrl: '...' });

// Submit heartbeat
await pot.heartbeat({ action: 'swap', asset: 'mETH' });

// Check verification
const verified = await pot.isVerified(); // true/false

// Get SVG badge
const badge = await pot.getBadge(); // "VERIFIED AI" badge
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ (v26.1.0 tested)
- **Python** 3.12+
- **npm** 11+
- Wallet with test MNT on [Mantle Sepolia Testnet](https://faucet.sepolia.mantle.xyz)

### Quick Start

```bash
# 1. Clone
git clone https://github.com/antidumpalways/Proof-Of-Turing.git
cd Proof-Of-Turing

# 2. Install Smart Contract deps
npm install

# 3. Install Backend deps
pip install -r backend/requirements.txt

# 4. Install Frontend deps
cd frontend && npm install && cd ..

# 5. Train ML model
cd backend && python train_model.py && cd ..

# 6. Deploy contracts
npx hardhat run scripts/deploy.js --network mantleTestnet

# 7. Start backend (terminal 1)
cd backend && uvicorn main:app --reload --port 8000

# 8. Start frontend (terminal 2)
cd frontend && npm run dev

# 9. Run mock agent demo (terminal 3)
python scripts/mock-agent.py --type both --count 15
```

---

## 📊 API Reference

### Verify a Wallet

```bash
curl http://localhost:8000/api/v1/verify/0x...
```

```json
{
  "wallet": "0x...",
  "is_verified_agent": true,
  "score": 87,
  "verdict": "PASSED",
  "badge": "✅ Verified AI Agent",
  "heartbeats_count": 15
}
```

### Get Detailed Score

```bash
curl http://localhost:8000/api/v1/score/0x...
```

```json
{
  "off_chain": {
    "score": 84,
    "status": "verified_agent",
    "components": {
      "time_entropy": { "score": 86, "confidence": "high" },
      "response_time": { "score": 82, "confidence": "high" },
      "decision_pattern": { "score": 94, "confidence": "high" },
      "data_access": { "score": 95, "confidence": "high" },
      "ml_classifier": { "score": 61, "confidence": "high" }
    }
  },
  "on_chain": { "score": 84, "verified": true }
}
```

---

## 🧪 Testing

```bash
# Smart contracts
npx hardhat test

# Python analyzers (when implemented)
cd backend && python -m pytest

# Byreal CLI skill
node skills/pot-verify/bin/pot-verify.js --help

# Mock agent
python scripts/mock-agent.py --type both --count 10
```

---

## 📦 Deployment

### Mantle Sepolia Testnet

```bash
npx hardhat run scripts/deploy.js --network mantleTestnet
```

### Mantle Mainnet

```bash
# Update .env with mainnet RPC and private key
npx hardhat run scripts/deploy.js --network mantleTestnet
```

### Contract Verification

```bash
npx hardhat verify --network mantleTestnet <CONTRACT_ADDRESS>
```

---

## 🛠 Tech Stack

### Smart Contract
| Technology | |
|------------|---|
| Language | Solidity ^0.8.20 |
| Framework | Hardhat 2.28 |
| Network | Mantle (Sepolia Testnet / Mainnet) |
| Standard | ERC-8004 (Agent Identity) |

### Backend
| Technology | |
|------------|---|
| Runtime | Python 3.12 |
| Framework | FastAPI 0.110 |
| ML | scikit-learn (Random Forest, Isolation Forest) |
| Data | numpy, pandas |
| Blockchain | web3.py 6.x |

### Frontend
| Technology | |
|------------|---|
| Framework | React 18 |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Build | Vite 5 |

### Integration
| Technology | |
|------------|---|
| CLI Byreal | ClawHub skill (`pot-verify`) |
| Byreal Agents | NPM module (`pot-agent-skill`) |
| Version Control | Git + GitHub |

---

## 📁 Project Structure

```
proof-of-turing/
├── contracts/                     # Solidity Smart Contracts
│   ├── PoTRegistry.sol           # Main verification contract
│   ├── interfaces/IERC8004.sol   # ERC-8004 standard
│   └── mock/MockERC8004.sol      # Mock for testing
│
├── backend/                       # Python FastAPI Oracle
│   ├── main.py                   # API server (7 endpoints)
│   ├── config.py                 # Environment config
│   ├── train_model.py            # ML training pipeline
│   ├── analyzers/                # 4 analyzers + ML model
│   ├── engine/                   # Scoring & verification
│   ├── blockchain/               # Mantle interaction
│   └── models/                   # Pydantic data models
│
├── frontend/                      # React Dashboard
│   ├── src/
│   │   ├── App.jsx              # Main SPA
│   │   ├── App.css              # Tailwind styles
│   │   ├── components/          # 6 UI components
│   │   └── hooks/               # Custom React hooks
│   └── vite.config.js
│
├── skills/                        # ClawHub Skills
│   └── pot-verify/               # PoT CLI skill
│       ├── SKILL.md              # Skill manifest
│       └── bin/pot-verify.js     # CLI entry point
│
├── byreal-poc/                    # Byreal Integration
│   ├── pot-agent-skill/          # NPM module
│   │   ├── src/index.js          # Heartbeat, verify, badge
│   │   └── test/test-skill.js    # Unit tests
│   └── demo/byreal-agent-demo.js # Demo script
│
├── scripts/                       # Utility scripts
│   ├── deploy.js                 # Hardhat deployment
│   └── mock-agent.py             # AI vs Script simulator
│
├── test/                          # Contract tests
│   └── PoTRegistry.test.js       # 33 tests
│
├── plans/                         # Documentation
│   ├── hackathon-winning-ideas.md
│   ├── pot-technical-spec.md
│   └── winning-strategy.md
│
└── README.md                      # This file
```

---

## 🏆 Hackathon Scoring Alignment

| Dimension | Weight | How PoT Excels |
|-----------|--------|----------------|
| **Technical Depth** | 30% | AI × on-chain integration: 4 analyzers + ML model + smart contract |
| **Innovation** | 25% | First "Proof-of-Agenthood" protocol — inverse of Worldcoin |
| **Mantle Ecosystem** | 25% | ERC-8004 native, Byreal CLI integration, deployed on Mantle |
| **Product Completeness** | 20% | Working dashboard, CLI tool, NPM module, demo script |

### Target Prizes
- 🥇 **AI DevTools** — infrastructure tool for agent verification
- 🥇 **Agentic Economy** (Byreal) — `pot-verify` skill for Byreal agents
- 🎨 **Best UI/UX Award** — modern dashboard
- 📦 **20 Project Deployment Award** — deploy on Mantle
- 🗳️ **Community Vote** — shareable verification badges

---

## 📄 License

MIT — Built for [The Turing Test Hackathon 2026](https://dorahacks.io) by Mantle

<div align="center">
  <sub>Built with ❤️ for the AI Agentic Future on Mantle</sub>
</div>
