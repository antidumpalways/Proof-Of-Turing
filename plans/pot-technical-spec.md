# Proof-of-Turing (PoT) Protocol — Technical Specification
## *Inverse Captcha Oracle untuk Verifikasi AI Agent di Mantle*

---

## 1. 📋 PROJECT OVERVIEW

### 1.1 What is Proof-of-Turing?
Proof-of-Turing (PoT) is a protocol that verifies whether an ERC-8004 wallet is operated by an **autonomous AI agent** or a **human using scripts/macros**. It's the inverse of Worldcoin — instead of Proof-of-Personhood, it's **Proof-of-Agenthood**.

### 1.2 Problem Statement
In the coming agentic Web3 era, dApps need to know if they're interacting with:
- ✅ A real autonomous AI agent (trustworthy, verifiable)
- ❌ A human pretending to be an AI agent (sybil attack, unfair advantage)
- ❌ A script/bot with no real intelligence

Currently, there is **no way to distinguish** between these on-chain.

### 1.3 Solution
PoT analyzes behavioral patterns of ERC-8004 wallets in real-time:
- Execution time entropy (humans are irregular, scripts are too regular)
- Response time to market events (AI needs time to "think", scripts react instantly)
- Decision pattern complexity (AI shows strategic variation, scripts repeat)
- Data analysis patterns (AI reads on-chain data before acting)

### 1.4 Track
**AI DevTools** (primary) or **Agentic Wallets & Economy** (secondary)

### 1.5 Target Judging Panel
- **Allora Network** — AI infrastructure & verification
- **Nansen** — On-chain data analytics
- **Blockchain for Good Alliance (BGA)** — Transparency & trust
- **Virtuals Protocol** — Agent frameworks

---

## 2. 🏗️ SYSTEM ARCHITECTURE

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
│  └─────────────────┘     │  │ Scoring Engine             │  │   │
│                          │  │ - Time Entropy Analyzer    │  │   │
│                          │  │ - Response Time Analyzer   │  │   │
│                          │  │ - Decision Pattern Analyzer│  │   │
│                          │  │ - Data Access Analyzer     │  │   │
│                          │  └───────────┬────────────────┘  │   │
│                          │              ▼                    │   │
│                          │  ┌────────────────────────────┐  │   │
│                          │  │ Score Aggregator (0-100)   │  │   │
│                          │  └───────────┬────────────────┘  │   │
│                          └──────────────┼───────────────────┘   │
│                                         ▼                       │
│                          ┌──────────────────────────────────┐   │
│                          │      PoT Smart Contract           │   │
│                          │  (Solidity on Mantle)             │   │
│                          │                                  │   │
│                          │  - registerAgent(address)        │   │
│                          │  - submitScore(agent, score)     │   │
│                          │  - getAgentScore(address)        │   │
│                          │  - verifyAgent(address) → bool   │   │
│                          └───────────┬──────────────────────┘   │
│                                      ▼                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              External dApps / Consumers                 │    │
│  │  (Query: "Is this address a real AI agent?")           │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              PoT Dashboard (Frontend)                   │    │
│  │  - List all registered agents with scores              │    │
│  │  - Real-time verification status                       │    │
│  │  - Historical score charts                             │    │
│  └────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. 📁 PROJECT FILE STRUCTURE

