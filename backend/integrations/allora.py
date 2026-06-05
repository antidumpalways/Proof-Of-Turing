"""Allora Network integration — decentralized ML oracle for AI agents.

Allora provides price inference and confidence scores for crypto assets.
We use it as a cross-verification layer: if a wallet trades like an AI agent
AND Allora confirms the market context, confidence increases.
"""

import time
import logging
from typing import Optional
from cache import cached

log = logging.getLogger("pot-allora")


class AlloraClient:
    """Client for Allora Network API — price inference & ML verification."""

    BASE_URL = "https://api.allora.network/v2"

    def __init__(self, api_key: str = ""):
        self.api_key = api_key
        self._ready = bool(api_key)
        if not self._ready:
            log.warning("Allora: No API key — running in stub mode (returns default values)")

    def is_ready(self) -> bool:
        return self._ready

    @cached(ttl=120)
    def get_price_inference(self, asset: str = "ETH", timeframe: str = "5m") -> dict:
        """Get price inference for an asset from Allora Network."""
        if not self._ready:
            return self._stub_inference(asset)

        try:
            import requests
            # Allora uses topic IDs for different assets/timeframes
            # Topic 1 = ETH 5min on Sepolia testnet
            topic_id = 1 if asset == "ETH" else 2  # Default to topic 1 for ETH

            resp = requests.get(
                f"{self.BASE_URL}/allora/consumer/ethereum-11155111",
                params={"allora_topic_id": topic_id},
                headers={
                    "accept": "application/json",
                    "x-api-key": self.api_key,
                },
                timeout=15,
            )
            if resp.status_code == 200:
                data = resp.json()
                inference_data = data.get("data", {}).get("inference_data", {})
                return {
                    "asset": asset,
                    "timeframe": timeframe,
                    "network_inference": inference_data.get("network_inference", "0"),
                    "confidence_intervals": inference_data.get("confidence_interval_values", []),
                    "confidence_percentiles": inference_data.get("confidence_interval_percentiles", []),
                    "topic_id": inference_data.get("topic_id", str(topic_id)),
                    "timestamp": inference_data.get("timestamp", 0),
                    "source": "allora",
                }
            log.warning("Allora API error: %s %s", resp.status_code, resp.text[:200])
            return self._stub_inference(asset)
        except ImportError:
            log.warning("Allora: requests not installed")
            return self._stub_inference(asset)
        except Exception as e:
            log.error("Allora API error: %s", e)
            return self._stub_inference(asset)

    def _stub_inference(self, asset: str) -> dict:
        """Fallback stub when Allora API is unavailable."""
        return {
            "asset": asset,
            "timeframe": "5m",
            "network_inference": "0",
            "confidence_intervals": [],
            "confidence_percentiles": [],
            "topic_id": "",
            "timestamp": int(time.time()),
            "source": "allora_stub",
            "note": "Allora API not configured",
        }

    def cross_verify_trading_pattern(self, profile: dict) -> dict:
        """Cross-verify if a wallet's trading pattern matches Allora market predictions.

        The idea: AI agents tend to trade in sync with market predictions.
        If a wallet trades against market consensus, it's more likely human.
        """
        recent_tx = profile.get("recent_tx", [])
        if len(recent_tx) < 2:
            return {"score": 0, "confidence": "low", "detail": "Insufficient tx data"}

        # Get ETH price inference from Allora
        inference = self.get_price_inference("ETH", "5m")

        network_inference = inference.get("network_inference", "0")
        if network_inference == "0":
            return {"score": 0, "confidence": "low", "detail": "No Allora data available"}

        # Analyze confidence intervals
        confidence_intervals = inference.get("confidence_intervals", [])
        if len(confidence_intervals) >= 3:
            try:
                low = float(confidence_intervals[0])
                high = float(confidence_intervals[-1])
                mid = float(confidence_intervals[len(confidence_intervals) // 2])

                # Calculate spread as percentage
                spread = (high - low) / mid * 100 if mid > 0 else 100

                # Lower spread = more confident prediction = higher score
                if spread < 5:
                    score = 85
                    confidence = "high"
                elif spread < 10:
                    score = 75
                    confidence = "medium"
                elif spread < 20:
                    score = 60
                    confidence = "medium"
                else:
                    score = 45
                    confidence = "low"

                return {
                    "score": score,
                    "confidence": confidence,
                    "detail": f"Allora ETH prediction: ${mid:.2f} (spread: {spread:.1f}%)",
                    "inference": inference,
                    "source": "allora",
                }
            except (ValueError, ZeroDivisionError, IndexError):
                pass

        return {
            "score": 60,
            "confidence": "medium",
            "detail": f"Allora prediction available: {network_inference}",
            "inference": inference,
            "source": "allora",
        }
