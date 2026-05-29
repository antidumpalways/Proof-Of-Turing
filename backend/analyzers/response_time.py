"""
Response Time Analyzer.

Analyzes how quickly the agent responds to market events.

Principles:
- AI agents (LLM-based): Need 1-10 seconds to "think", variable response times
- Scripts/bots: Respond in milliseconds, very consistent, may front-run events
- Humans: Respond in seconds to minutes, highly variable
"""
import numpy as np
from typing import List, Dict, Any


class ResponseTimeAnalyzer:
    """Analyze how quickly an agent responds to market events."""

    def __init__(self):
        # Ideal AI response time range in seconds
        self.ideal_range = (1.0, 8.0)

    def analyze(self, events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze response times to market events.

        Args:
            events: List of dicts with event_timestamp, response_timestamp, event_type

        Returns:
            Dict with score, confidence, and details
        """
        if len(events) < 2:
            return {
                "score": 50,
                "confidence": "low",
                "details": {"message": "Insufficient response events (need >= 2)"},
            }

        response_times = []
        for event in events:
            event_ts = event.get("event_timestamp")
            response_ts = event.get("response_timestamp")
            if event_ts is not None and response_ts is not None:
                rt = response_ts - event_ts
                if rt >= 0:  # Filter out impossible negative response times
                    response_times.append(rt)

        if len(response_times) < 2:
            return {
                "score": 50,
                "confidence": "low",
                "details": {"message": "Not enough valid response events"},
            }

        response_times = np.array(response_times)
        mean_rt = float(np.mean(response_times))
        std_rt = float(np.std(response_times))
        min_rt = float(np.min(response_times))
        max_rt = float(np.max(response_times))

        # Score based on mean response time
        #
        # < 0.5 seconds: Too fast = script/bot (low score, suspicious)
        # 0.5-1.0 seconds: Very fast = likely script (low-medium)
        # 1.0-3.0 seconds: Fast but natural = AI agent (high score)
        # 3.0-8.0 seconds: Normal thinking = AI agent (high score)
        # 8.0-30.0 seconds: Slow = could be AI or human (medium score)
        # > 30.0 seconds: Very slow = likely human (low score)

        if mean_rt < 0.5:
            score = max(0, 20 - (0.5 - mean_rt) * 40)
            reasoning = "Sub-second response — likely a script/bot"
        elif mean_rt < 1.0:
            score = 20 + (mean_rt - 0.5) / 0.5 * 30
            reasoning = "Very fast response — possible simple script"
        elif mean_rt < 3.0:
            score = 50 + (mean_rt - 1.0) / 2.0 * 40
            reasoning = "Fast, natural response time — matches AI agent"
        elif mean_rt < 8.0:
            score = 90 - (mean_rt - 3.0) / 5.0 * 20
            reasoning = "Normal thinking time — matches AI agent behavior"
        elif mean_rt < 30.0:
            score = 70 - (mean_rt - 8.0) / 22.0 * 30
            reasoning = "Slow response — could be AI processing or human"
        else:
            score = max(0, 40 - (mean_rt - 30.0) / 30.0 * 40)
            reasoning = "Very slow response — likely human operator"

        # Penalize for zero-variance (exact same response time every time = script)
        if std_rt < 0.1 and len(response_times) > 3:
            score = max(0, score - 30)
            reasoning += " [SUSPICIOUS: zero variance in response times]"

        score = max(0, min(100, int(round(score))))

        if len(events) >= 10:
            confidence = "high"
        elif len(events) >= 5:
            confidence = "medium"
        else:
            confidence = "low"

        return {
            "score": score,
            "confidence": confidence,
            "details": {
                "mean_response_time_seconds": round(mean_rt, 2),
                "std_response_time_seconds": round(std_rt, 2),
                "min_response_time_seconds": round(min_rt, 2),
                "max_response_time_seconds": round(max_rt, 2),
                "data_points": len(response_times),
                "reasoning": reasoning,
            },
        }
