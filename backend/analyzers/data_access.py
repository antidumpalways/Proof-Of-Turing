"""
Data Access Pattern Analyzer.

Analyzes how an agent accesses on-chain data before making decisions.

Principles:
- Real AI agents: Read on-chain data (prices, pools, balances) before each action,
  variable data sources, context-dependent queries
- Scripts: Fixed data access patterns, may not read data at all (hardcoded values),
  very consistent query patterns
- Humans: May check data sporadically, rely on external sources
"""
from typing import List, Dict, Any
from collections import Counter


class DataAccessAnalyzer:
    """Analyze how the agent accesses on-chain data."""

    def analyze(self, data_accesses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze data access patterns.

        Args:
            data_accesses: List of dicts with:
                - timestamp: when data was accessed
                - data_type: what was accessed (price, pool, balance, history)
                - source: where from (chain, api, cache)
                - followed_by_action: whether an action followed within 60s

        Returns:
            Dict with score, confidence, and details
        """
        if len(data_accesses) < 2:
            return {
                "score": 50,
                "confidence": "low",
                "details": {"message": "Insufficient data access events (need >= 2)"},
            }

        # --- Data Access Frequency Score (0-30 points) ---
        # Real AI agents access data frequently before decisions
        total_accesses = len(data_accesses)
        if total_accesses >= 20:
            freq_score = 30
        elif total_accesses >= 10:
            freq_score = 20 + (total_accesses - 10) / 10 * 10
        elif total_accesses >= 5:
            freq_score = 10 + (total_accesses - 5) / 5 * 10
        else:
            freq_score = total_accesses / 5 * 10

        # --- Data Diversity Score (0-30 points) ---
        data_types = [
            d.get("data_type", "unknown") for d in data_accesses
        ]
        type_counts = Counter(data_types)
        unique_types = len(type_counts)

        if unique_types >= 4:
            diversity_score = 30
        elif unique_types == 3:
            diversity_score = 22
        elif unique_types == 2:
            diversity_score = 12
        else:
            diversity_score = 5

        # --- Action Following Score (0-40 points) ---
        # Real AI agents read data THEN act (not the other way around)
        actions_followed = sum(
            1 for d in data_accesses if d.get("followed_by_action", False)
        )
        action_ratio = actions_followed / total_accesses if total_accesses > 0 else 0

        if action_ratio >= 0.7:
            action_score = 40
            action_reasoning = "High correlation between data access and actions — matches AI behavior"
        elif action_ratio >= 0.4:
            action_score = 25 + (action_ratio - 0.4) / 0.3 * 15
            action_reasoning = "Moderate correlation between data access and actions"
        elif action_ratio >= 0.1:
            action_score = 10 + action_ratio / 0.4 * 15
            action_reasoning = "Low correlation — may be acting without data"
        else:
            action_score = 0
            action_reasoning = "No follow-through on data access — suspicious"

        total_score = int(round(freq_score + diversity_score + action_score))
        total_score = max(0, min(100, total_score))

        if total_accesses >= 15:
            confidence = "high"
        elif total_accesses >= 8:
            confidence = "medium"
        else:
            confidence = "low"

        return {
            "score": total_score,
            "confidence": confidence,
            "details": {
                "data_frequency_score": round(freq_score, 1),
                "data_diversity_score": diversity_score,
                "action_follow_through_score": action_score,
                "total_data_accesses": total_accesses,
                "unique_data_types": unique_types,
                "data_type_distribution": dict(type_counts),
                "action_follow_ratio": round(action_ratio, 2),
                "action_reasoning": action_reasoning,
            },
        }
