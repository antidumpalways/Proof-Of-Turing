"""Telegram Bot integration for Tripwire security alerts."""

import logging
import httpx
from typing import Optional
from config import settings

log = logging.getLogger("tripwire.telegram")


class TelegramAlertBot:
    """Send security alerts via Telegram Bot API."""

    def __init__(self):
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.chat_id = settings.TELEGRAM_CHAT_ID
        self.enabled = settings.TELEGRAM_ALERTS_ENABLED and bool(self.bot_token and self.chat_id)

    async def _send_message(self, text: str) -> bool:
        """Send a message via Telegram Bot API."""
        if not self.enabled:
            log.debug("Telegram alerts disabled — skipping")
            return False

        url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
        payload = {
            "chat_id": self.chat_id,
            "text": text,
            "parse_mode": "HTML",
        }

        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, json=payload, timeout=10)
                if resp.status_code == 200:
                    log.info("Telegram alert sent successfully")
                    return True
                else:
                    log.error("Telegram API error: %s — %s", resp.status_code, resp.text)
                    return False
        except Exception as e:
            log.error("Telegram send failed: %s", e)
            return False

    async def send_threat_alert(
        self,
        wallet: str,
        threat_type: str,
        severity: str,
        risk_score: int = 0,
        details: str = "",
    ) -> bool:
        """Send alert when threat is detected."""
        severity_emoji = {
            "Critical": "CRITICAL",
            "High": "HIGH",
            "Medium": "MEDIUM",
            "Low": "LOW",
            "None": "INFO",
        }
        emoji = severity_emoji.get(severity, "ALERT")
        short_wallet = f"{wallet[:8]}...{wallet[-6:]}"

        text = (
            f"<b>THREAT DETECTED</b>\n\n"
            f"<b>Wallet:</b> <code>{short_wallet}</code>\n"
            f"<b>Type:</b> {threat_type}\n"
            f"<b>Severity:</b> [{emoji}] {severity}\n"
            f"<b>Risk Score:</b> {risk_score}/100\n"
        )
        if details:
            text += f"<b>Details:</b> {details}\n"

        return await self._send_message(text)

    async def send_quarantine_alert(
        self,
        wallet: str,
        reason: str,
    ) -> bool:
        """Send alert when agent is quarantined."""
        short_wallet = f"{wallet[:8]}...{wallet[-6:]}"

        text = (
            f"<b>AGENT QUARANTINED</b>\n\n"
            f"<b>Wallet:</b> <code>{short_wallet}</code>\n"
            f"<b>Reason:</b> {reason}\n\n"
            f"Agent has been automatically quarantined due to policy violation or critical threat level."
        )
        return await self._send_message(text)

    async def send_policy_violation(
        self,
        wallet: str,
        violation_type: str,
        amount: float = 0,
        protocol: str = "",
    ) -> bool:
        """Send alert when policy is violated."""
        short_wallet = f"{wallet[:8]}...{wallet[-6:]}"

        text = (
            f"<b>POLICY VIOLATION</b>\n\n"
            f"<b>Wallet:</b> <code>{short_wallet}</code>\n"
            f"<b>Type:</b> {violation_type}\n"
        )
        if amount > 0:
            text += f"<b>Amount:</b> {amount}\n"
        if protocol:
            text += f"<b>Protocol:</b> {protocol}\n"

        return await self._send_message(text)

    async def send_compensation_alert(
        self,
        user: str,
        amount: float,
        reason: str,
    ) -> bool:
        """Send alert when user is compensated from insurance fund."""
        short_user = f"{user[:8]}...{user[-6:]}"

        text = (
            f"<b>COMPENSATION PAID</b>\n\n"
            f"<b>User:</b> <code>{short_user}</code>\n"
            f"<b>Amount:</b> {amount} MNT\n"
            f"<b>Reason:</b> {reason}\n\n"
            f"User has been compensated from the Insurance Fund."
        )
        return await self._send_message(text)

    async def send_score_update(
        self,
        wallet: str,
        score: int,
        risk_score: int,
        threat_level: str,
    ) -> bool:
        """Send alert on significant score update."""
        short_wallet = f"{wallet[:8]}...{wallet[-6:]}"

        text = (
            f"<b>SCORE UPDATED</b>\n\n"
            f"<b>Wallet:</b> <code>{short_wallet}</code>\n"
            f"<b>RepScore:</b> {score}/100\n"
            f"<b>Risk Score:</b> {risk_score}/100\n"
            f"<b>Threat Level:</b> {threat_level}\n"
        )
        return await self._send_message(text)


# Singleton
telegram_bot = TelegramAlertBot()
