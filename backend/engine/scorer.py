"""
Score Aggregator.

Aggregates scores from all analyzers into a single agentic score (0-100).
Now includes ML-based scoring and RepScore calculation.

Thresholds (aligned with TripwireRegistry contract):
- Score >= 70: Confirmed AI Agent (Verified)
- Score >= 60: Likely AI Agent (Pending verification)
- Score >= 40: Uncertain (Needs more data)
- Score < 40: Likely Human / Script (Rejected)
"""
from typing import Dict, Any, List
import time

from config import settings
from analyzers.ml_model import AgentClassifier


class ScoreAggregator:
    """Aggregate component scores into a final agentic score, including ML."""

    def __init__(self):
        self.weights = {
            "time_entropy": settings.TIME_ENTROPY_WEIGHT,
            "response_time": settings.RESPONSE_TIME_WEIGHT,
            "decision_pattern": settings.DECISION_PATTERN_WEIGHT,
            "data_access": settings.DATA_ACCESS_WEIGHT,
            "ml_classifier": settings.ML_CLASSIFIER_WEIGHT,
        }

        self.verification_threshold = settings.SCORE_VERIFICATION_THRESHOLD
        self.ml_classifier = AgentClassifier()

    def aggregate(
        self,
        component_scores: Dict[str, dict],
        heartbeats: List[dict] = None,
    ) -> dict:
        """Aggregate component scores into a final score."""
        total_weight = 0.0
        weighted_sum = 0.0
        component_details = {}

        for analyzer_name, result in component_scores.items():
            weight = self.weights.get(analyzer_name, 0)

            if result.get("score", 0) > 0 and result.get("confidence") != "low":
                weighted_sum += result["score"] * weight
                total_weight += weight

            component_details[analyzer_name] = result

        ml_result = None
        if heartbeats and len(heartbeats) >= 3:
            try:
                ml_result = self.ml_classifier.predict(heartbeats)
                if ml_result.get("is_trained") and ml_result.get("ml_score", 0) > 0:
                    ml_score = ml_result["ml_score"]
                    ml_weight = self.weights.get("ml_classifier", 0.20)
                    weighted_sum += ml_score * ml_weight
                    total_weight += ml_weight
                    component_details["ml_classifier"] = {
                        "score": ml_score,
                        "confidence": "high",
                        "details": {
                            "label": ml_result.get("ml_label"),
                            "confidence": ml_result.get("ml_confidence"),
                            "ml_score": ml_score,
                        }
                    }
            except Exception as e:
                print(f"ML scoring error: {e}")

        if total_weight == 0:
            return {
                "overall_score": 0,
                "status": "insufficient_data",
                "components": component_details,
                "timestamp": int(time.time()),
            }

        overall_score = int(round(weighted_sum / total_weight))

        if overall_score >= self.verification_threshold:
            status = "verified_agent"
        elif overall_score >= 60:
            status = "likely_agent"
        elif overall_score >= 40:
            status = "uncertain"
        else:
            status = "likely_human"

        overall_score = max(0, min(100, overall_score))

        return {
            "overall_score": overall_score,
            "status": status,
            "components": component_details,
            "timestamp": int(time.time()),
            "ml_enabled": self.ml_classifier.is_trained,
        }


class RepScoreEngine:
    """Calculate reputation score from 4 dimensions."""

    def __init__(self):
        self.weights = {
            "compliance_rate": settings.REPScore_COMPLIANCE_WEIGHT,
            "performance_roi": settings.REPScore_ROI_WEIGHT,
            "community_rating": settings.REPScore_COMMUNITY_WEIGHT,
            "liveliness": settings.REPScore_LIVELINESS_WEIGHT,
        }

    def calculate(
        self,
        compliance_rate: float,
        performance_roi: float,
        community_rating: float,
        liveliness: float,
    ) -> dict:
        """Calculate RepScore from 4 dimensions (0-100 each)."""
        score = (
            compliance_rate * self.weights["compliance_rate"] +
            performance_roi * self.weights["performance_roi"] +
            community_rating * self.weights["community_rating"] +
            liveliness * self.weights["liveliness"]
        )
        score = round(min(max(score, 0), 100), 2)

        return {
            "rep_score": score,
            "components": {
                "compliance_rate": compliance_rate,
                "performance_roi": performance_roi,
                "community_rating": community_rating,
                "liveliness": liveliness,
            },
            "weights": self.weights,
            "timestamp": int(time.time()),
        }

    def get_threat_level(self, risk_score: int) -> str:
        """Get threat level from risk score."""
        if risk_score >= settings.RISK_QUARANTINE_THRESHOLD:
            return "Critical"
        if risk_score >= settings.RISK_ALERT_THRESHOLD:
            return "High"
        if risk_score >= 40:
            return "Medium"
        if risk_score >= 20:
            return "Low"
        return "None"
