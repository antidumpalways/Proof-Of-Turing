"""Elfa AI integration — social sentiment & market context for wallet analysis.

Elfa provides real-time sentiment analysis, trending tokens, and
smart engagement metrics. We use it to check if a wallet's trading
correlates with social sentiment — AI agents tend to trade on data,
not hype.
"""

import time
import logging
from typing import Optional
from cache import cached

log = logging.getLogger("pot-elfa")


class ElfaClient:
    """Client for Elfa AI API — social sentiment & market intelligence."""

    BASE_URL = "https://api.elfa.ai"

    def __init__(self, api_key: str = ""):
        self.api_key = api_key
        self._ready = bool(api_key)
        if not self._ready:
            log.warning("Elfa: No API key — running in stub mode")

    def is_ready(self) -> bool:
        return self._ready

    @cached(ttl=120)
    def get_trending_tokens(self, time_window: str = "24h") -> dict:
        """Get trending tokens from Elfa AI."""
        if not self._ready:
            return self._stub_trending()

        try:
            import requests
            resp = requests.get(
                f"{self.BASE_URL}/v2/aggregations/trending-tokens",
                params={"timeWindow": time_window, "pageSize": 20},
                headers={"x-elfa-api-key": self.api_key},
                timeout=10,
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "tokens": data.get("data", []),
                    "time_window": time_window,
                    "source": "elfa",
                }
            log.warning("Elfa trending error: %s", resp.status_code)
            return self._stub_trending()
        except Exception as e:
            log.error("Elfa error: %s", e)
            return self._stub_trending()

    @cached(ttl=120)
    def get_sentiment(self, keyword: str, period: str = "1h") -> dict:
        """Get social sentiment for a keyword/token."""
        if not self._ready:
            return {"sentiment": 0, "mention_count": 0, "source": "elfa_stub"}

        try:
            import requests
            mentions = requests.get(
                f"{self.BASE_URL}/v2/data/top-mentions",
                params={"ticker": keyword, "timeWindow": period, "pageSize": 5},
                headers={"x-elfa-api-key": self.api_key},
                timeout=10,
            )
            if mentions.status_code == 200:
                data = mentions.json().get("data", [])
                return {
                    "keyword": keyword,
                    "period": period,
                    "mention_count": len(data),
                    "mentions": data[:5],
                    "source": "elfa",
                }
            return {"sentiment": 0, "mention_count": 0, "source": "elfa_stub"}
        except Exception as e:
            log.error("Elfa sentiment error: %s", e)
            return {"sentiment": 0, "mention_count": 0, "source": "elfa_stub"}

    def _stub_trending(self) -> dict:
        return {
            "tokens": [],
            "time_window": "24h",
            "source": "elfa_stub",
            "note": "Elfa API not configured",
        }

    def analyze_wallet_social_context(self, profile: dict) -> dict:
        """Analyze if a wallet's trading behavior correlates with social sentiment.

        AI agents typically trade on quantitative data, not social hype.
        If a wallet trades trending tokens at peak sentiment, it's more likely human.
        """
        trending = self.get_trending_tokens("24h")
        trending_tokens = trending.get("tokens", [])
        trending_symbols = set()
        for t in trending_tokens:
            sym = t.get("symbol", "").upper()
            if sym:
                trending_symbols.add(sym)

        recent_tx = profile.get("recent_tx", [])
        trades_on_trend = 0
        total_trades = 0

        for tx in recent_tx[:20]:
            if tx.get("input_len", 0) > 10:
                total_trades += 1

        if total_trades == 0:
            return {"score": 50, "confidence": "low", "detail": "No complex trades", "source": "elfa"}

        sentiment_context = self.get_sentiment("ETH", "1h")
        mention_count = sentiment_context.get("mention_count", 0)

        score = 60
        if total_trades > 5:
            score = 70
        if mention_count > 100:
            score = max(score - 10, 30)
        if trending_symbols:
            overlap = len(trending_symbols & set(["ETH", "MNT", "USDC", "USDT"]))
            if overlap > 0:
                score = min(score + 5, 85)

        return {
            "score": score,
            "confidence": "medium" if trending.get("source") == "elfa" else "low",
            "detail": f"{total_trades} complex trades, {len(trending_symbols)} trending tokens",
            "trending_tokens": list(trending_symbols)[:5],
            "social_volume": mention_count,
            "source": trending.get("source", "elfa_stub"),
        }
