"""
Score Aggregator.

Aggregates scores from all analyzers into a single agentic score (0-100).
Now includes ML-based scoring as an additional dimension.

Thresholds:
- Score >= 80: Confirmed AI Agent (Verified)
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
        # Weights for each analyzer
        self.weights = {
            "time_entropy": settings.TIME_ENTROPY_WEIGHT,
            "response_time": settings.RESPONSE_TIME_WEIGHT,
            "decision_pattern": settings.DECISION_PATTERN_WEIGHT,
            "data_access": settings.DATA_ACCESS_WEIGHT,
            "ml_classifier": 0.20,  # ML model gets 20% weight
        }

        # Thresholds
        self.verification_threshold = settings.SCORE_VERIFICATION_THRESHOLD

        # ML Classifier
        self.ml_classifier = AgentClassifier()

    def aggregate(
        self,
        component_scores: Dict[str, dict],
        heartbeats: List[dict] = None,
    ) -> dict:
        """
        Aggregate component scores into a final score.

        Args:
            component_scores: Dict of analyzer_name -> analyzer result dict
            heartbeats: Raw heartbeat data for ML model (optional)

        Returns:
            Dict with overall_score, status, components breakdown
        """
        total_weight = 0.0
        weighted_sum = 0.0
        component_details = {}

        # Process rule-based analyzers
        for analyzer_name, result in component_scores.items():
            weight = self.weights.get(analyzer_name, 0)

            # Only include analyzers with sufficient confidence
            if result.get("score", 0) > 0 and result.get("confidence") != "low":
                weighted_sum += result["score"] * weight
                total_weight += weight

            component_details[analyzer_name] = result

        # Add ML classifier score if data available
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

        # If insufficient data from all analyzers
        if total_weight == 0:
            return {
                "overall_score": 0,
                "status": "insufficient_data",
                "components": component_details,
                "timestamp": int(time.time()),
            }

        # Calculate weighted score
        overall_score = int(round(weighted_sum / total_weight))

        # Determine status
        if overall_score >= 80:
            status = "verified_agent"
        elif overall_score >= 60:
            status = "likely_agent"
        elif overall_score >= 40:
            status = "uncertain"
        else:
            status = "likely_human"

        # Clamp score
        overall_score = max(0, min(100, overall_score))

        return {
            "overall_score": overall_score,
            "status": status,
            "components": component_details,
            "timestamp": int(time.time()),
            "ml_enabled": self.ml_classifier.is_trained,
        }
