"""Configuration for Tripwire Oracle Service."""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "Tripwire Oracle"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # Mantle Network
    MANTLE_RPC_URL: str = os.getenv(
        "MANTLE_RPC_URL", "https://rpc.mantle.xyz"
    )
    MANTLE_CHAIN_ID: int = int(os.getenv("MANTLE_CHAIN_ID", "5000"))

    # Smart Contracts
    GUARD_REGISTRY_ADDRESS: str = os.getenv("GUARD_REGISTRY_ADDRESS", "")
    GUARD_VAULT_ADDRESS: str = os.getenv("GUARD_VAULT_ADDRESS", "")
    INSURANCE_FUND_ADDRESS: str = os.getenv("INSURANCE_FUND_ADDRESS", "")
    # Backward-compat alias used by legacy contract_interaction module
    POT_REGISTRY_ADDRESS: str = os.getenv("POT_REGISTRY_ADDRESS", "") or os.getenv("GUARD_REGISTRY_ADDRESS", "")

    # Oracle Wallet
    ORACLE_PRIVATE_KEY: str = os.getenv("ORACLE_PRIVATE_KEY", "")
    ORACLE_ADDRESS: str = os.getenv("ORACLE_ADDRESS", "")

    # Scoring
    SCORE_VERIFICATION_THRESHOLD: int = 70
    MIN_HEARTBEATS_FOR_SCORING: int = 3

    # Analyzer Weights (behavioral)
    TIME_ENTROPY_WEIGHT: float = 0.25
    RESPONSE_TIME_WEIGHT: float = 0.25
    DECISION_PATTERN_WEIGHT: float = 0.20
    DATA_ACCESS_WEIGHT: float = 0.10
    ML_CLASSIFIER_WEIGHT: float = 0.20

    # RepScore Weights (reputation)
    REPScore_COMPLIANCE_WEIGHT: float = 0.40
    REPScore_ROI_WEIGHT: float = 0.30
    REPScore_COMMUNITY_WEIGHT: float = 0.20
    REPScore_LIVELINESS_WEIGHT: float = 0.10

    # Risk Thresholds
    RISK_QUARANTINE_THRESHOLD: int = int(os.getenv("RISK_QUARANTINE_THRESHOLD", "80"))
    RISK_ALERT_THRESHOLD: int = int(os.getenv("RISK_ALERT_THRESHOLD", "60"))
    GUARD_POLICY_DEFAULT_AUTO_QUARANTINE: bool = True

    # Rate Limiting
    RATE_LIMIT_PER_SECOND: int = int(os.getenv("RATE_LIMIT_PER_SECOND", "10"))

    # Signature Verification
    VERIFY_SIGNATURE: bool = os.getenv("VERIFY_SIGNATURE", "false").lower() == "true"

    # Alpha Intelligence — Data Sources
    ALLORA_API_KEY: str = os.getenv("ALLORA_API_KEY", "")
    NANSEN_API_KEY: str = os.getenv("NANSEN_API_KEY", "")
    ELFA_API_KEY: str = os.getenv("ELFA_API_KEY", "")

    # Alpha scoring
    ALPHA_SCORE_THRESHOLD: int = 70

    # Data fresh
    SCAN_CACHE_TTL: int = int(os.getenv("SCAN_CACHE_TTL", "60"))
    LABEL_CACHE_TTL: int = int(os.getenv("LABEL_CACHE_TTL", "300"))
    INFERENCE_CACHE_TTL: int = int(os.getenv("INFERENCE_CACHE_TTL", "120"))

    # Telegram Alerts
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_CHAT_ID: str = os.getenv("TELEGRAM_CHAT_ID", "")
    TELEGRAM_ALERTS_ENABLED: bool = os.getenv("TELEGRAM_ALERTS_ENABLED", "false").lower() == "true"


settings = Settings()
