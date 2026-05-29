#!/usr/bin/env python3
"""
Mock Agent for Proof-of-Turing Testing.

Simulates two types of agents for testing the PoT oracle:
1. "real-ai" — Simulates LLM-based AI agent behavior (natural timing, diverse strategies)
2. "script" — Simulates simple script behavior (regular timing, fixed strategies)

Usage:
    python scripts/mock-agent.py --type real-ai --wallet 0x...
    python scripts/mock-agent.py --type script --wallet 0x...
    python scripts/mock-agent.py --type both
"""
import argparse
import json
import random
import time
import sys
from typing import Optional, Tuple
from datetime import datetime

try:
    import requests
except ImportError:
    print("Error: requests library required. pip install requests")
    sys.exit(1)


# ─── Configuration ───

DEFAULT_ORACLE_URL = "http://localhost:8000"

ACTIONS = [
    "swap", "add_liquidity", "remove_liquidity", "trade", "check_balance"
]

ASSETS = ["MNT", "mETH", "USDY", "fBTC", "USDC"]

STRATEGIES_AI = [
    "grid_trading", "trend_following", "mean_reversion",
    "yield_farming", "arbitrage", "liquidity_provision",
]

STRATEGIES_SCRIPT = ["fixed_grid", "simple_buy"]


class RealAIAgent:
    """Simulates an LLM-based AI agent with natural behavior patterns."""

    def __init__(self, wallet: str):
        self.wallet = wallet
        self.last_action_time = 0
        self.market_events = ["price_up_5pct", "price_down_3pct", "volume_spike", "new_pool"]

    def generate_heartbeat(self) -> dict:
        """Generate a heartbeat with natural AI-like timing and diversity."""

        # Natural timing: 2-8 seconds between actions
        now = int(time.time())
        if self.last_action_time > 0:
            # Variable delay (2-8 seconds with normal distribution)
            delay = min(abs(random.gauss(4.0, 1.5)) + 1.0, 8.0)
            time.sleep(min(delay, 8.0))

        self.last_action_time = int(time.time())

        # Diverse action selection (weighted)
        action = random.choices(
            ACTIONS,
            weights=[0.35, 0.15, 0.10, 0.30, 0.10],
            k=1
        )[0]

        # Diverse asset selection
        asset = random.choice(ASSETS)

        # Variable trade amounts (50-10000)
        amount = round(random.uniform(50, 10000), 2)

        # Diverse strategy selection
        strategy = random.choice(STRATEGIES_AI)

        # Occasionally respond to market events (30% chance)
        market_event = None
        if random.random() < 0.3:
            market_event = random.choice(self.market_events)

        return {
            "wallet": self.wallet,
            "timestamp": self.last_action_time,
            "action": action,
            "asset": asset,
            "amount": amount,
            "strategy_type": strategy,
            "market_event": market_event,
        }


class ScriptAgent:
    """Simulates a simple script/bot with very regular behavior patterns."""

    def __init__(self, wallet: str):
        self.wallet = wallet
        self.counter = 0

    def generate_heartbeat(self) -> dict:
        """Generate a heartbeat with suspiciously regular timing."""

        # Fixed timing: exactly 3.0 seconds (too perfect)
        time.sleep(3.0)

        self.counter += 1
        now = int(time.time())

        # Fixed action pattern (always the same sequence)
        actions_cycle = ["check_balance", "check_balance", "swap", "check_balance"]
        action = actions_cycle[self.counter % len(actions_cycle)]

        # Fixed asset (always MNT)
        asset = "MNT"

        # Fixed amount (always 100)
        amount = 100.0

        # Fixed strategy
        strategy = "fixed_grid"

        return {
            "wallet": self.wallet,
            "timestamp": now,
            "action": action,
            "asset": asset,
            "amount": amount,
            "strategy_type": strategy,
            "market_event": None,
        }


