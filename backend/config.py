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
    MANTLE_CHAIN_ID: int = int(os.getenv("MANTLE_CHAIN_ID", "5003"))

    # Smart Contract
    POT_REGISTRY_ADDRESS: str = os.getenv(
        "POT_REGISTRY_ADDRESS", ""
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


settings = Settings()