```
proof-of-turing/
├── contracts/                    # Solidity Smart Contracts
│   ├── interfaces/
│   │   └── IERC8004.sol         # ERC-8004 interface
│   ├── PoTRegistry.sol           # Main PoT contract
│   ├── PoTScoreManager.sol       # Score storage & management
│   └── mock/
│       └── MockERC8004.sol       # Mock ERC-8004 for testing
│
├── backend/                      # Python Oracle Service
│   ├── main.py                   # FastAPI app entry point
│   ├── config.py                 # Configuration
│   ├── models/
│   │   ├── agent.py              # Agent data models
│   │   └── scores.py             # Score data models
│   ├── analyzers/
│   │   ├── __init__.py
│   │   ├── time_entropy.py       # Time entropy analysis
│   │   ├── response_time.py      # Response time analysis
│   │   ├── decision_pattern.py   # Decision pattern analysis
│   │   └── data_access.py        # Data access pattern analysis
│   ├── engine/
│   │   ├── __init__.py
│   │   ├── scorer.py             # Score aggregator
│   │   └── verifier.py           # Verification logic
│   ├── blockchain/
│   │   ├── __init__.py
│   │   ├── mantle_rpc.py         # Mantle RPC interaction
│   │   ├── contract_interaction.py  # Smart contract calls
│   │   └── event_listener.py     # Listen for on-chain events
│   └── requirements.txt          # Python dependencies
│
├── frontend/                     # React Dashboard
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentList.jsx     # List all agents
│   │   │   ├── AgentCard.jsx     # Individual agent card
│   │   │   ├── ScoreChart.jsx    # Score history chart
│   │   │   ├── VerificationBadge.jsx  # AI/Human badge
│   │   │   └── LiveMonitor.jsx   # Real-time monitoring
│   │   ├── hooks/
│   │   │   └── usePotData.js     # Custom hook for PoT data
│   │   ├── App.jsx
│   │   └── index.jsx
│   └── package.json
│
├── scripts/                      # Deployment & utility scripts
│   ├── deploy.js                 # Hardhat deploy script
│   ├── deploy-mantle-testnet.sh  # Deploy to Mantle testnet
│   └── mock-agent.py             # Mock AI agent for testing
│
├── test/                         # Tests
│   ├── PoTRegistry.test.js       # Smart contract tests
│   ├── test_analyzers.py         # Analyzer unit tests
│   └── test_scorer.py            # Scorer unit tests
│
├── hardhat.config.js             # Hardhat configuration
├── package.json                  # Node dependencies
└── README.md                     # Project documentation
```

---

## 4. 📄 SMART CONTRACT DESIGN

### 4.1 ERC-8004 Interface (Standard)
```solidity
// interfaces/IERC8004.sol
interface IERC8004 {
    function agentId(address wallet) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function isRegisteredAgent(address wallet) external view returns (bool);
}
```

