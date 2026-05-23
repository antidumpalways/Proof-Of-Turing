"""
Decision Pattern Analyzer.

Analyzes the complexity and diversity of trading/DeFi decisions.

Principles:
- AI agents (LLM-based): Diverse strategy selection, context-dependent decisions,
  varying trade sizes, strategic adaptation
- Simple scripts: Fixed strategy, uniform trade sizes, no adaptation
- Humans: Highly variable but sometimes irrational, emotional biases
"""
import numpy as np
from typing import List, Dict, Any
from collections import Counter


class DecisionPatternAnalyzer:
    """Analyze the diversity and complexity of trading decisions."""

    def analyze(self, decisions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze diversity of trading/DeFi decisions.

        Args:
            decisions: List of dicts with action, asset, amount, strategy_type

        Returns:
            Dict with score, confidence, and details
        """
        if len(decisions) < 3:
            return {
                "score": 50,
                "confidence": "low",
                "details": {"message": "Insufficient decisions (need >= 3)"},
            }

        # --- Strategy Diversity Score (0-40 points) ---
        strategies = [
            d.get("strategy_type", "unknown") for d in decisions
        ]
        strategy_counts = Counter(strategies)
        unique_strategies = len(strategy_counts)
        strategy_diversity = unique_strategies / max(len(strategies), 1)

        if unique_strategies <= 1:
            strategy_score = 0  # Only one strategy = script
            strategy_reasoning = "Single strategy only — likely a simple script"
        elif unique_strategies == 2:
            strategy_score = 15
            strategy_reasoning = "Two strategies — minimal diversity"
        else:
            strategy_score = min(40, 15 + (unique_strategies - 2) * 10)
            strategy_reasoning = f"Multiple strategies ({unique_strategies}) — good diversity"

        # --- Trade Size Variation Score (0-30 points) ---
        amounts = [
            d.get("amount", 0) for d in decisions
            if d.get("amount") is not None and d.get("amount", 0) > 0
        ]

        if len(amounts) >= 3:
            amounts = np.array(amounts)
            mean_amt = float(np.mean(amounts))
            std_amt = float(np.std(amounts))
            cv = std_amt / mean_amt if mean_amt > 0 else 0

            # CV < 0.2: Too uniform = script
            # CV 0.2-0.6: Natural variation = AI
            # CV > 0.6: High variation = human-like
            if cv < 0.2:
                size_score = max(0, cv / 0.2 * 10)
                size_reasoning = "Trade sizes too uniform — suspicious"
            elif cv < 0.6:
                size_score = 10 + (cv - 0.2) / 0.4 * 20
                size_reasoning = "Natural trade size variation — good"
            else:
                size_score = min(30, 30 - (cv - 0.6) * 10)
                size_reasoning = "High trade size variation"
        else:
            size_score = 15
            size_reasoning = "Insufficient trade size data"

        # --- Asset Diversity Score (0-30 points) ---
        assets = [
            d.get("asset", "unknown") for d in decisions
            if d.get("asset") is not None
        ]

        if assets:
            unique_assets = len(set(assets))
            if unique_assets <= 1:
                asset_score = 5
                asset_reasoning = "Single asset only"
            elif unique_assets == 2:
                asset_score = 15
                asset_reasoning = "Two assets"
            else:
                asset_score = min(30, 15 + (unique_assets - 2) * 5)
                asset_reasoning = f"Multiple assets ({unique_assets})"
        else:
            asset_score = 10
            asset_reasoning = "No asset data"

        total_score = int(round(strategy_score + size_score + asset_score))
        total_score = max(0, min(100, total_score))

        if len(decisions) >= 15:
            confidence = "high"
        elif len(decisions) >= 8:
            confidence = "medium"
        else:
            confidence = "low"

        return {
            "score": total_score,
            "confidence": confidence,
            "details": {
                "strategy_diversity_score": strategy_score,
                "trade_size_variation_score": size_score,
                "asset_diversity_score": asset_score,
                "unique_strategies": unique_strategies,
                "strategy_distribution": dict(strategy_counts),
                "unique_assets": len(set(assets)) if assets else 0,
                "total_decisions": len(decisions),
                "strategy_reasoning": strategy_reasoning,
                "size_reasoning": size_reasoning,
                "asset_reasoning": asset_reasoning,
            },
        }
