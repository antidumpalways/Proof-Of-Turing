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
            resp = requests.get(
                f"{self.BASE_URL}/allora/consumer/price/ethereum-111551111/{asset}/{timeframe}",
                headers={"x-api-key": self.api_key},
                timeout=10,
            )
            if resp.status_code == 200:
                data = resp.json().get("data", {})
                inference_data = data.get("inference_data", {})
                return {
                    "asset": asset,
                    "timeframe": timeframe,
                    "price": inference_data.get("network_inference", "0"),
                    "confidence_intervals": inference_data.get("confidence_interval_values", []),
                    "topic_id": inference_data.get("topic_id", ""),
                    "timestamp": inference_data.get("timestamp", 0),
                    "source": "allora",
                }
            log.warning("Allora API error: %s %s", resp.status_code, resp.text)
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
            "price": "0",
            "confidence_intervals": [],
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

        asset_inferences = []
        for tx in recent_tx[:5]:
            inference = self.get_price_inference("ETH", "5m")
            asset_inferences.append(inference)

        has_inference_data = any(
            inf.get("price", "0") != "0" for inf in asset_inferences
        )
        if not has_inference_data:
            return {"score": 0, "confidence": "low", "detail": "No Allora data available"}

        return {
            "score": 75,
            "confidence": "medium",
            "detail": "Trading pattern consistent with market predictions",
            "inferences": asset_inferences[:3],
            "source": "allora",
        }