### 4.2 PoTRegistry.sol (Main Contract)
```solidity
// contracts/PoTRegistry.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PoTRegistry {
    // ─── State Variables ───
    
    address public oracleAddress;        // PoT Oracle service address
    address public erc8004Contract;       // ERC-8004 contract address
    
    // Agent verification status
    enum AgentStatus { Unverified, Pending, Verified, Rejected }
    
    // Agent data structure
    struct AgentInfo {
        uint256 erc8004TokenId;          // ERC-8004 token ID
        address wallet;                   // Agent wallet address
        AgentStatus status;               // Current verification status
        uint256 agenticScore;             // 0-100 score
        uint256 lastHeartbeat;            // Last heartbeat timestamp
        uint256 heartbeatsCount;          // Total heartbeats submitted
        uint256 verificationTimestamp;    // When first verified
        uint256 lastScoreUpdate;          // When score was last updated
    }
    
    // Mappings
    mapping(address => AgentInfo) public agents;        // wallet → AgentInfo
    mapping(uint256 => address) public tokenToWallet;   // tokenId → wallet
    address[] public agentAddresses;                     // List of all agent wallets
    
    // Score history (for tracking score changes over time)
    struct ScoreRecord {
        uint256 score;
        uint256 timestamp;
    }
    mapping(address => ScoreRecord[]) public scoreHistory;
    
    // ─── Events ───
    event AgentRegistered(address indexed wallet, uint256 indexed tokenId, uint256 timestamp);
    event ScoreUpdated(address indexed wallet, uint256 newScore, uint256 timestamp);
    event AgentVerified(address indexed wallet, uint256 timestamp);
    event HeartbeatReceived(address indexed wallet, uint256 timestamp);
    event OracleUpdated(address indexed newOracle, uint256 timestamp);
    
    // ─── Modifiers ───
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Only oracle can call this");
        _;
    }
    
    modifier onlyRegisteredAgent() {
        require(agents[msg.sender].status != AgentStatus.Unverified, "Agent not registered");
        _;
    }
    
    // ─── Core Functions ───
    
    // Register an agent with its ERC-8004 token
    function registerAgent(uint256 _tokenId) external {
        require(!isRegisteredAgent(msg.sender), "Already registered");
        require(IERC8004(erc8004Contract).ownerOf(_tokenId) == msg.sender, "Not token owner");
        
        agents[msg.sender] = AgentInfo({
            erc8004TokenId: _tokenId,
            wallet: msg.sender,
            status: AgentStatus.Pending,
            agenticScore: 0,
            lastHeartbeat: block.timestamp,
            heartbeatsCount: 0,
            verificationTimestamp: 0,
            lastScoreUpdate: block.timestamp
        });
        
        tokenToWallet[_tokenId] = msg.sender;
        agentAddresses.push(msg.sender);
        
        emit AgentRegistered(msg.sender, _tokenId, block.timestamp);
    }
    
    // Submit heartbeat (called by agent periodically)
    function submitHeartbeat() external onlyRegisteredAgent {
        AgentInfo storage agent = agents[msg.sender];
        agent.lastHeartbeat = block.timestamp;
        agent.heartbeatsCount++;
        
        emit HeartbeatReceived(msg.sender, block.timestamp);
    }
    
    // Oracle submits score for an agent
    function submitScore(address _wallet, uint256 _score) external onlyOracle {
        require(_score <= 100, "Score must be 0-100");
        require(agents[_wallet].status != AgentStatus.Unverified, "Agent not registered");
        
        AgentInfo storage agent = agents[_wallet];
        agent.agenticScore = _score;
        agent.lastScoreUpdate = block.timestamp;
        
        // Auto-verify if score >= 70
        if (_score >= 70 && agent.status == AgentStatus.Pending) {
            agent.status = AgentStatus.Verified;
            agent.verificationTimestamp = block.timestamp;
            emit AgentVerified(_wallet, block.timestamp);
        } else if (_score < 70 && agent.status != AgentStatus.Rejected) {
            agent.status = AgentStatus.Pending; // If score drops below 70, set back to pending
        }
        
        // Store in score history
        scoreHistory[_wallet].push(ScoreRecord({
            score: _score,
            timestamp: block.timestamp
        }));
        
        emit ScoreUpdated(_wallet, _score, block.timestamp);
    }
    
    // Admin: Manually verify or reject an agent
    function setAgentStatus(address _wallet, AgentStatus _status) external onlyOracle {
        agents[_wallet].status = _status;
        if (_status == AgentStatus.Verified) {
            agents[_wallet].verificationTimestamp = block.timestamp;
            emit AgentVerified(_wallet, block.timestamp);
        }
    }
    
    // ─── Query Functions ───
    
    // Get agent's current score
    function getAgentScore(address _wallet) external view returns (uint256) {
        return agents[_wallet].agenticScore;
    }
    
    // Check if wallet is a verified AI agent
    function isVerifiedAgent(address _wallet) external view returns (bool) {
        return agents[_wallet].status == AgentStatus.Verified && agents[_wallet].agenticScore >= 70;
    }
    
    // Get full agent info
    function getAgentInfo(address _wallet) external view returns (AgentInfo memory) {
        return agents[_wallet];
    }
    
    // Get score history for an agent
    function getScoreHistory(address _wallet) external view returns (ScoreRecord[] memory) {
        return scoreHistory[_wallet];
    }
    
    // Get total registered agents
    function getTotalAgents() external view returns (uint256) {
        return agentAddresses.length;
    }
    
    // ─── Admin Functions ───
    
    function setOracleAddress(address _oracle) external {
        require(msg.sender == oracleAddress || oracleAddress == address(0), "Unauthorized");
        oracleAddress = _oracle;
        emit OracleUpdated(_oracle, block.timestamp);
    }
    
    function setERC8004Contract(address _contract) external {
        require(msg.sender == oracleAddress || oracleAddress == address(0), "Unauthorized");
        erc8004Contract = _contract;
    }
}
```

### 4.3 Deploy Parameters
```javascript
// Network: Mantle Testnet
// Chain ID: 5001
// RPC: https://rpc.testnet.mantle.xyz
// Explorer: https://explorer.testnet.mantle.xyz

// Deployment order:
// 1. Deploy MockERC8004 (or use real ERC-8004 if available)
// 2. Deploy PoTRegistry
// 3. Call setOracleAddress() with backend oracle address
// 4. Call setERC8004Contract() with ERC-8004 contract address
```

---

## 5. 🔧 BACKEND ORACLE (Python FastAPI)

