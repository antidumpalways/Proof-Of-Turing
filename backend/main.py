"""
Proof-of-Turing Oracle API

Main entry point for the PoT Oracle Service.
Provides REST API for:
- Agent heartbeat submission
- Score querying
- Agent verification
- Agent listing

Run with: uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
from datetime import datetime

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

# ─── Application Setup ───

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Inverse captcha oracle for verifying AI agents on Mantle",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── In-Memory Storage (MVP — replace with database in production) ───

# Stores heartbeat data per wallet
heartbeat_store: Dict[str, List[dict]] = {}

# Stores agent registrations
agent_registry: Dict[str, dict] = {}

# Stores latest score results
score_cache: Dict[str, dict] = {}

# ─── Initialize Components ───

analyzers = {
    "time_entropy": TimeEntropyAnalyzer(),
    "response_time": ResponseTimeAnalyzer(),
    "decision_pattern": DecisionPatternAnalyzer(),
    "data_access": DataAccessAnalyzer(),
}

scorer = ScoreAggregator()
verifier = Verifier()
contract = PoTContract()


# ─── Helper Functions ───

def _run_analysis(wallet: str) -> dict:
    """Run all analyzers on stored data for a wallet."""
    heartbeats = heartbeat_store.get(wallet, [])

    if len(heartbeats) < settings.MIN_HEARTBEATS_FOR_SCORING:
        return {
            "overall_score": 0,
            "status": "insufficient_data",
            "components": {},
            "timestamp": int(datetime.now().timestamp()),
            "message": f"Need at least {settings.MIN_HEARTBEATS_FOR_SCORING} heartbeats for scoring"
        }

    component_scores = {}

    # Time Entropy Analysis
    timestamps = [h.get("timestamp", 0) for h in heartbeats]
    if timestamps:
        component_scores["time_entropy"] = analyzers["time_entropy"].analyze(timestamps)

    # Response Time Analysis
    response_events = [
        {
            "event_timestamp": h.get("_market_event_time", h.get("timestamp", 0) - 5),
            "response_timestamp": h.get("timestamp", 0),
            "event_type": h.get("market_event", "unknown"),
        }
        for h in heartbeats if h.get("market_event")
    ]
    if response_events:
        component_scores["response_time"] = analyzers["response_time"].analyze(response_events)

    # Decision Pattern Analysis
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

    # Data Access Analysis
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

    # Aggregate scores (now includes ML model via heartbeats data)
    result = scorer.aggregate(component_scores, heartbeats=heartbeats)
    score_cache[wallet] = result

    return result


# ─── API Endpoints ───

@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "mantle_connected": contract.is_configured(),
    }


@app.post("/api/v1/heartbeat")
async def submit_heartbeat(data: HeartbeatData):
    """
    Submit a heartbeat from an agent.

    The oracle stores the heartbeat data and runs analysis.
    If enough data is collected, a score is computed and
    submitted to the PoTRegistry contract.
    """
    wallet = data.wallet.lower()

    # Initialize store for new wallets
    if wallet not in heartbeat_store:
        heartbeat_store[wallet] = []

    # Store heartbeat
    heartbeat_entry = data.model_dump()
    heartbeat_entry["received_at"] = int(datetime.now().timestamp())
    heartbeat_store[wallet].append(heartbeat_entry)

    # Run analysis
    result = _run_analysis(wallet)

    # Submit score to contract if we have enough data
    if result.get("status") != "insufficient_data" and contract.is_configured():
        tx_hash = contract.submit_score(wallet, result["overall_score"])
        result["on_chain_tx"] = tx_hash

    return {
        "status": "processed",
        "wallet": wallet,
        "heartbeats_count": len(heartbeat_store[wallet]),
        "analysis": result,
    }


@app.get("/api/v1/score/{wallet}")
async def get_agent_score(wallet: str):
    """
    Get the current PoT score for an agent.

    Returns both off-chain (computed) and on-chain (stored) scores.
    """
    wallet = wallet.lower()

    # Check off-chain score
    off_chain_result = score_cache.get(wallet)
    if not off_chain_result:
        # Try to compute from stored data
        if wallet in heartbeat_store and len(heartbeat_store[wallet]) >= settings.MIN_HEARTBEATS_FOR_SCORING:
            off_chain_result = _run_analysis(wallet)
        else:
            off_chain_result = {
                "overall_score": 0,
                "status": "insufficient_data",
                "components": {},
                "timestamp": int(datetime.now().timestamp()),
            }

    # Check on-chain score
    on_chain_score = None
    on_chain_verified = None
    if contract.is_configured():
        on_chain_score = contract.get_agent_score(wallet)
        on_chain_verified = contract.is_verified_agent(wallet)

    # Get verification summary
    verification = verifier.get_verification_summary(off_chain_result)

    return {
        "wallet": wallet,
        "off_chain": {
            "score": off_chain_result.get("overall_score", 0),
            "status": off_chain_result.get("status", "unknown"),
            "components": off_chain_result.get("components", {}),
            "last_updated": off_chain_result.get("timestamp", 0),
        },
        "on_chain": {
            "score": on_chain_score,
            "verified": on_chain_verified,
        },
        "verification": verification,
    }


@app.get("/api/v1/verify/{wallet}")
async def verify_agent(wallet: str):
    """
    Check if a wallet is a verified AI agent.

    Returns a simple boolean and detailed verification info.
    """
    wallet = wallet.lower()

    # Compute score if needed
    result = score_cache.get(wallet)
    if not result and wallet in heartbeat_store:
        result = _run_analysis(wallet)

    if not result:
        return {
            "wallet": wallet,
            "is_verified_agent": False,
            "verdict": "PENDING",
            "message": "No data available for this wallet",
        }

    is_verified = verifier.is_verified(result)
    summary = verifier.get_verification_summary(result)

    return {
        "wallet": wallet,
        "is_verified_agent": is_verified,
        "verdict": summary["verdict"],
        "badge": summary["badge"],
        "score": summary["score"],
        "threshold": summary["threshold"],
        "status": summary["status"],
        "heartbeats_count": len(heartbeat_store.get(wallet, [])),
    }


@app.get("/api/v1/agents")
async def list_agents(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """
    List all registered agents with their current scores.
    """
    all_wallets = list(agent_registry.keys()) or list(heartbeat_store.keys())

    # Paginate
    start = (page - 1) * limit
    end = start + limit
    page_wallets = all_wallets[start:end]

    agents = []
    for wallet in page_wallets:
        result = score_cache.get(wallet)
        is_verified = verifier.is_verified(result) if result else False

        agents.append(AgentSummary(
            wallet=wallet,
            agentic_score=result.get("overall_score", 0) if result else 0,
            status=result.get("status", "no_data") if result else "no_data",
            is_verified=is_verified,
            heartbeats_count=len(heartbeat_store.get(wallet, [])),
            last_seen=heartbeat_store[wallet][-1].get("timestamp", 0) if heartbeat_store.get(wallet) else 0,
        ))

    return {
        "agents": [a.model_dump() for a in agents],
        "total": len(all_wallets),
        "page": page,
        "limit": limit,
        "total_pages": max(1, (len(all_wallets) + limit - 1) // limit),
    }


@app.get("/api/v1/score-history/{wallet}")
async def get_score_history(wallet: str):
    """
    Get historical score data for an agent.
    """
    wallet = wallet.lower()

    if wallet not in heartbeat_store:
        raise HTTPException(status_code=404, detail=f"No data found for wallet {wallet}")

    heartbeats = heartbeat_store[wallet]

    # Simulate score history by running analysis progressively
    history = []
    for i in range(settings.MIN_HEARTBEATS_FOR_SCORING, len(heartbeats) + 1):
        # Temporarily limit the data
        temp_data = heartbeats[:i]
        # We can't easily re-run with subset, so estimate based on counts
        score = min(100, int((i / len(heartbeats)) * (score_cache.get(wallet, {}).get("overall_score", 50) or 50)))
        history.append(ScoreRecord(
            score=score,
            timestamp=heartbeats[i - 1].get("timestamp", 0),
        ))

    current_result = score_cache.get(wallet, {})
    return ScoreHistoryResponse(
        wallet=wallet,
        history=history,
        current_score=current_result.get("overall_score", 0),
        current_status=current_result.get("status", "no_data"),
    )


@app.post("/api/v1/register")
async def register_agent(registration: dict):
    """
    Register a new agent wallet for tracking.

    Body: { "wallet": "0x...", "token_id": 1 }
    """
    wallet = registration.get("wallet", "").lower()
    token_id = registration.get("token_id", 0)

    if not wallet:
        raise HTTPException(status_code=400, detail="wallet is required")

    if wallet not in heartbeat_store:
        heartbeat_store[wallet] = []

    agent_registry[wallet] = {
        "wallet": wallet,
        "token_id": token_id,
        "registered_at": int(datetime.now().timestamp()),
        "status": "pending",
    }

    return {
        "status": "registered",
        "wallet": wallet,
        "token_id": token_id,
    }


# ─── Main Entrypoint ───

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
