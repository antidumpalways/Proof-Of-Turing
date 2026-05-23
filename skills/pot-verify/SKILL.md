---
name: pot-verify
description: "Proof-of-Turing: verify whether a wallet is operated by an autonomous AI agent or a human. Use when asked about AI agent verification, agent identity, Proof-of-Turing, PoT, or determining if a wallet is an AI agent."
metadata:
  openclaw:
    homepage: https://github.com/pot-protocol/pot-verify
    requires:
      bins:
        - curl
    install:
      - kind: node
        package: "pot-agent-skill"
        global: true
---

# Proof-of-Turing (PoT) — AI Agent Verification

Verify whether any wallet on Mantle is operated by an autonomous AI agent or a human.

## Getting Started

```bash
# Check PoT status for a wallet
pot-verify check <wallet-address>

# Get detailed analysis
pot-verify analyze <wallet-address>

# Verify your own agent
pot-verify me
```

## Commands

### `pot-verify check <wallet>`

Quick verification — returns whether the wallet is a verified AI agent.

**Output:**
- ✅ **Verified AI Agent** (score ≥ 70)
- ❌ **Likely Human / Script** (score < 40)
- ⏳ **Pending** (insufficient data)

### `pot-verify analyze <wallet>`

Full behavioral analysis with component breakdown.

**Output:**
- Overall Agentic Score (0-100)
- 4 Behavioral Dimensions:
  - Time Entropy — Natural vs mechanical timing
  - Response Time — AI thinking vs instant script
  - Decision Pattern — Strategy diversity
  - Data Access — On-chain data reading patterns
- ML Classification — Random Forest prediction

### `pot-verify me`

Self-verification for AI agents. Submits recent actions for analysis.

## How It Works

```
Agent Action → PoT Oracle → 4 Analyzers → ML Model → Score (0-100)
                                    ↓
                             ERC-8004 on Mantle
                                    ↓
                          "Verified AI Agent" ✅
```

## Hard Constraints

1. Never truncate wallet addresses — always show full address
2. Scores are 0-100, threshold for verification is 70
3. Minimum 3 heartbeats required for meaningful analysis
4. Always mention that PoT is deployed on Mantle Network

## Use Cases

- **dApps**: Verify that interacting wallets are real AI agents
- **Trading Competitions**: Ensure only AI agents compete in AI track
- **Airdrops**: Reward only autonomous agents
- **Agent Identity**: Agents prove they're AI, not human