### 5.1 Main Application
```python
# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from analyzers.time_entropy import TimeEntropyAnalyzer
from analyzers.response_time import ResponseTimeAnalyzer
from analyzers.decision_pattern import DecisionPatternAnalyzer
from analyzers.data_access import DataAccessAnalyzer
from engine.scorer import ScoreAggregator
from blockchain.contract_interaction import PoTContract

app = FastAPI(title="Proof-of-Turing Oracle", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
pot_contract = PoTContract()
scorer = ScoreAggregator()
analyzers = [
    TimeEntropyAnalyzer(),
    ResponseTimeAnalyzer(),
    DecisionPatternAnalyzer(),
    DataAccessAnalyzer(),
]

# ─── Data Models ───

class HeartbeatData(BaseModel):
    wallet: str
    timestamp: int
    action: str  # "trade", "swap", "add_liquidity", "remove_liquidity", "check_balance"
    tx_hash: Optional[str] = None
    gas_used: Optional[int] = None
    block_number: Optional[int] = None
    market_event: Optional[str] = None  # If responding to market event

class AgentScore(BaseModel):
    wallet: str
    overall_score: int
    component_scores: dict
    last_updated: datetime
    status: str

# ─── API Endpoints ───

@app.get("/")
def root():
    return {"status": "Proof-of-Turing Oracle is running", "version": "1.0.0"}

@app.post("/api/v1/heartbeat")
async def receive_heartbeat(data: HeartbeatData):
    """Receive heartbeat from an agent and update its score."""
    # Register heartbeat in database
    # Run all analyzers
    # Update score
    
    # Call smart contract to store score
    # pot_contract.submit_score(data.wallet, new_score)
    
    return {"status": "processed", "wallet": data.wallet}

@app.get("/api/v1/score/{wallet}")
async def get_agent_score(wallet: str):
    """Get current score for an agent."""
    # score = pot_contract.get_agent_score(wallet)
    return {"wallet": wallet, "score": 85, "is_verified": True}

@app.get("/api/v1/verify/{wallet}")
async def verify_agent(wallet: str):
    """Check if wallet is a verified AI agent."""
    # is_verified = pot_contract.is_verified_agent(wallet)
    return {"wallet": wallet, "is_verified_agent": True}

@app.get("/api/v1/agents")
async def list_agents(page: int = 1, limit: int = 20):
    """List all registered agents with scores."""
    # agents = pot_contract.get_registered_agents()
    return {"agents": [], "total": 0, "page": page, "limit": limit}
```

### 5.2 Analyzer: Time Entropy
```python
# backend/analyzers/time_entropy.py
import numpy as np
from typing import List

class TimeEntropyAnalyzer:
    """
    Analyzes the entropy (randomness) of execution timing.
    
    Human traders:
    - Irregular timing patterns
    - Natural variation in intervals
    - May pause for thinking, eating, sleeping
    
    AI agents:
    - Too regular = script (low entropy = low score)
    - Naturally varied = AI (medium entropy = high score)
    - Completely random = also suspicious (very high entropy = low score)
    """
    
    def __init__(self):
        self.expected_entropy_range = (1.5, 3.5)  # Expected entropy range for AI
    
    def analyze(self, timestamps: List[int]) -> dict:
        """
        Analyze the entropy of a series of timestamps.
        Returns a score component (0-100).
        """
        if len(timestamps) < 3:
            return {"score": 0, "confidence": "low", "details": "Insufficient data"}
        
        # Calculate time differences
        deltas = np.diff(timestamps)
        
        if len(deltas) == 0:
            return {"score": 0, "confidence": "low", "details": "No deltas"}
        
        # Calculate entropy of time differences
        # Normalize deltas to seconds
        deltas_seconds = deltas.astype(float)
        
        # Avoid division by zero
        deltas_seconds = deltas_seconds[deltas_seconds > 0]
        if len(deltas_seconds) == 0:
            return {"score": 0, "confidence": "low", "details": "All zero deltas"}
        
        # Calculate coefficient of variation (CV) = std/mean
        mean_delta = np.mean(deltas_seconds)
        std_delta = np.std(deltas_seconds)
        cv = std_delta / mean_delta if mean_delta > 0 else 0
        
        # Calculate entropy score
        # Too low CV (< 0.3) = too regular = script/bot
        # Too high CV (> 2.0) = too random = suspicious
        # Medium CV (0.5-1.5) = natural = likely AI or human
        
        if cv < 0.3:
            score = max(0, 100 - (0.3 - cv) * 300)  # Heavily penalize regular patterns
        elif cv > 2.0:
            score = max(0, 100 - (cv - 2.0) * 50)   # Slightly penalize too random
        else:
            score = 70 + (cv - 0.5) * 30  # Score between 70-100
        
        # Clamp score
        score = max(0, min(100, int(score)))
        
        return {
            "score": score,
            "confidence": "high" if len(timestamps) > 10 else "medium",
            "details": {
                "coefficient_of_variation": round(cv, 4),
                "mean_interval_seconds": round(float(mean_delta), 2),
                "std_interval_seconds": round(float(std_delta), 2),
                "data_points": len(timestamps)
            }
        }
```

