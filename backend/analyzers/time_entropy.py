"""
Time Entropy Analyzer.

Analyzes the entropy (randomness) of execution timing to distinguish
between humans, AI agents, and scripts.

Principles:
- Humans: irregular timing patterns, natural variation, pauses for thinking/meals/sleep
- AI agents (LLM-based): moderate variation, need 1-10 seconds to "think"
- Scripts/bots: too regular (identical intervals), respond instantly
"""
import numpy as np
from typing import List, Dict, Any


class TimeEntropyAnalyzer:
    """Analyze the entropy of execution timing patterns."""

    def __init__(self):
        # Expected coefficient of variation range for natural AI behavior
        self.expected_cv_range = (0.4, 1.8)

    def analyze(self, timestamps: List[int]) -> Dict[str, Any]:
        """
        Analyze the entropy of a series of timestamps.

        Args:
            timestamps: List of Unix timestamps in chronological order

        Returns:
            Dict with score, confidence, and details
        """
        if len(timestamps) < 3:
            return {
                "score": 0,
                "confidence": "low",
                "details": {"message": "Insufficient data points (need >= 3)"},
            }

        # Calculate time differences between consecutive actions
        deltas = np.diff(sorted(timestamps))

        # Filter out zero deltas (duplicate timestamps)
        deltas = deltas[deltas > 0]

        if len(deltas) < 2:
            return {
                "score": 0,
                "confidence": "low",
                "details": {"message": "Not enough unique timestamps"},
            }

        # Calculate statistics
        mean_delta = float(np.mean(deltas))
        std_delta = float(np.std(deltas))
        cv = std_delta / mean_delta if mean_delta > 0 else 0

        # Calculate entropy score based on coefficient of variation (CV)
        # CV = std/mean — measures regularity of intervals
        #
        # CV < 0.2: Too regular = script/bot (low score)
        # CV 0.2-0.4: Somewhat regular = simple script (low-medium score)
        # CV 0.4-0.8: Natural variation = AI agent (high score)
        # CV 0.8-1.8: High variation = AI or human (medium-high score)
        # CV > 1.8: Very erratic = human or buggy AI (low score)

        if cv < 0.2:
            # Extremely regular — definitely a script
            score = max(0, 100 - (0.2 - cv) * 500)
            reasoning = "Too regular — pattern matches script/bot behavior"
        elif cv < 0.4:
            # Somewhat regular — likely a simple script
            score = 30 + (cv - 0.2) / 0.2 * 30
            reasoning = "Somewhat regular — possible script with minimal variation"
        elif cv < 0.8:
            # Natural variation — likely an AI agent
            score = 60 + (cv - 0.4) / 0.4 * 30
            reasoning = "Natural timing variation — matches AI agent behavior"
        elif cv < 1.8:
            # Higher variation — could be AI or human
            score = 90 - (cv - 0.8) / 1.0 * 30
            reasoning = "Higher variation — could be AI or human, needs more data"
        else:
            # Very erratic — likely human
            score = max(0, 60 - (cv - 1.8) * 20)
            reasoning = "Very erratic timing — likely human operator"

        # Clamp score to 0-100
        score = max(0, min(100, int(round(score))))

        # Determine confidence level
        if len(timestamps) >= 10:
            confidence = "high"
        elif len(timestamps) >= 5:
            confidence = "medium"
        else:
            confidence = "low"

        return {
            "score": score,
            "confidence": confidence,
            "details": {
                "coefficient_of_variation": round(cv, 4),
                "mean_interval_seconds": round(mean_delta, 2),
                "std_interval_seconds": round(std_delta, 2),
                "data_points": len(timestamps),
                "unique_intervals": len(deltas),
                "reasoning": reasoning,
            },
        }