def submit_heartbeat(heartbeat: dict, oracle_url: str) -> Optional[dict]:
    """Submit heartbeat to PoT oracle."""
    try:
        response = requests.post(
            f"{oracle_url}/api/v1/heartbeat",
            json=heartbeat,
            headers={"Content-Type": "application/json"},
            timeout=10,
        )
        if response.status_code == 200:
            return response.json()
        else:
            print(f"  Error: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.ConnectionError:
        print(f"  Error: Cannot connect to oracle at {oracle_url}")
        print(f"  Make sure the backend is running: uvicorn main:app --reload --port 8000")
        return None
    except Exception as e:
        print(f"  Error: {e}")
        return None


def print_status(result: dict, count: int):
    """Print the latest analysis result."""
    if not result:
        return

    analysis = result.get("analysis", {})
    score = analysis.get("overall_score", 0)
    status = analysis.get("status", "unknown")

    if score >= 70:
        marker = "[HIGH]"
    elif score >= 40:
        marker = "[MED]"
    else:
        marker = "[LOW]"
    print(f"  Heartbeat #{count} | Score: {score}/100 {marker} | Status: {status}")


def check_final_status(wallet: str, oracle_url: str):
    """Check final verification status for a wallet."""
    try:
        resp = requests.get(
            f"{oracle_url}/api/v1/verify/{wallet}",
            timeout=10,
        )
        if resp.status_code == 200:
            data = resp.json()
            print(f"  Final Verification:")
            print(f"     Score: {data.get('score', '?')}/100")
            print(f"     Badge: {data.get('badge', '?')}")
            print(f"     Verdict: {data.get('verdict', '?')}")
    except Exception:
        pass


def main():
    parser = argparse.ArgumentParser(
        description="Proof-of-Turing Mock Agent",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/mock-agent.py --type real-ai --wallet 0xAI123...
  python scripts/mock-agent.py --type script --wallet 0xBOT456...
  python scripts/mock-agent.py --type both
        """,
    )
    parser.add_argument(
        "--type",
        choices=["real-ai", "script", "both"],
        default="both",
        help="Type of agent to simulate (default: both)",
    )
    parser.add_argument(
        "--wallet",
        type=str,
        help="Wallet address for the agent",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=20,
        help="Number of heartbeats to send (default: 20)",
    )
    parser.add_argument(
        "--oracle-url",
        type=str,
        default=DEFAULT_ORACLE_URL,
        help=f"Oracle API URL (default: {DEFAULT_ORACLE_URL})",
    )

    args = parser.parse_args()
    oracle_url = args.oracle_url

    print("=" * 60)
    print("Proof-of-Turing -- Mock Agent Simulator")
    print("=" * 60)
    print()

    agents = []

    if args.type in ("real-ai", "both"):
        wallet_ai = args.wallet or f"0xAI_{random.randint(1000, 9999)}"
        agents.append(("[AI] REAL AI AGENT", wallet_ai, RealAIAgent(wallet_ai)))
        print(f"  [AI] Real AI Agent: {wallet_ai}")

    if args.type in ("script", "both"):
        wallet_script = f"0xBOT_{random.randint(1000, 9999)}" if args.type == "both" else (
            args.wallet or f"0xBOT_{random.randint(1000, 9999)}"
        )
        agents.append(("[SCRIPT] SCRIPT AGENT", wallet_script, ScriptAgent(wallet_script)))
        print(f"  [SCRIPT] Script Agent:  {wallet_script}")

    print()
    print(f"  Submitting {args.count} heartbeats per agent...")
    print(f"  Oracle: {oracle_url}")
    print()

    for agent_name, wallet, agent in agents:
        print(f"--- {agent_name} ---")
        print(f"  Wallet: {wallet}")
        print()

        for i in range(args.count):
            heartbeat = agent.generate_heartbeat()
            result = submit_heartbeat(heartbeat, oracle_url)

            if result:
                print_status(result, i + 1)
            else:
                print(f"  Heartbeat #{i + 1}: Failed")

            # Small delay between heartbeats for readability
            time.sleep(0.1)

        print()
        check_final_status(wallet, oracle_url)
        print()

    print("=" * 60)
    print("Simulation Complete!")
    print("=" * 60)
    print()
    print("To check results, open:")
    print("  Frontend: http://localhost:3000")
    print("  API:      http://localhost:8000/api/v1/agents")
    print()
    print()


if __name__ == "__main__":
    main()