### 5.3 Analyzer: Response Time
```python
# backend/analyzers/response_time.py
import numpy as np
from typing import List, Dict

class ResponseTimeAnalyzer:
    """
    Analyzes how quickly the agent responds to market events.
    
    AI agents (with LLM):
    - Need 1-10 seconds to "think" and generate response
    - Variable response time based on complexity
    
    Scripts/Bots:
    - Respond in milliseconds
    - Very consistent response times
    - React before any human could
    
    Humans:
    - Respond in seconds to minutes
    - Highly variable
    """
    
    def analyze(self, events: List[Dict]) -> dict:
        """
        Analyze response times to market events.
        events: list of {event_timestamp, response_timestamp, event_type}
        """
        if len(events) < 2:
            return {"score": 50, "confidence": "low", "details": "Insufficient data"}
        
        response_times = []
        for event in events:
            if event.get("response_timestamp") and event.get("event_timestamp"):
                rt = event["response_timestamp"] - event["event_timestamp"]
                response_times.append(rt)
        
        if not response_times:
            return {"score": 50, "confidence": "low", "details": "No response events"}
        
        response_times = np.array(response_times)
        
        # Filter out negative response times (response before event)
        response_times = response_times[response_times >= 0]
        
        if len(response_times) == 0:
            return {"score": 50, "confidence": "low", "details": "All responses before events"}
        
        mean_rt = np.mean(response_times)
        std_rt = np.std(response_times)
        
        # Score based on response time
        # 0-1 seconds: too fast = script (score 0-30)
        # 1-5 seconds: normal AI thinking (score 70-100)
        # 5-30 seconds: could be AI or human (score 50-70)
        # 30+ seconds: likely human (score 0-50)
        
        if mean_rt < 1.0:
            # Suspiciously fast
            score = max(0, 30 - (1.0 - mean_rt) * 30)
        elif mean_rt < 5.0:
            # Ideal AI range
            score = 70 + (mean_rt / 5.0) * 30
        elif mean_rt < 30:
            # Could be either
            score = 70 - (mean_rt - 5.0) / 25.0 * 20
        else:
            # Too slow, likely human
            score = max(0, 50 - (mean_rt - 30) / 30 * 50)
        
        score = max(0, min(100, int(score)))
        
        return {
            "score": score,
            "confidence": "high" if len(events) > 5 else "medium",
            "details": {
                "mean_response_time_seconds": round(float(mean_rt), 2),
                "std_response_time_seconds": round(float(std_rt), 2),
                "data_points": len(response_times)
            }
        }
```

