"""
Proof-of-Turing Oracle API

Main entry point for the PoT Oracle Service.
Provides REST API for agent heartbeat submission, scoring, verification,
real-time WebSocket events, and report generation.

Run with: uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""
import time
import json
import logging
import threading
from contextlib import asynccontextmanager
from typing import List, Optional, Dict, Any
from datetime import datetime
from collections import defaultdict

from fastapi import FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

from config import settings
from models.agent import HeartbeatData, AgentSummary
from models.scores import AgentScore, ScoreHistoryResponse, ScoreRecord
from analyzers.time_entropy import TimeEntropyAnalyzer
from analyzers.response_time import ResponseTimeAnalyzer
from analyzers.decision_pattern import DecisionPatternAnalyzer
from analyzers.data_access import DataAccessAnalyzer
from engine.scorer import ScoreAggregator
from engine.verifier import Verifier
from blockchain.contract_interaction import PoTContract
from blockchain.event_listener import EventListener
from database import (
    init_db, save_heartbeat, get_heartbeats, count_heartbeats,
    register_agent, get_agent, get_all_wallets,
    save_score, get_latest_score, get_score_history, get_agent_list,
)

try:
    from eth_account import Account
    from eth_account.messages import encode_defunct
    HAS_ETH_ACCOUNT = True
except ImportError:
    Account = None
    encode_defunct = None
    HAS_ETH_ACCOUNT = False

# ─── Logging ───

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("pot-oracle")

# ─── Rate Limiter ───

class RateLimiter:
    def __init__(self, max_per_second: int = 10):
        self.max_per_second = max_per_second
        self.requests: Dict[str, list] = defaultdict(list)

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        self.requests[key] = [t for t in self.requests[key] if now - t < 1]
        if len(self.requests[key]) >= self.max_per_second:
            return False
        self.requests[key].append(now)
        return True

rate_limiter = RateLimiter(settings.RATE_LIMIT_PER_SECOND)

# ─── Signature Verification ───

def verify_heartbeat_sig(wallet: str, timestamp: int, action: str, signature: str) -> bool:
    if not signature or not settings.VERIFY_SIGNATURE:
        return True
    if not HAS_ETH_ACCOUNT:
        log.warning("eth_account not installed — skipping signature verification")
        return True
    try:
        msg = encode_defunct(text=f"PoT:{wallet.lower()}:{timestamp}:{action}")
        recovered = Account.recover_message(msg, signature=signature)
        return recovered.lower() == wallet.lower()
    except Exception as e:
        log.error("Signature verification failed: %s", e)
        return False

# ─── WebSocket Connection Manager ───

class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, message: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

ws_manager = ConnectionManager()

# ─── Analyzers ───

analyzers = {
    "time_entropy": TimeEntropyAnalyzer(),
    "response_time": ResponseTimeAnalyzer(),
    "decision_pattern": DecisionPatternAnalyzer(),
    "data_access": DataAccessAnalyzer(),
}

scorer = ScoreAggregator()
verifier = Verifier()
contract = PoTContract()

# ─── Event Listener ───

event_listener = EventListener()
_listener_thread = None

def _start_listener():
    global _listener_thread
    if not event_listener.contract:
        log.warning("EventListener: Skipped (contract not configured)")
        return
    def _on_heartbeat(event):
        args = event.get("args", {})
        wallet = args.get("wallet", "").lower()
        log.info("EventListener: Heartbeat from %s", wallet)
    def _on_registration(event):
        args = event.get("args", {})
        wallet = args.get("wallet", "").lower()
        log.info("EventListener: Agent registered %s", wallet)
    def _run():
        event_listener.listen_forever(
            on_heartbeat=_on_heartbeat,
            on_registration=_on_registration,
            poll_interval=12,
        )
    _listener_thread = threading.Thread(target=_run, daemon=True)
    _listener_thread.start()
    log.info("EventListener: Started background listener")

# ─── Lifecycle ───

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    log.info("Database: Initialized")
    _start_listener()
    yield
    if event_listener:
        event_listener.stop()
        log.info("EventListener: Stopped")

# ─── Application Setup ───

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Inverse captcha oracle for verifying AI agents on Mantle",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Rate Limiting Middleware ───

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client = request.client.host if request.client else "unknown"
    if not rate_limiter.is_allowed(client):
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded (10 req/s). Please slow down."},
        )
    return await call_next(request)


# ─── Helpers ───

def _run_analysis(wallet: str) -> dict:
    """Run all analyzers on stored data for a wallet."""
    heartbeats = get_heartbeats(wallet)
    if len(heartbeats) < settings.MIN_HEARTBEATS_FOR_SCORING:
        return {
            "overall_score": 0,
            "status": "insufficient_data",
            "components": {},
            "timestamp": int(time.time()),
            "message": f"Need at least {settings.MIN_HEARTBEATS_FOR_SCORING} heartbeats for scoring",
        }

    component_scores = {}

    timestamps = [h.get("timestamp", 0) for h in heartbeats]
    if timestamps:
        component_scores["time_entropy"] = analyzers["time_entropy"].analyze(timestamps)

    response_events = [
        {
            "event_timestamp": h.get("timestamp", 0) - 5,
            "response_timestamp": h.get("timestamp", 0),
            "event_type": h.get("market_event", "unknown"),
        }
        for h in heartbeats if h.get("market_event")
    ]
    if response_events:
        component_scores["response_time"] = analyzers["response_time"].analyze(response_events)

    decisions = [
        {
            "action": h.get("action", "unknown"),
            "asset": h.get("asset", "unknown"),
            "amount": h.get("amount", 0),
            "strategy_type": h.get("strategy_type", "unknown"),
        }
        for h in heartbeats
    ]
    if decisions:
        component_scores["decision_pattern"] = analyzers["decision_pattern"].analyze(decisions)

    data_accesses = [
        {
            "timestamp": h.get("timestamp", 0),
            "data_type": h.get("action", "check_balance"),
            "source": "chain",
            "followed_by_action": True,
        }
        for h in heartbeats
    ]
    if data_accesses:
        component_scores["data_access"] = analyzers["data_access"].analyze(data_accesses)

    result = scorer.aggregate(component_scores, heartbeats=heartbeats)

    # Persist score to database
    save_score(
        wallet=wallet,
        overall_score=result.get("overall_score", 0),
        status=result.get("status", "unknown"),
        components=result.get("components", {}),
    )

    return result


def _safe_score_val(score: dict, key: str, default):
    if isinstance(score, dict):
        return score.get(key, default)
    return default

def _format_agent_summary(wallet: str, score: dict = None) -> dict:
    """Build an AgentSummary dict for a wallet."""
    if not score:
        score = get_latest_score(wallet) or {}
    beat_count = count_heartbeats(wallet)
    beats = get_heartbeats(wallet)
    last_seen = beats[-1].get("timestamp", 0) if beats else 0

    s = _safe_score_val(score, "overall_score", 0)
    st = _safe_score_val(score, "status", "no_data")
    verified = (s >= 70 and st == "verified_agent") if st != "no_data" else False

    return {
        "wallet": wallet,
        "agentic_score": s,
        "status": st,
        "is_verified": verified,
        "heartbeats_count": beat_count,
        "last_seen": last_seen,
    }


# ─── API Endpoints ───

@app.get("/")
def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "mantle_connected": contract.is_configured(),
        "signature_verification": settings.VERIFY_SIGNATURE,
    }


@app.post("/api/v1/heartbeat")
async def submit_heartbeat(data: HeartbeatData):
    wallet = data.wallet.lower()
    entry = data.model_dump()
    entry["received_at"] = int(time.time())

    # Signature verification
    sig_valid = verify_heartbeat_sig(wallet, data.timestamp, data.action, data.signature or "")
    if not sig_valid:
        raise HTTPException(status_code=403, detail="Invalid signature — wallet mismatch")

    save_heartbeat(wallet, entry)
    result = _run_analysis(wallet)

    # Submit to contract if possible
    tx_hash = None
    if result.get("status") != "insufficient_data" and contract.is_configured():
        try:
            tx_hash = contract.submit_score(wallet, result["overall_score"])
        except Exception as e:
            log.error("Contract submission error: %s", e)

    # Broadcast via WebSocket
    import asyncio
    asyncio.create_task(ws_manager.broadcast({
        "type": "heartbeat",
        "wallet": wallet,
        "score": result.get("overall_score", 0),
        "status": result.get("status", "unknown"),
        "timestamp": int(time.time()),
    }))

    return {
        "status": "processed",
        "wallet": wallet,
        "heartbeats_count": count_heartbeats(wallet),
        "analysis": result,
        "on_chain_tx": tx_hash,
    }


@app.get("/api/v1/score/{wallet}")
async def get_agent_score(wallet: str):
    wallet = wallet.lower()
    beats = get_heartbeats(wallet)
    latest = get_latest_score(wallet)

    if latest:
        off_chain = {
            "score": latest["overall_score"],
            "status": latest["status"],
            "components": json.loads(latest["components"]) if latest.get("components") else {},
            "last_updated": latest["timestamp"],
        }
    elif len(beats) >= settings.MIN_HEARTBEATS_FOR_SCORING:
        result = _run_analysis(wallet)
        off_chain = {
            "score": result.get("overall_score", 0),
            "status": result.get("status", "unknown"),
            "components": result.get("components", {}),
            "last_updated": result.get("timestamp", 0),
        }
    else:
        off_chain = {
            "score": 0,
            "status": "insufficient_data",
            "components": {},
            "last_updated": 0,
        }

    on_chain_score = None
    on_chain_verified = None
    if contract.is_configured():
        on_chain_score = contract.get_agent_score(wallet)
        on_chain_verified = contract.is_verified_agent(wallet)

    verification = verifier.get_verification_summary(off_chain)

    return {
        "wallet": wallet,
        "off_chain": off_chain,
        "on_chain": {"score": on_chain_score, "verified": on_chain_verified},
        "verification": verification,
    }


@app.get("/api/v1/verify/{wallet}")
async def verify_agent(wallet: str):
    wallet = wallet.lower()
    latest = get_latest_score(wallet)
    beats = get_heartbeats(wallet)

    if latest:
        result = {
            "overall_score": latest["overall_score"],
            "status": latest["status"],
            "components": json.loads(latest["components"]) if latest.get("components") else {},
            "timestamp": latest["timestamp"],
        }
    elif len(beats) >= settings.MIN_HEARTBEATS_FOR_SCORING:
        result = _run_analysis(wallet)
    else:
        return {
            "wallet": wallet,
            "is_verified_agent": False,
            "verdict": "PENDING",
            "message": "No data available for this wallet",
        }

    return {
        "wallet": wallet,
        "is_verified_agent": verifier.is_verified(result),
        "verdict": verifier.get_verification_summary(result)["verdict"],
        "badge": verifier.get_verification_summary(result)["badge"],
        "score": result["overall_score"],
        "threshold": settings.SCORE_VERIFICATION_THRESHOLD,
        "status": result["status"],
        "heartbeats_count": len(beats),
    }


@app.get("/api/v1/agents")
async def list_agents(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    agents_list, total = get_agent_list(page, limit)
    return {
        "agents": agents_list,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": max(1, (total + limit - 1) // limit),
    }


@app.get("/api/v1/score-history/{wallet}")
async def get_score_history_endpoint(wallet: str):
    wallet = wallet.lower()
    history = get_score_history(wallet)
    if not history:
        beats = get_heartbeats(wallet)
        if not beats:
            raise HTTPException(status_code=404, detail=f"No data found for wallet {wallet}")
    latest = get_latest_score(wallet) or {}
    return ScoreHistoryResponse(
        wallet=wallet,
        history=[ScoreRecord(**h) for h in history],
        current_score=latest.get("overall_score", 0),
        current_status=latest.get("status", "no_data"),
    )


@app.post("/api/v1/register")
async def register_agent_endpoint(registration: dict):
    wallet = registration.get("wallet", "").lower()
    token_id = registration.get("token_id", 0)
    if not wallet:
        raise HTTPException(status_code=400, detail="wallet is required")
    register_agent(wallet, token_id)
    return {"status": "registered", "wallet": wallet, "token_id": token_id}


@app.get("/api/v1/report/{wallet}")
async def get_agent_report(wallet: str):
    """Generate a plain-text report for an agent (downloadable)."""
    wallet = wallet.lower()
    latest = get_latest_score(wallet)
    beats = get_heartbeats(wallet)
    history = get_score_history(wallet)

    if not beats:
        raise HTTPException(status_code=404, detail=f"No data found for wallet {wallet}")

    score = latest["overall_score"] if latest else 0
    status = latest["status"] if latest else "no_data"
    verified = "YES" if (score >= 70 and status == "verified_agent") else "NO"

    lines = [
        "=" * 56,
        "  PROOF-OF-TURING — AGENT VERIFICATION REPORT",
        "=" * 56,
        "",
        f"  Wallet:        {wallet}",
        f"  Agentic Score: {score}/100",
        f"  Status:        {status.replace('_', ' ').title()}",
        f"  Verified AI:   {verified}",
        f"  Heartbeats:    {len(beats)}",
        f"  Generated:     {datetime.now().isoformat()}",
        "",
        "-" * 56,
        "  COMPONENT BREAKDOWN",
        "-" * 56,
        "",
    ]

    if latest and latest.get("components"):
        comps = json.loads(latest["components"])
        for name, comp in comps.items():
            cscore = comp.get("score", 0)
            confidence = comp.get("confidence", "--")
            lines.append(f"  {name.replace('_', ' ').title():20s}  {cscore:3d}/100  (confidence: {confidence})")
    else:
        lines.append("  No component data available.")

    lines += [
        "",
        "-" * 56,
        "  SCORE HISTORY",
        "-" * 56,
        "",
    ]
    for h in history[-20:]:
        lines.append(f"  {datetime.fromtimestamp(h['timestamp']).isoformat():26s}  Score: {h['score']:3d}/100")

    lines += [
        "",
        "=" * 56,
        "  Report generated by Proof-of-Turing Oracle",
        "  https://github.com/antidumpalways/Proof-Of-Turing",
        "=" * 56,
    ]

    return PlainTextResponse("\n".join(lines), headers={
        "Content-Disposition": f'attachment; filename="pot-report-{wallet[:8]}.txt"',
    })


# ─── WebSocket ───

@app.websocket("/api/v1/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws_manager.connect(ws)
    try:
        while True:
            await ws.receive_text()  # keep connection alive
    except WebSocketDisconnect:
        ws_manager.disconnect(ws)


# ─── Main Entrypoint ───

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
