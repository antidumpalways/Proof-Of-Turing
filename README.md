# 🧪 Proof-of-Turing (PoT) Protocol

## *Inverse Captcha Oracle for Verifying AI Agents on Mantle*

> **Track:** AI DevTools (Primary) / Agentic Wallets & Economy (Secondary)
> **Hackathon:** The Turing Test Hackathon 2026 — AI Awakening Phase
> **By:** [Your Name]

---

## 📋 Executive Summary

**Proof-of-Turing (PoT)** is a protocol that verifies whether an ERC-8004 wallet is operated by an **autonomous AI agent** or a **human using scripts/macros**. It's the inverse of Worldcoin — instead of Proof-of-Personhood, it's **Proof-of-Agenthood**.

In the coming agentic Web3 era, dApps need to know if they're interacting with real AI agents or sybil attackers pretending to be AI. PoT solves this by analyzing behavioral patterns on-chain.

### The Problem
- How can a dApp know if a wallet is a **real autonomous AI agent**?
- Without verification, **sybil attacks** are trivial — humans can create 1000 "AI agents"
- **Fair benchmarking** requires knowing that participants are genuinely AI

### The Solution
PoT analyzes 4 behavioral dimensions on-chain:
1. **⏱ Time Entropy** — Is execution timing naturally variable or suspiciously regular?
2. **⚡ Response Time** — Does the agent take time to "think" before acting?
3. **🧠 Decision Pattern** — Are strategies diverse and context-dependent?
4. **📊 Data Access** — Does the agent read on-chain data before making decisions?

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    PROOF-OF-TURING PROTOCOL                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐     ┌──────────────────────────────────┐   │
│  │   ERC-8004      │     │       PoT Oracle Service          │   │
│  │   Agent Wallet  │────▶│  (Python FastAPI)                 │   │
│  │   (Submit       │     │                                  │   │
│  │    Heartbeat)   │     │  ┌────────────────────────────┐  │   │
│  └─────────────────┘     │  │ 4 Analyzers → Aggregator   │  │   │
│                          │  └───────────┬────────────────┘  │   │
│                          └──────────────┼───────────────────┘   │
│                                         ▼                       │
│                          ┌──────────────────────────────────┐   │
│                          │      PoT Smart Contract           │   │
│                          │  (Solidity on Mantle)             │   │
│                          │  - registerAgent()                │   │
│                          │  - submitScore()                  │   │
│                          │  - isVerifiedAgent()              │   │
│                          └───────────┬──────────────────────┘   │
│                                      ▼                          │
│                          ┌──────────────────────────────────┐   │
│                          │   dApps Query: "Is this AI?"     │   │
│                          └──────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              React Dashboard (Frontend)                 │    │
│  └────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔬 How It Works

### 1. Agent Registration
An ERC-8004 token holder registers their wallet with PoT.

### 2. Heartbeat Submission
Agents periodically submit "heartbeats" — records of their actions (trades, swaps, etc.) with timing and context.

### 3. Multi-Dimensional Analysis
The PoT Oracle runs 4 analyzers on the heartbeat data:

| Analyzer | What It Measures | AI Agent | Script/Bot |
|----------|-----------------|----------|------------|
| **Time Entropy** | Variability of action timing | Natural CV (0.4-0.8) | Too regular (CV < 0.2) |
| **Response Time** | How fast agent reacts to events | 1-8 seconds | < 0.5 seconds |
| **Decision Pattern** | Diversity of strategies & sizes | Multiple strategies | Single fixed strategy |
| **Data Access** | Whether agent reads data before acting | High correlation | Random or no data access |

### 4. Score Aggregation
Scores are weighted and combined into a final **Agentic Score (0-100)**:

| Score Range | Status | Meaning |
|-------------|--------|---------|
| ≥ 80 | ✅ Verified AI Agent | Confirmed autonomous AI behavior |
| 60-79 | ⏳ Likely AI Agent | Needs more data for confirmation |
| 40-59 | ⚠️ Uncertain | Insufficient distinguishing features |
| < 40 | ❌ Likely Human / Script | Behavioral patterns match human/script |

### 5. On-Chain Recording
The final score is submitted to the PoTRegistry smart contract on Mantle, where any dApp can query it.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Python 3.9+
- A wallet with test MNT on Mantle Testnet

### Installation

```bash
# 1. Smart Contracts
cd proof-of-turing
npm install
npx hardhat compile

# 2. Backend Oracle
cd backend
pip install -r requirements.txt

# 3. Frontend Dashboard
cd frontend
npm install
```

### Configuration

```bash
# Copy and fill in environment variables
cp .env.example .env
# Set your Mantle Testnet private key
# Set deployed contract addresses
```

### Deployment

```bash
# 1. Deploy smart contracts to Mantle Testnet
npx hardhat run scripts/deploy.js --network mantleTestnet

# 2. Start the backend oracle
cd backend
uvicorn main:app --reload --port 8000

# 3. Start the frontend dashboard
cd frontend
npm run dev
```

