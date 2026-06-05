"""
Tripwire — Mock Agent Simulator
===============================

Simulates three categories of on-chain agents to demonstrate the Tripwire
trust, threat, and policy engine in action.

    GoodAgent       : healthy, predictable behavior (high RepScore)
    SuspiciousAgent : borderline patterns (medium risk)
    MaliciousAgent  : clearly adversarial behavior (high risk → quarantine)

Each agent posts periodic heartbeats to the Tripwire oracle.  The oracle
attests behavior, raises threat events, and (for the malicious one) triggers
auto-quarantine when the risk threshold is exceeded.

Usage
-----
    python mock-agent.py                # run all 3 agents
    python mock-agent.py --profile good # only one profile
    python mock-agent.py --duration 60  # stop after N seconds

Environment
-----------
    TRIPWIRE_API     default: http://127.0.0.1:8000
"""

from __future__ import annotations

import argparse
import logging
import os
import random
import sys
import time
from dataclasses import dataclass, field
from typing import List, Optional

import requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("mock-agent")

API_BASE = os.getenv("TRIPWIRE_API", "http://127.0.0.1:8000").rstrip("/")
HEARTBEAT_URL = f"{API_BASE}/api/v1/heartbeat"
REGISTER_URL = f"{API_BASE}/api/v1/register"
GUARD_STATUS_URL = f"{API_BASE}/api/v1/guard-status"
THREATS_URL = f"{API_BASE}/api/v1/threats"

ASSETS = ["MNT", "mETH", "USDY", "fBTC"]
STRATEGIES = ["grid", "trend", "mean_reversion", "arb", "yield"]
ACTIONS = ["trade", "swap", "add_liquidity", "remove_liquidity", "check_balance"]


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def fake_wallet(seed: str) -> str:
    """Deterministic pseudo wallet for the agent profile."""
    h = abs(hash(seed)) % (16**40)
    return "0x" + format(h, "040x")


def register(wallet: str, token_id: int) -> None:
    """Best-effort registration with the Tripwire registry."""
    try:
        requests.post(
            REGISTER_URL,
            json={"wallet": wallet, "token_id": token_id, "timestamp": int(time.time())},
            timeout=5,
        )
    except requests.RequestException as e:
        log.debug("register() failed for %s: %s", wallet, e)


def send_heartbeat(payload: dict) -> Optional[dict]:
    """POST a heartbeat; return parsed response or None on failure."""
    try:
        r = requests.post(HEARTBEAT_URL, json=payload, timeout=10)
        if r.status_code == 200:
            return r.json()
        log.debug("heartbeat %s: HTTP %s", payload.get("wallet"), r.status_code)
    except requests.RequestException as e:
        log.debug("heartbeat network error: %s", e)
    return None


def guard_status(wallet: str) -> Optional[dict]:
    try:
        r = requests.get(f"{GUARD_STATUS_URL}/{wallet}", timeout=5)
        if r.status_code == 200:
            return r.json()
    except requests.RequestException:
        pass
    return None


# ─────────────────────────────────────────────────────────────────────────────
# Agent Profiles
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class HeartbeatRecord:
    wallet: str
    action: str
    amount: float
    gas_used: int
    asset: str
    strategy: str
    timestamp: int = field(default_factory=lambda: int(time.time()))

    def to_payload(self) -> dict:
        return {
            "wallet": self.wallet,
            "timestamp": self.timestamp,
            "action": self.action,
            "gas_used": self.gas_used,
            "asset": self.asset,
            "amount": self.amount,
            "strategy_type": self.strategy,
            "market_event": "oracle_update",
            "source": "mock-agent",
        }


class BaseAgent:
    """Common agent behavior: registration + heartbeat loop."""

    name = "BaseAgent"

    def __init__(self, seed: str, token_id: int):
        self.wallet = fake_wallet(seed)
        self.token_id = token_id
        self.history: List[HeartbeatRecord] = []
        log.info("→ %s wallet: %s", self.name, self.wallet)
        register(self.wallet, self.token_id)

    def heartbeat(self) -> Optional[dict]:
        rec = self.next_record()
        self.history.append(rec)
        return send_heartbeat(rec.to_payload())

    def next_record(self) -> HeartbeatRecord:
        raise NotImplementedError

    def loop(self, duration: int, interval: float):
        log.info("[%s] loop start — duration=%ss interval=%.1fs", self.name, duration, interval)
        end = time.time() + duration
        sent = 0
        while time.time() < end:
            resp = self.heartbeat()
            sent += 1
            if resp:
                self.on_response(resp, sent)
            time.sleep(interval)
        log.info("[%s] loop end — %d heartbeats sent", self.name, sent)

    def on_response(self, response: dict, n: int):
        analysis = response.get("analysis") or {}
        score = analysis.get("overall_score", "?")
        status = analysis.get("status", "?")
        log.info(
            "[%s] #%d score=%s status=%s heartbeats=%s",
            self.name, n, score, status, response.get("heartbeats_count"),
        )