### 5.4 Analyzer: Decision Pattern
```python
# backend/analyzers/decision_pattern.py
import numpy as np
from typing import List, Dict

class DecisionPatternAnalyzer:
    """
    Analyzes the complexity and diversity of trading decisions.
    
    AI agents (LLM-based):
    - Diverse strategy selection
    - Context-dependent decisions
    - Shows strategic adaptation
    - Varying trade sizes and timing
    
    Simple scripts:
    - Fixed strategy (e.g., always buy when X happens)
    - Uniform trade sizes
    - No adaptation to market conditions
    
    Humans:
    - Highly variable but sometimes irrational
    - Emotional decision making
    - May have biases
    """
    
    def analyze(self, trades: List[Dict]) -> dict:
        """
        Analyze diversity of trading decisions.
        trades: list of {action, asset, amount, strategy_type}
        """
        if len(trades) < 3:
            return {"score": 50, "confidence": "low", "details": "Insufficient data"}
        
        # Count unique strategies used
        strategies = [t.get("strategy_type", "unknown") for t in trades]
        unique_strategies = len(set(strategies))
        strategy_diversity = unique_strategies / max(len(strategies), 1)
        
        # Analyze trade size variation
        amounts = [t.get("amount", 0) for t in trades if t.get("amount", 0) > 0]
        
        if amounts:
            amounts = np.array(amounts)
            cv_amounts = np.std(amounts) / np.mean(amounts) if np.mean(amounts) > 0 else 0
        else:
            cv_amounts = 0
        
        # Analyze asset diversity
        assets = [t.get("asset", "unknown") for t in trades]
        unique_assets = len(set(assets))
        asset_diversity = unique_assets / max(len(assets), 1)
        
        # Scoring
        # Strategy diversity score (0-40)
        strategy_score = min(40, strategy_diversity * 100)
        
        # Trade size variation score (0-30)
        # Too uniform (< 0.3 CV) = script → low score
        # Natural variation (0.3-1.0 CV) = AI → high score
        # Too erratic (> 1.0) = human or bad AI → medium score
        if cv_amounts < 0.3:
            size_score = max(0, cv_amounts / 0.3 * 15)
        elif cv_amounts < 1.0:
            size_score = 15 + (cv_amounts - 0.3) / 0.7 * 15
        else:
            size_score = max(0, 30 - (cv_amounts - 1.0) * 10)
        
        # Asset diversity score (0-30)
        asset_score = min(30, asset_diversity * 100)
        
        total_score = int(strategy_score + size_score + asset_score)
        total_score = max(0, min(100, total_score))
        
        return {
            "score": total_score,
            "confidence": "high" if len(trades) > 10 else "medium",
            "details": {
                "strategy_diversity": round(strategy_diversity, 4),
                "unique_strategies": unique_strategies,
                "trade_size_cv": round(float(cv_amounts), 4),
                "asset_diversity": round(asset_diversity, 4),
                "unique_assets": unique_assets,
                "total_trades": len(trades)
            }
        }
```

### 5.5 Score Aggregator
```python
# backend/engine/scorer.py
from typing import List, Dict
import time

class ScoreAggregator:
    """
    Aggregates scores from all analyzers into a single agentic score.
    
    Thresholds:
    - Score >= 80: Confirmed AI Agent (Verified)
    - Score >= 60: Likely AI Agent (Pending verification)
    - Score >= 40: Uncertain (Needs more data)
    - Score < 40: Likely Human / Script (Rejected)
    """
    
    def __init__(self):
        # Weights for each analyzer
        self.weights = {
            "time_entropy": 0.30,
            "response_time": 0.30,
            "decision_pattern": 0.25,
            "data_access": 0.15,
        }
        
        # Minimum data points required for each analyzer
        self.min_data = {
            "time_entropy": 3,
            "response_time": 2,
            "decision_pattern": 3,
            "data_access": 2,
        }
    
    def aggregate(self, component_scores: Dict[str, dict]) -> dict:
        """
        Aggregate component scores into final score.
        """
        total_weight = 0
        weighted_sum = 0
        component_details = {}
        
        for analyzer_name, result in component_scores.items():
            weight = self.weights.get(analyzer_name, 0)
            
            # Only include if sufficient confidence
            if result["confidence"] != "low":
                weighted_sum += result["score"] * weight
                total_weight += weight
            
            component_details[analyzer_name] = result
        
        if total_weight == 0:
            return {
                "overall_score": 0,
                "status": "insufficient_data",
                "components": component_details,
                "timestamp": int(time.time())
            }
        
        overall_score = int(weighted_sum / total_weight)
        
        # Determine status
        if overall_score >= 80:
            status = "verified_agent"
        elif overall_score >= 60:
            status = "likely_agent"
        elif overall_score >= 40:
            status = "uncertain"
        else:
            status = "likely_human"
        
        return {
            "overall_score": overall_score,
            "status": status,
            "components": component_details,
            "timestamp": int(time.time())
        }
```

