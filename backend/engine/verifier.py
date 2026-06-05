"""
Verification Engine.

Handles the logic for verifying whether an agent passes the Tripwire verification.
Includes GuardVerifier for risk-aware verification.
"""
from typing import Dict, Any
from config import settings


class Verifier:
    """Verify agents based on their scores."""

    def __init__(self):
        self.threshold = settings.SCORE_VERIFICATION_THRESHOLD

    def is_verified(self, score_result: Dict[str, Any]) -> bool:
        """Check if an agent is verified based on score result."""
        return (
            score_result.get("overall_score", 0) >= self.threshold
            and score_result.get("status") == "verified_agent"
        )

    def meets_minimum_data(self, score_result: Dict[str, Any]) -> bool:
        """Check if there's enough data for meaningful scoring."""
        return score_result.get("status") != "insufficient_data"

    def get_verification_summary(self, score_result: Dict[str, Any]) -> Dict[str, Any]:
        """Get a human-readable summary of verification."""
        score = score_result.get("overall_score", 0)
        status = score_result.get("status", "insufficient_data")

        if self.is_verified(score_result):
            verdict = "PASSED"
            badge = "Verified AI Agent"
        elif status == "likely_agent":
            verdict = "PENDING"
            badge = "Likely AI Agent (needs more data)"
        elif status == "uncertain":
            verdict = "PENDING"
            badge = "Uncertain (insufficient distinguishing data)"
        elif status == "likely_human":
            verdict = "FAILED"
            badge = "Likely Human / Script"
        else:
            verdict = "PENDING"
            badge = "Insufficient Data"

        return {
            "verdict": verdict,
            "badge": badge,
            "score": score,
            "threshold": self.threshold,
            "status": status,
        }


class GuardVerifier:
    """Risk-aware verification for Tripwire."""

    def __init__(self):
        self.threshold = settings.SCORE_VERIFICATION_THRESHOLD
        self.quarantine_threshold = settings.RISK_QUARANTINE_THRESHOLD
        self.alert_threshold = settings.RISK_ALERT_THRESHOLD

    def is_verified(self, score_result: Dict[str, Any], guard_status: Dict[str, Any] = None) -> bool:
        """Check if agent is verified and not quarantined."""
        if guard_status and guard_status.get("is_quarantined", False):
            return False
        return (
            score_result.get("overall_score", 0) >= self.threshold
            and score_result.get("status") == "verified_agent"
        )

    def is_quarantined(self, guard_status: Dict[str, Any]) -> bool:
        """Check if agent is quarantined."""
        return guard_status.get("is_quarantined", False) if guard_status else False

    def get_threat_level(self, risk_score: int) -> str:
        """Get threat level string from risk score."""
        if risk_score >= self.quarantine_threshold:
            return "Critical"
        if risk_score >= self.alert_threshold:
            return "High"
        if risk_score >= 40:
            return "Medium"
        if risk_score >= 20:
            return "Low"
        return "None"

    def should_auto_quarantine(self, risk_score: int) -> bool:
        """Check if agent should be auto-quarantined."""
        return risk_score >= self.quarantine_threshold

    def get_risk_summary(self, risk_score: int, guard_status: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get human-readable risk summary."""
        threat_level = self.get_threat_level(risk_score)
        quarantined = self.is_quarantined(guard_status)

        if quarantined:
            verdict = "QUARANTINED"
            badge = "Agent quarantined — immediate action required"
        elif threat_level == "Critical":
            verdict = "CRITICAL"
            badge = "Critical threat detected — auto-quarantine recommended"
        elif threat_level == "High":
            verdict = "HIGH_RISK"
            badge = "High risk — enhanced monitoring active"
        elif threat_level == "Medium":
            verdict = "ELEVATED"
            badge = "Elevated risk — monitoring"
        elif threat_level == "Low":
            verdict = "LOW"
            badge = "Low risk — normal operations"
        else:
            verdict = "CLEAR"
            badge = "No threats detected"

        return {
            "verdict": verdict,
            "badge": badge,
            "risk_score": risk_score,
            "threat_level": threat_level,
            "quarantined": quarantined,
            "threshold": self.quarantine_threshold,
        }

    def calculate_rep_score(
        self,
        compliance_rate: float,
        performance_roi: float,
        community_rating: float,
        liveliness: float,
    ) -> float:
        """Calculate RepScore from 4 dimensions (0-100)."""
        from config import settings
        score = (
            compliance_rate * settings.REPScore_COMPLIANCE_WEIGHT +
            performance_roi * settings.REPScore_ROI_WEIGHT +
            community_rating * settings.REPScore_COMMUNITY_WEIGHT +
            liveliness * settings.REPScore_LIVELINESS_WEIGHT
        )
        return round(min(max(score, 0), 100), 2)
