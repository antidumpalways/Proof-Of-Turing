"""Configuration for Proof-of-Turing Oracle Service."""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "Proof-of-Turing Oracle"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # Mantle Network
    MANTLE_RPC_URL: str = os.getenv(
        "MANTLE_RPC_URL", "https://rpc.testnet.mantle.xyz"
    )
    MANTLE_CHAIN_ID: int = int(os.getenv("MANTLE_CHAIN_ID", "5001"))

    # Smart Contract
    POT_REGISTRY_ADDRESS: str = os.getenv(
        "POT_REGISTRY_ADDRESS", ""
    )
    ERC8004_ADDRESS: str = os.getenv(
        "ERC8004_ADDRESS", ""
    )

    # Oracle Wallet
    ORACLE_PRIVATE_KEY: str = os.getenv("ORACLE_PRIVATE_KEY", "")
    ORACLE_ADDRESS: str = os.getenv("ORACLE_ADDRESS", "")

    # Scoring
    SCORE_VERIFICATION_THRESHOLD: int = 70  # Score >= 70 = verified AI agent
    MIN_HEARTBEATS_FOR_SCORING: int = 3  # Minimum heartbeats before scoring

    # Analyzer Weights
    TIME_ENTROPY_WEIGHT: float = 0.30
    RESPONSE_TIME_WEIGHT: float = 0.30
    DECISION_PATTERN_WEIGHT: float = 0.25
    DATA_ACCESS_WEIGHT: float = 0.15

    # Rate Limiting
    RATE_LIMIT_PER_SECOND: int = int(os.getenv("RATE_LIMIT_PER_SECOND", "10"))

    # Signature Verification
    VERIFY_SIGNATURE: bool = os.getenv("VERIFY_SIGNATURE", "false").lower() == "true"

    # Redis (optional, for caching)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    USE_REDIS: bool = os.getenv("USE_REDIS", "false").lower() == "true"


settings = Settings()
