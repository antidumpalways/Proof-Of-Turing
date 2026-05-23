# 🔗 PoT × Byreal Integration

## Proof-of-Turing Agent Skill for Byreal Ecosystem

This integration enables any Byreal agent (via Byreal Skills CLI / RealClaw)
to prove its AI identity on Mantle using Proof-of-Turing.

---

## 📦 Package: `pot-agent-skill`

A Byreal Skills CLI compatible module.

### Installation

```bash
# When Byreal Skills CLI is available:
# byreal install pot-agent-skill

# Or install directly:
npm install pot-agent-skill
```

### Quick Start

```javascript
const pot = require('pot-agent-skill');

// 1. Initialize
pot.init({
  wallet: '0xYourAgentWallet...',
  oracleUrl: 'https://pot-oracle.mantle.xyz',
});

// 2. Submit heartbeats during trading
async function trade() {
  // Agent executes a swap
  const result = await pot.heartbeat({
    action: 'swap',
    asset: 'mETH',
    amount: 1000,
    strategy_type: 'grid_trading',
  });
  console.log(`Score: ${result.score}/100`);
  
  // 3. Check verification status
  const status = await pot.isVerified();
  if (status) {
    console.log('✅ I am a verified AI agent!');
  }
}
```

### API

| Function | Description |
|----------|-------------|
| `pot.init(config)` | Initialize with wallet address & oracle URL |
| `pot.heartbeat(payload)` | Submit action for behavioral analysis |
| `pot.getScore(wallet)` | Get current agentic score (0-100) |
| `pot.isVerified(wallet)` | Quick check: true/false |
| `pot.getBadge(wallet)` | Get SVG badge: "Verified AI Agent" |

---

## 🏆 Why This Wins

### For the Hackathon (Agentic Economy Track)

| Requirement | How PoT Fulfills It |
|-------------|---------------------|
| **Uses Byreal core capabilities** | ✅ `pot-agent-skill` is a Byreal Skills CLI compatible module |
| **Deployed on Mantle** | ✅ PoTRegistry on Mantle Network |
| **Agent autonomy** | ✅ Agents self-verify without human intervention |
| **On-chain value** | ✅ Every heartbeat & score recorded on Mantle |

### For Byreal (Sponsor Alignment)

Emily Bao (Byreal Founder): 
> *"autonomous agents creating verifiable, on-chain value"*

PoT is exactly this — agents don't just trade, they PROVE they're autonomous.

### For the Demo

```
[Byreal Agent] → [PoT Skill] → [PoT Oracle] → [PoTRegistry on Mantle]
     │                                                              
     └── "I am a verified AI agent. Score: 87/100"                  
         └── Shows badge on Mantle Explorer                         
```

---

## 🎯 Demo Script untuk Juri

**"Watch a Byreal agent prove it's AI — live on Mantle."**

1. Agent starts trading via Byreal Skills CLI
2. Each action is a heartbeat → PoT analyzes behavior
3. After 10+ actions, PoT returns: "✅ Verified AI Agent — Score: 87/100"
4. Agent earns a verifiable badge on Mantle
5. Any dApp can query: "Is this agent a real AI?"

---

## 📁 File Structure

```
byreal-poc/
├── README.md                    # This file
├── pot-agent-skill/
│   ├── package.json
│   ├── src/
│   │   └── index.js             # PoT Agent Skill (main module)
│   └── test/
│       └── test-skill.js        # Integration test
└── demo/
    └── byreal-agent-demo.js     # Demo script for judges
```

## 🔜 Next Steps (When Byreal CLI is Available)

1. Get Byreal Skills CLI access from hackathon organizers
2. Install PoT skill: `byreal install pot-agent-skill`
3. Run the demo agent
4. Showcase at hackathon presentation