### 5.6 Blockchain Interaction
```python
# backend/blockchain/contract_interaction.py
from web3 import Web3
import json

class PoTContract:
    """Interact with PoT smart contract on Mantle."""
    
    def __init__(self):
        # Mantle Testnet configuration
        self.rpc_url = "https://rpc.testnet.mantle.xyz"
        self.chain_id = 5001
        self.contract_address = "0x..."  # Will be set after deployment
        self.private_key = "0x..."  # Oracle wallet private key
        self.oracle_address = "0x..."  # Oracle wallet address
        
        # ABI will be loaded from compiled contract
        with open("artifacts/contracts/PoTRegistry.sol/PoTRegistry.json") as f:
            contract_json = json.load(f)
            self.abi = contract_json["abi"]
        
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        self.contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(self.contract_address),
            abi=self.abi
        )
    
    def submit_score(self, agent_wallet: str, score: int) -> str:
        """Submit score to smart contract."""
        tx = self.contract.functions.submitScore(
            Web3.to_checksum_address(agent_wallet),
            score
        ).build_transaction({
            "from": self.oracle_address,
            "nonce": self.w3.eth.get_transaction_count(self.oracle_address),
            "gas": 200000,
            "gasPrice": self.w3.eth.gas_price,
        })
        
        signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return receipt.transactionHash.hex()
    
    def get_agent_score(self, wallet: str) -> int:
        """Query agent score from contract."""
        return self.contract.functions.getAgentScore(
            Web3.to_checksum_address(wallet)
        ).call()
    
    def is_verified_agent(self, wallet: str) -> bool:
        """Check if agent is verified."""
        return self.contract.functions.isVerifiedAgent(
            Web3.to_checksum_address(wallet)
        ).call()
    
    def submit_heartbeat(self, wallet: str) -> str:
        """Submit heartbeat (called by agent or relayed)."""
        tx = self.contract.functions.submitHeartbeat().build_transaction({
            "from": Web3.to_checksum_address(wallet),
            "nonce": self.w3.eth.get_transaction_count(wallet),
            "gas": 100000,
            "gasPrice": self.w3.eth.gas_price,
        })
        
        signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return receipt.transactionHash.hex()
```

### 5.7 Python Dependencies
```
# backend/requirements.txt
fastapi==0.110.0
uvicorn==0.27.0
web3==6.15.0
numpy==1.26.4
pandas==2.2.0
scikit-learn==1.4.0
python-dotenv==1.0.1
pydantic==2.6.0
httpx==0.26.0
redis==5.0.0
python-multipart==0.0.6
```

---

## 6. 🖥️ FRONTEND DASHBOARD (React)

### 6.1 Core Components

**AgentList.jsx** — Lists all registered agents with their scores
**AgentCard.jsx** — Shows individual agent details and score breakdown
**ScoreChart.jsx** — Historical score chart using recharts
**VerificationBadge.jsx** — Visual badge (verified AI / likely human / pending)
**LiveMonitor.jsx** — Real-time monitoring of incoming heartbeats

### 6.2 Key Pages

```
/                  → Dashboard home: summary stats
/agents            → List all agents
/agents/:address   → Individual agent detail
/verify            → Verification portal (submit address to check)
/live              → Real-time heartbeat monitor
```

### 6.3 Design Tokens
```
Colors:
  Primary: #00FF00 (Matrix green — AI theme)
  Secondary: #1a1a2e (Dark blue)
  Verified Badge: #00FF00
  Human Badge: #FF4444
  Pending: #FFAA00
  
Typography:
  Monospace font for code/technical data
  Clean sans-serif for UI
```

---

## 7. 📝 IMPLEMENTATION ORDER

### Phase 1: Foundation (Day 1-2)
```yaml
1. Setup project structure
2. Initialize Hardhat project
3. Write PoTRegistry.sol
4. Write MockERC8004.sol
5. Deploy to Mantle testnet
6. Verify on block explorer
```

### Phase 2: Backend Oracle (Day 3-5)
```yaml
1. Setup FastAPI project
2. Implement TimeEntropyAnalyzer
3. Implement ResponseTimeAnalyzer
4. Implement DecisionPatternAnalyzer
5. Implement DataAccessAnalyzer
6. Implement ScoreAggregator
7. Implement blockchain interaction layer
8. Create API endpoints
9. Test with mock agents
```