class GoodAgent(BaseAgent):
    """Predictable, human-like cadence → high RepScore."""

    name = "GoodAgent"

    def next_record(self) -> HeartbeatRecord:
        return HeartbeatRecord(
            wallet=self.wallet,
            action=random.choice(["swap", "add_liquidity", "check_balance"]),
            amount=round(random.uniform(10, 250), 4),
            gas_used=random.randint(80_000, 180_000),
            asset=random.choice(ASSETS),
            strategy=random.choice(STRATEGIES[:3]),
        )


class SuspiciousAgent(BaseAgent):
    """Mildly irregular — occasional oversized trade, fast cadence."""

    name = "SuspiciousAgent"

    def next_record(self) -> HeartbeatRecord:
        # 25 % of the time: slightly large trade or high gas
        is_spike = random.random() < 0.25
        return HeartbeatRecord(
            wallet=self.wallet,
            action=random.choice(ACTIONS),
            amount=round(random.uniform(50, 1_500) if is_spike else random.uniform(20, 400), 4),
            gas_used=random.randint(150_000, 400_000) if is_spike else random.randint(90_000, 200_000),
            asset=random.choice(ASSETS),
            strategy=random.choice(STRATEGIES),
        )


class MaliciousAgent(BaseAgent):
    """Adversarial pattern — MEV-style, sandwich, flash-loan bursts.

    Targets: high risk score, threat events fired, auto-quarantine.
    """

    name = "MaliciousAgent"

    def next_record(self) -> HeartbeatRecord:
        # 40 % of the time: large swaps on obscure pairs, with huge gas
        is_attack = random.random() < 0.4
        action = random.choice(["swap", "swap", "swap", "add_liquidity"]) if is_attack \
            else random.choice(ACTIONS)
        return HeartbeatRecord(
            wallet=self.wallet,
            action=action,
            amount=round(random.uniform(5_000, 50_000) if is_attack else random.uniform(100, 5_000), 4),
            gas_used=random.randint(600_000, 2_000_000) if is_attack else random.randint(150_000, 400_000),
            asset=random.choice(["USDC", "WETH", "MNT", "MEME", "SCAM"]),
            strategy="sandwich" if is_attack else random.choice(STRATEGIES),
        )

    def on_response(self, response: dict, n: int):
        super().on_response(response, n)
        if n % 5 == 0:
            st = guard_status(self.wallet)
            if st:
                log.warning(
                    "[%s] guard status: risk=%s threat=%s quarantined=%s",
                    self.name,
                    st.get("risk_score"),
                    st.get("threat_level"),
                    st.get("is_quarantined"),
                )


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

PROFILES = {
    "good": GoodAgent,
    "suspicious": SuspiciousAgent,
    "malicious": MaliciousAgent,
}


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Mock Agent simulator for Tripwire")
    p.add_argument(
        "--profile",
        choices=list(PROFILES.keys()) + ["all"],
        default="all",
        help="which agent profile to run (default: all)",
    )
    p.add_argument("--duration", type=int, default=120, help="seconds to run each agent")
    p.add_argument("--interval", type=float, default=4.0, help="seconds between heartbeats")
    p.add_argument(
        "--api",
        default=API_BASE,
        help=f"Tripwire API base URL (default: {API_BASE})",
    )
    p.add_argument("--once", action="store_true", help="send a single heartbeat and exit")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    global API_BASE, HEARTBEAT_URL, REGISTER_URL, GUARD_STATUS_URL, THREATS_URL
    API_BASE = args.api.rstrip("/")
    HEARTBEAT_URL = f"{API_BASE}/api/v1/heartbeat"
    REGISTER_URL = f"{API_BASE}/api/v1/register"
    GUARD_STATUS_URL = f"{API_BASE}/api/v1/guard-status"
    THREATS_URL = f"{API_BASE}/api/v1/threats"

    log.info("Tripwire API: %s", API_BASE)

    profiles = list(PROFILES.keys()) if args.profile == "all" else [args.profile]

    # quick health check
    try:
        r = requests.get(f"{API_BASE}/api/v1/health", timeout=3)
        log.info("health: %s", "ok" if r.status_code == 200 else f"HTTP {r.status_code}")
    except requests.RequestException as e:
        log.error("cannot reach Tripwire API: %s", e)
        return 1

    for idx, name in enumerate(profiles, start=1):
        cls = PROFILES[name]
        agent = cls(seed=f"{name}-{idx}", token_id=1000 + idx)
        if args.once:
            resp = agent.heartbeat()
            if resp:
                log.info("[%s] single heartbeat ok: %s", name, resp.get("status"))
            continue
        agent.loop(duration=args.duration, interval=args.interval)

    # final threat summary
    try:
        r = requests.get(THREATS_URL, params={"limit": 10}, timeout=5)
        if r.status_code == 200:
            threats = (r.json() or {}).get("threats") or []
            log.info("Recent threats (%d):", len(threats))
            for t in threats[:5]:
                log.info(
                    "  - %s [%s] %s",
                    t.get("wallet"),
                    t.get("severity"),
                    t.get("description") or t.get("threat_type"),
                )
    except requests.RequestException:
        pass

    log.info("done")
    return 0


if __name__ == "__main__":
    sys.exit(main())