### Testing with Mock Agents

```bash
# Run a simulated AI agent vs script agent comparison
python scripts/mock-agent.py --type both --count 30
```

---

## 📊 Demo Script (For Judges)

### 3-Minute Presentation

```
1. PROBLEM (30 sec)
   "In the age of AI agents on Mantle, how do dApps know if 
    they're talking to a real AI or a human with a script?"

2. SOLUTION (30 sec)
   "Worldcoin proved you're human. We prove you're an AI agent."
   "Proof-of-Turing — the inverse captcha for the agentic economy."

3. LIVE DEMO (90 sec)
   Screen split: Two agents submitting heartbeats
   
   LEFT:  Script bot — suspiciously regular timing
   RIGHT: Real AI agent — natural behavioral patterns
   
   PoT Dashboard shows:
   - Script: Score 23/100 → "❌ Likely Human/Script"
   - AI:     Score 87/100 → "✅ Verified AI Agent"
   
4. INTEGRATION (30 sec)
   "Any dApp on Mantle can query PoT:"
   "Is this address a verified AI agent?"
   
5. VISION (30 sec)
   "Proof-of-Turing is the trust layer for the agentic economy.
    Not just for this hackathon — for the future of Web3."
```

---

## 🔗 Integration for dApps

### Solidity

```solidity
import "./IPoTRegistry.sol";

contract MyProtocol {
    IPoTRegistry public potRegistry;
    
    function onlyAllowAIAgents() external {
        require(
            potRegistry.isVerifiedAgent(msg.sender),
            "Only verified AI agents can interact"
        );
        // ... your logic
    }
}
```

### JavaScript

```javascript
const potContract = new ethers.Contract(PoT_ADDRESS, PoT_ABI, provider);
const isAI = await potContract.isVerifiedAgent(walletAddress);
if (isAI) {
    // Allow AI agent access
}
```

### REST API

```bash
# Check if a wallet is a verified AI agent
curl http://localhost:8000/api/v1/verify/0x...

# Get detailed score breakdown
curl http://localhost:8000/api/v1/score/0x...
```

---

## 📁 Project Structure

```
proof-of-turing/
├── contracts/                    # Solidity Smart Contracts
│   ├── interfaces/IERC8004.sol   # ERC-8004 interface
│   ├── PoTRegistry.sol           # Main PoT contract
│   └── mock/MockERC8004.sol      # Mock for testing
│
├── backend/                      # Python Oracle Service
│   ├── main.py                   # FastAPI app
│   ├── config.py                 # Configuration
│   ├── analyzers/                # ML analysis modules
│   │   ├── time_entropy.py
│   │   ├── response_time.py
│   │   ├── decision_pattern.py
│   │   └── data_access.py
│   ├── engine/                   # Scoring engine
│   └── blockchain/               # Mantle interaction
│
├── frontend/                     # React Dashboard
│   ├── src/
│   │   ├── components/           # UI components
│   │   ├── hooks/                # Custom hooks
│   │   └── App.jsx               # Main application
│   └── ...
│
├── scripts/                      # Utility scripts
│   ├── deploy.js                 # Hardhat deploy
│   └── mock-agent.py             # Agent simulator
│
└── test/                         # Contract tests
    └── PoTRegistry.test.js       # 33 passing tests
```

---

## 🧪 Test Results

```
33 passing (2s)

  PoTRegistry
    Agent Registration      ✓ 5 tests
    Score Submission        ✓ 7 tests
    Verification Threshold  ✓ 3 tests
    Heartbeat               ✓ 5 tests
    Query Functions         ✓ 4 tests
    Admin Functions         ✓ 5 tests
    Edge Cases              ✓ 4 tests
```

---

## 🎯 Why Proof-of-Turing Wins

| Factor | Why It Matters |
|--------|---------------|
| **New Category** | No protocol like this exists in Web3 — first Proof-of-Agenthood |
| **Infrastructure Layer** | Not a dApp — all dApps on Mantle can use PoT |
| **ERC-8004 Synergy** | PoT is a natural layer on top of ERC-8004 — they reinforce each other |
| **Panel Match** | Allora Network (AI infra) + Nansen (data) + BGA (trust) |
| **Hackathon Theme** | Named "Turing Test" — PoT IS a Turing Test for Web3 agents |
| **Demo Impact** | Split-screen comparison of real AI vs script is visually compelling |
| **Scalable** | More data = more accurate scores. Gets better over time |

---

## 🔮 Future Roadmap

- [ ] **ML-based scoring** — Replace rule-based analyzers with trained models
- [ ] **On-chain oracle** — Fully decentralized verification via Allora Network
- [ ] **Agent reputation system** — Historical score tracking and reputation badges
- [ ] **Cross-chain support** — Verify agents across multiple chains
- [ ] **Byreal Skills CLI integration** — Native support for Byreal agent framework

---

## 📜 License

MIT — Built for The Turing Test Hackathon 2026 by Mantle
