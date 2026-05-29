"""
Verification Engine.

Handles the logic for verifying whether an agent passes the PoT verification.
"""
from typing import Dict, Any
from config import settings


class Verifier:
    """Verify agents based on their scores."""

    def __init__(self):
        self.threshold = settings.SCORE_VERIFICATION_THRESHOLD

    def is_verified(self, score_result: Dict[str, Any]) -> bool:
        """
        Check if an agent is verified based on score result.

        Args:
            score_result: Result from ScoreAggregator.aggregate()

        Returns:
            True if agent is verified, False otherwise
        """
        return (
            score_result.get("overall_score", 0) >= self.threshold
            and score_result.get("status") == "verified_agent"
        )

    def meets_minimum_data(self, score_result: Dict[str, Any]) -> bool:
        """
        Check if there's enough data for meaningful scoring.

        Args:
            score_result: Result from ScoreAggregator.aggregate()

        Returns:
            True if sufficient data exists
        """
        return score_result.get("status") != "insufficient_data"

    def get_verification_summary(self, score_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get a human-readable summary of verification.

        Args:
            score_result: Result from ScoreAggregator.aggregate()

        Returns:
            Dict with verification summary
        """
        score = score_result.get("overall_score", 0)
        status = score_result.get("status", "insufficient_data")

        if self.is_verified(score_result):
            verdict = "PASSED"
            badge = "✅ Verified AI Agent"
        elif status == "likely_agent":
            verdict = "PENDING"
            badge = "⏳ Likely AI Agent (needs more data)"
        elif status == "uncertain":
            verdict = "PENDING"
            badge = "⚠️ Uncertain (insufficient distinguishing data)"
        elif status == "likely_human":
            verdict = "FAILED"
            badge = "❌ Likely Human / Script"
        else:
            verdict = "PENDING"
            badge = "📝 Insufficient Data"

        return {
            "verdict": verdict,
            "badge": badge,
            "score": score,
            "threshold": self.threshold,
            "status": status,
        }
