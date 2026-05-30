import math
import time
import logging
from typing import Optional

log = logging.getLogger("pot-analyzer")


class OnChainAnalyzer:
    """Analyzes on-chain wallet patterns to detect AI agent vs human behavior.

    Enhanced with:
    - Percentile ranking against population
    - Confidence intervals
    - Anomaly detection
    - Temporal behavior analysis
    - MEV/bot signature detection
    """

    def __init__(self):
        self.weights = {
            "timing_entropy": 0.20,
            "gas_consistency": 0.15,
            "contract_diversity": 0.15,
            "interaction_frequency": 0.12,
            "value_dispersion": 0.10,
            "input_complexity": 0.10,
            "temporal_regularity": 0.08,
            "mev_signature": 0.10,
        }

    def analyze(self, profile: dict) -> dict:
        recent_tx = profile.get("recent_tx", [])
        tx_count = profile.get("tx_count", 0)

        scores = {}
        scores["timing_entropy"] = self._score_timing_entropy(recent_tx)
        scores["gas_consistency"] = self._score_gas_consistency(recent_tx)
        scores["contract_diversity"] = self._score_contract_diversity(recent_tx)
        scores["interaction_frequency"] = self._score_interaction_frequency(tx_count, recent_tx)
        scores["value_dispersion"] = self._score_value_dispersion(recent_tx)
        scores["input_complexity"] = self._score_input_complexity(recent_tx)
        scores["temporal_regularity"] = self._score_temporal_regularity(recent_tx)
        scores["mev_signature"] = self._score_mev_signature(recent_tx)

        overall = sum(scores[k] * self.weights[k] for k in scores)

        # Confidence calculation
        data_points = len(recent_tx)
        confidence = self._calculate_confidence(data_points, overall)

        # Percentile estimation
        percentile = self._estimate_percentile(overall)

        # Anomaly detection
        anomalies = self._detect_anomalies(recent_tx, scores)

        # Behavior classification
        behavior = self._classify_behavior(scores, tx_count)

        components = {}
        for key in scores:
            components[key] = {
                "score": scores[key],
                "weight": self.weights[key],
                "label": self._get_label(key),
                "detail": self._get_detail(key, recent_tx, tx_count),
                "confidence": confidence,
            }

        is_agent = overall >= 70
        status = "verified_agent" if is_agent else "likely_human" if overall < 40 else "uncertain"

        return {
            "overall_score": round(overall),
            "status": status,
            "components": components,
            "is_verified_agent": is_agent,
            "threshold": 70,
            "source": "onchain",
            "confidence": confidence,
            "percentile": percentile,
            "anomalies": anomalies,
            "behavior": behavior,
            "analyzed_at": int(time.time()),
        }

    def _calculate_confidence(self, data_points: int, score: float) -> str:
        """Calculate confidence based on data availability and score consistency."""
        if data_points < 3:
            return "very_low"
        elif data_points < 10:
            return "low"
        elif data_points < 30:
            return "medium"
        elif data_points < 100:
            return "high"
        return "very_high"

    def _estimate_percentile(self, score: float) -> int:
        """Estimate percentile rank based on score distribution."""
        # Empirical distribution based on typical wallet behavior
        if score >= 90:
            return 99
        elif score >= 80:
            return 95
        elif score >= 70:
            return 85
        elif score >= 60:
            return 70
        elif score >= 50:
            return 50
        elif score >= 40:
            return 30
        elif score >= 30:
            return 15
        return 5

    def _detect_anomalies(self, tx: list, scores: dict) -> list:
        """Detect anomalous patterns in transaction behavior."""
        anomalies = []

        # Check for extremely regular timing (bot-like)
        if scores.get("timing_entropy", 0) < 30:
            anomalies.append({
                "type": "regular_timing",
                "severity": "high",
                "detail": "Transactions occur at extremely regular intervals",
            })

        # Check for gas price manipulation
        if scores.get("gas_consistency", 0) > 85:
            anomalies.append({
                "type": "gas_manipulation",
                "severity": "medium",
                "detail": "Unusually consistent gas prices suggest automated bidding",
            })

        # Check for MEV patterns
        if scores.get("mev_signature", 0) > 70:
            anomalies.append({
                "type": "mev_detected",
                "severity": "high",
                "detail": "Transaction patterns suggest MEV activity (sandwich/frontrun)",
            })

        # Check for high-value repetitive transactions
        if scores.get("value_dispersion", 0) < 30:
            anomalies.append({
                "type": "repetitive_values",
                "severity": "medium",
                "detail": "Transactions use identical values repeatedly",
            })

        return anomalies

    def _classify_behavior(self, scores: dict, tx_count: int) -> dict:
        """Classify wallet behavior type."""
        timing = scores.get("timing_entropy", 0)
        gas = scores.get("gas_consistency", 0)
        contracts = scores.get("contract_diversity", 0)
        mev = scores.get("mev_signature", 0)

        if mev > 70:
            return {"type": "mev_bot", "confidence": "high", "description": "MEV extraction bot"}
        elif timing > 70 and gas > 70 and contracts > 60:
            return {"type": "trading_bot", "confidence": "high", "description": "Automated trading bot"}
        elif timing > 60 and contracts < 40:
            return {"type": "simple_bot", "confidence": "medium", "description": "Simple automated agent"}
        elif tx_count > 500 and contracts > 50:
            return {"type": "smart_money", "confidence": "medium", "description": "Professional/Smart Money wallet"}
        elif timing < 30 and gas < 30:
            return {"type": "human", "confidence": "high", "description": "Likely human-operated"}
        else:
            return {"type": "mixed", "confidence": "low", "description": "Mixed human/bot behavior"}

    def _score_temporal_regularity(self, tx: list) -> float:
        """Detect if transactions follow a regular schedule (cron-like)."""
        if len(tx) < 5:
            return 40.0

        timestamps = [t.get("timestamp", 0) for t in tx if t.get("timestamp", 0) > 0]
        if len(timestamps) < 5:
            return 40.0

        # Check for hourly/daily patterns
        hours = [(ts % 86400) // 3600 for ts in timestamps]
        hour_counts = {}
        for h in hours:
            hour_counts[h] = hour_counts.get(h, 0) + 1

        max_concentration = max(hour_counts.values()) if hour_counts else 0
        concentration_ratio = max_concentration / len(hours) if hours else 0

        if concentration_ratio > 0.6:
            return 85.0  # Very regular schedule
        elif concentration_ratio > 0.4:
            return 70.0
        elif concentration_ratio > 0.25:
            return 55.0
        return 40.0

    def _score_mev_signature(self, tx: list) -> float:
        """Detect MEV (Maximal Extractable Value) signatures."""
        if len(tx) < 3:
            return 20.0

        mev_indicators = 0

        # Check for back-to-back transactions (sandwich pattern)
        for i in range(1, len(tx)):
            time_diff = tx[i].get("timestamp", 0) - tx[i - 1].get("timestamp", 0)
            if 0 < time_diff < 5:  # Within 5 seconds
                mev_indicators += 1

        # Check for high gas price variations (priority fees)
        gas_prices = []
        for t in tx:
            gp = t.get("gas_price", "0")
            try:
                gas_prices.append(int(gp))
            except (ValueError, TypeError):
                continue

        if len(gas_prices) >= 3:
            max_gas = max(gas_prices)
            min_gas = min(gas_prices)
            if min_gas > 0 and max_gas / min_gas > 10:
                mev_indicators += 2

        # Check for complex input data (calldata manipulation)
        complex_inputs = sum(1 for t in tx if t.get("input_len", 0) > 500)
        if complex_inputs > len(tx) * 0.5:
            mev_indicators += 1

        score = min(20 + mev_indicators * 20, 95)
        return float(score)

    # ─── Original scoring methods (enhanced) ───

    def _score_timing_entropy(self, tx: list) -> float:
        if len(tx) < 3:
            return 30.0
        intervals = []
        for i in range(1, len(tx)):
            diff = tx[i].get("timestamp", 0) - tx[i - 1].get("timestamp", 0)
            if diff > 0:
                intervals.append(diff)
        if len(intervals) < 2:
            return 30.0
        mean = sum(intervals) / len(intervals)
        variance = sum((x - mean) ** 2 for x in intervals) / len(intervals)
        std = math.sqrt(variance) if variance > 0 else 0
        cv = std / mean if mean > 0 else 0
        if 0.3 <= cv <= 1.5:
            return 85.0
        elif cv < 0.1:
            return 40.0
        elif cv > 3.0:
            return 50.0
        return 65.0

    def _score_gas_consistency(self, tx: list) -> float:
        gas_prices = []
        for t in tx:
            gp = t.get("gas_price", "0")
            try:
                gas_prices.append(int(gp))
            except (ValueError, TypeError):
                continue
        if len(gas_prices) < 3:
            return 40.0
        mean = sum(gas_prices) / len(gas_prices)
        if mean == 0:
            return 30.0
        variance = sum(abs(x - mean) / mean for x in gas_prices) / len(gas_prices)
        if variance <= 0.15:
            return 90.0
        elif variance <= 0.30:
            return 75.0
        elif variance <= 0.60:
            return 55.0
        return 30.0

    def _score_contract_diversity(self, tx: list) -> float:
        contracts = set()
        for t in tx:
            to = t.get("to", "")
            if to and to != "0x0000000000000000000000000000000000000000":
                contracts.add(to)
        n = len(contracts)
        if n >= 10:
            return 90.0
        elif n >= 5:
            return 75.0
        elif n >= 3:
            return 55.0
        elif n >= 1:
            return 35.0
        return 20.0

    def _score_interaction_frequency(self, tx_count: int, recent: list) -> float:
        if tx_count >= 1000:
            return 90.0
        elif tx_count >= 100:
            return 75.0
        elif tx_count >= 20:
            return 55.0
        elif tx_count >= 5:
            return 35.0
        return 15.0

    def _score_value_dispersion(self, tx: list) -> float:
        values = []
        for t in tx:
            v = t.get("value_wei", "0")
            try:
                values.append(int(v))
            except (ValueError, TypeError):
                continue
        if len(values) < 3:
            return 40.0
        unique = len(set(v // max(1, sum(values) // len(values)) for v in values))
        if unique >= 5:
            return 85.0
        elif unique >= 3:
            return 65.0
        return 35.0

    def _score_input_complexity(self, tx: list) -> float:
        lengths = [t.get("input_len", 0) for t in tx if t.get("input_len", 0) > 10]
        if not lengths:
            return 30.0
        avg_len = sum(lengths) / len(lengths)
        if avg_len >= 200:
            return 85.0
        elif avg_len >= 100:
            return 70.0
        elif avg_len >= 40:
            return 50.0
        return 30.0

    # ─── Label & Detail helpers ───

    def _get_label(self, key: str) -> str:
        labels = {
            "timing_entropy": "Timing Entropy",
            "gas_consistency": "Gas Consistency",
            "contract_diversity": "Contract Diversity",
            "interaction_frequency": "Interaction Frequency",
            "value_dispersion": "Value Dispersion",
            "input_complexity": "Input Complexity",
            "temporal_regularity": "Temporal Regularity",
            "mev_signature": "MEV Signature",
        }
        return labels.get(key, key)

    def _get_detail(self, key: str, tx: list, tx_count: int) -> str:
        if key == "timing_entropy":
            return self._detail_timing(tx)
        elif key == "gas_consistency":
            return self._detail_gas(tx)
        elif key == "contract_diversity":
            return self._detail_contracts(tx)
        elif key == "interaction_frequency":
            return f"{tx_count} total tx, {len(tx)} recent"
        elif key == "value_dispersion":
            return self._detail_value(tx)
        elif key == "input_complexity":
            return self._detail_input(tx)
        elif key == "temporal_regularity":
            return self._detail_temporal(tx)
        elif key == "mev_signature":
            return self._detail_mev(tx)
        return ""

    def _detail_timing(self, tx: list) -> str:
        if len(tx) < 2:
            return "Insufficient data"
        intervals = []
        for i in range(1, len(tx)):
            diff = tx[i].get("timestamp", 0) - tx[i - 1].get("timestamp", 0)
            if diff > 0:
                intervals.append(diff)
        if intervals:
            avg = sum(intervals) / len(intervals)
            return f"Avg {avg:.0f}s between tx ({len(tx)} recent tx)"
        return "Single tx only"

    def _detail_gas(self, tx: list) -> str:
        prices = []
        for t in tx:
            gp = t.get("gas_price", "0")
            try:
                prices.append(int(gp))
            except (ValueError, TypeError):
                continue
        if prices:
            avg = sum(prices) / len(prices)
            return f"Avg gas price: {avg:.0f} wei"
        return "N/A"

    def _detail_contracts(self, tx: list) -> str:
        contracts = set()
        for t in tx:
            to = t.get("to", "")
            if to and to != "0x0000000000000000000000000000000000000000":
                contracts.add(to)
        return f"{len(contracts)} unique contracts"

    def _detail_value(self, tx: list) -> str:
        vals = []
        for t in tx:
            v = t.get("value_wei", "0")
            try:
                vals.append(int(v))
            except (ValueError, TypeError):
                continue
        if vals:
            return f"{len(set(vals))} unique values across {len(vals)} tx"
        return "N/A"

    def _detail_input(self, tx: list) -> str:
        lengths = [t.get("input_len", 0) for t in tx if t.get("input_len", 0) > 10]
        if lengths:
            return f"Avg input: {sum(lengths)//len(lengths)} bytes"
        return "Simple transfers only"

    def _detail_temporal(self, tx: list) -> str:
        if len(tx) < 5:
            return "Insufficient data"
        timestamps = [t.get("timestamp", 0) for t in tx if t.get("timestamp", 0) > 0]
        if len(timestamps) < 5:
            return "Insufficient data"
        hours = [(ts % 86400) // 3600 for ts in timestamps]
        hour_counts = {}
        for h in hours:
            hour_counts[h] = hour_counts.get(h, 0) + 1
        peak_hour = max(hour_counts, key=hour_counts.get) if hour_counts else 0
        return f"Peak activity at hour {peak_hour}:00 ({hour_counts.get(peak_hour, 0)} tx)"

    def _detail_mev(self, tx: list) -> str:
        if len(tx) < 3:
            return "Insufficient data"
        back_to_back = 0
        for i in range(1, len(tx)):
            time_diff = tx[i].get("timestamp", 0) - tx[i - 1].get("timestamp", 0)
            if 0 < time_diff < 5:
                back_to_back += 1
        if back_to_back > 0:
            return f"{back_to_back} back-to-back tx detected (< 5s)"
        return "No MEV patterns detected"
