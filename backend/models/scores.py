"""Pydantic models for scoring data."""

from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from datetime import datetime


class ComponentScore(BaseModel):
    """Score from a single analyzer component."""
    score: int = Field(..., ge=0, le=100, description="Component score 0-100")
    confidence: str = Field(..., description="low, medium, high")
    details: Dict[str, Any] = Field(
        default_factory=dict, description="Detailed breakdown"
    )


class AgentScore(BaseModel):
    """Complete score for an agent."""
    wallet: str
    overall_score: int = Field(..., ge=0, le=100)
    status: str = Field(
        ..., description="verified_agent, likely_agent, uncertain, likely_human, insufficient_data"
    )
    components: Dict[str, ComponentScore]
    timestamp: int


class ScoreRecord(BaseModel):
    """A single score record from history."""
    score: int
    timestamp: int


class ScoreHistoryResponse(BaseModel):
    """Score history for an agent."""
    wallet: str
    history: List[ScoreRecord]
    current_score: int
    current_status: str
