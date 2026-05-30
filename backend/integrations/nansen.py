"""Nansen API integration — wallet labels & portfolio intelligence.

Nansen provides behavioral labels (Smart Money, Fund, Smart Trader, etc.)
and DeFi portfolio data. We use it to enrich wallet profiles with
real-world entity context.
"""

import time
import logging
from typing import Optional
from cache import cached

log = logging.getLogger("pot-nansen")


class NansenClient:
    """Client for Nansen API — wallet labels & portfolio data."""

    BASE_URL = "https://api.nansen.ai"

    def __init__(self, api_key: str = ""):
        self.api_key = api_key
        self._ready = bool(api_key)
        if not self._ready:
            log.warning("Nansen: No API key — running in stub mode")

    def is_ready(self) -> bool:
        return self._ready

    @cached(ttl=300)
    def get_wallet_labels(self, wallet: str, chain: str = "mantle") -> dict:
        """Get labels for a wallet address from Nansen."""
        if not self._ready:
            return self._stub_labels(wallet)

        try:
            import requests
            resp = requests.post(
                f"{self.BASE_URL}/api/v1/profiler/address/labels",
                json={"address": wallet, "chain": chain},
                headers={"apiKey": self.api_key},
                timeout=15,
            )
            if resp.status_code == 200:
                data = resp.json()
                labels = data.get("data", [])
                categories = {}
                for lbl in labels:
                    cat = lbl.get("category", "other")
                    categories.setdefault(cat, []).append(lbl.get("label", ""))
                return {
                    "wallet": wallet,
                    "labels": [l.get("label", "") for l in labels],
                    "categories": categories,
                    "raw": labels,
                    "source": "nansen",
                    "premium": False,
                }
            log.warning("Nansen error: %s %s", resp.status_code, resp.text)
            return self._stub_labels(wallet)
        except ImportError:
            return self._stub_labels(wallet)
        except Exception as e:
            log.error("Nansen error: %s", e)
            return self._stub_labels(wallet)

    def _stub_labels(self, wallet: str) -> dict:
        return {
            "wallet": wallet,
            "labels": [],
            "categories": {},
            "source": "nansen_stub",
            "premium": False,
            "note": "Nansen API not configured",
        }

    def analyze_wallet_risk(self, labels: dict) -> dict:
        """Analyze wallet based on Nansen labels.

        Smart Money / Fund labels -> likely professional (possibly AI)
        Exchange labels -> neutral (CEX deposit)
        No labels -> neutral / unknown
        """
        cats = labels.get("categories", {})
        all_labels = labels.get("labels", [])

        is_smart_money = any("smart" in l.lower() for l in all_labels)
        is_fund = any("fund" in l.lower() for l in all_labels)
        is_exchange = any("exchange" in l.lower() for l in all_labels)
        is_whale = any("whale" in l.lower() for l in all_labels)
        is_bot = any("bot" in l.lower() for l in all_labels)

        if is_bot:
            score = 85
            confidence = "high"
            detail = "Known bot/trading agent wallet"
        elif is_smart_money and is_fund:
            score = 70
            confidence = "high"
            detail = "Smart Money fund — likely automated/professional"
        elif is_smart_money:
            score = 65
            confidence = "medium"
            detail = "Smart Trader — could be AI or expert human"
        elif is_whale:
            score = 40
            confidence = "low"
            detail = "Whale wallet — human trader with capital"
        elif is_exchange:
            score = 10
            confidence = "high"
            detail = "Exchange wallet — not an agent"
        else:
            score = 50
            confidence = "low"
            detail = "Unknown wallet — no behavioral labels"

        return {
            "score": score,
            "confidence": confidence,
            "detail": detail,
            "labels": all_labels,
            "source": "nansen",
        }
