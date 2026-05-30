"""Pydantic models for agent data."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class HeartbeatData(BaseModel):
    """Data sent by an agent as a heartbeat signal."""
    wallet: str = Field(..., description="Agent wallet address")
    timestamp: int = Field(..., description="Unix timestamp of the heartbeat")
    action: str = Field(
        ...,
        description="Type of action: trade, swap, add_liquidity, remove_liquidity, check_balance"
    )
    tx_hash: Optional[str] = Field(None, description="Transaction hash if applicable")
    gas_used: Optional[int] = Field(None, description="Gas used for the transaction")
    block_number: Optional[int] = Field(None, description="Block number of the transaction")
    market_event: Optional[str] = Field(
        None, description="Market event being responded to, if any"
    )
    strategy_type: Optional[str] = Field(
        None, description="Strategy type used: grid, trend, mean_reversion, arb, yield"
    )
    asset: Optional[str] = Field(None, description="Asset involved: MNT, mETH, USDY, fBTC")
    amount: Optional[float] = Field(None, description="Amount of asset involved")
    signature: Optional[str] = Field(
        None, description="EIP-191 signed message for wallet verification"
    )
    source: Optional[str] = Field(
        "direct", description="Source of heartbeat: direct, integration"
    )


class AgentRegistration(BaseModel):
    """Data for registering a new agent."""
    wallet: str
    token_id: int
    timestamp: int


class AgentStatus(str):
    """Agent verification status."""
    UNVERIFIED = "unverified"
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class AgentInfo(BaseModel):
    """Full agent information returned from the registry."""
    wallet: str
    erc8004_token_id: int
    status: str
    agentic_score: int
    last_heartbeat: int
    heartbeats_count: int
    verification_timestamp: int
    last_score_update: int


class AgentSummary(BaseModel):
    """Summary of agent for list views."""
    wallet: str
    agentic_score: int
    status: str
    is_verified: bool
    heartbeats_count: int
    last_seen: int