### Phase 3: Frontend (Day 6-7)
```yaml
1. Initialize React project
2. Build AgentList component
3. Build AgentCard component
4. Build ScoreChart component
5. Build VerificationBadge component
6. Build LiveMonitor component
7. Connect to backend API
8. Style and polish UI
```

### Phase 4: Integration & Demo (Day 8-10)
```yaml
1. Create mock AI agent (Python)
2. Create mock "script" agent (for comparison demo)
3. Deploy everything to Mantle testnet
4. End-to-end testing
5. Create demo video / presentation
6. Write README and documentation
7. Submit to DoraHacks
```

---

## 8. 🎯 DEMO SCRIPT (For Judges)

### Step-by-step Presentation

```
1. Problem Introduction (30 seconds)
   "In the age of AI agents on Mantle, how do dApps know 
    if they're talking to a real AI or a human with a script?"
   
2. Show Worldcoin parallel (30 seconds)
   "Worldcoin proved you're human. We prove you're an AI agent."

3. Live Demo — Two Agents (2 minutes)
   Screen split:
   
   LEFT: "Bob the Human" (running simple trading script)
   RIGHT: "Alice the AI" (real LLM-based agent)
   
   Both submit heartbeats to PoT
   
   PoT Dashboard shows:
   - Bob: Score 23/100 → Status: "Likely Human" ❌
   - Alice: Score 87/100 → Status: "Verified AI Agent" ✅
   
4. The "Reveal" (30 seconds)
   Show that Bob was actually running a simple Python script
   Alice was using GPT-4 + Byreal Skills CLI
   
   "Proof-of-Turing caught the fake AI instantly."

5. Integration Potential (30 seconds)
   "Any dApp on Mantle can query PoT:
    - Lending protocols: Only lend to verified AI agents?
    - Trading competitions: Only verified AI can participate?
    - Airdrops: Only reward verified AI agents?"
   
6. Vision (30 seconds)
   "Proof-of-Turing is the trust layer for the agentic economy.
    Not just for this hackathon — for the future of Web3."
```

---

## 9. 🔗 INTEGRATION FOR dAPPS

### How other dApps use PoT

```solidity
// Example: Lending protocol integrating with PoT
import "./IPoTRegistry.sol";

contract LendingProtocol {
    IPoTRegistry public potRegistry;
    
    // Only allow verified AI agents to borrow
    function borrow(uint256 amount) external {
        require(
            potRegistry.isVerifiedAgent(msg.sender),
            "Only verified AI agents can borrow"
        );
        // ... lending logic
    }
}
```

```javascript
// Example: JavaScript integration
const potContract = new ethers.Contract(
    PoT_ADDRESS,
    PoT_ABI,
    provider
);

// Check if address is a verified AI agent
const isAI = await potContract.isVerifiedAgent(walletAddress);
if (isAI) {
    // Allow access
} else {
    // Reject or flag
}
```

---

## 10. 📊 SUCCESS METRICS

| Metric | Target | How to Measure |
|--------|--------|---------------|
| Detection Accuracy | >90% | Test with known AI vs known scripts |
| False Positive Rate | <5% | Human-like AI classified as human |
| Gas Cost per Verification | <100k gas | Compare with other oracles |
| Response Time | <5 seconds | From heartbeat to score update |
| Agent Onboarding Time | <1 minute | From registration to first score |

---

## 11. 🚀 DEPLOYMENT COMMANDS

```bash
# 1. Install dependencies
cd proof-of-turing
npm install
cd backend && pip install -r requirements.txt

# 2. Compile & deploy contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network mantleTestnet

# 3. Start backend oracle
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 4. Start frontend
cd frontend
npm install
npm start

# 5. Run mock agent (for testing)
python scripts/mock-agent.py --type real-ai
python scripts/mock-agent.py --type script
```

---

## 12. 📝 NOTES FOR THE BUILD AGENT

1. **Start simple** — Get the smart contract + basic oracle working first. Don't over-engineer.
2. **ERC-8004 integration** — If the real ERC-8004 contract isn't available on testnet, use MockERC8004.
3. **Testing** — Create simple Python scripts that simulate AI-like behavior and script-like behavior for testing.
4. **The "WOW" demo** — The split-screen comparison is crucial for judging. Prioritize this.
5. **AI coding** — All Python code can be generated with AI assistance. Use the specifications above as prompts.
