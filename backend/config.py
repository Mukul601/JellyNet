"""
JellyNet — config.py
Pydantic-settings based config. All values from .env / environment.
Chain is modular: CHAIN=algorand | solana | base (add more in chain_factory.py)
"""
from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Server ───────────────────────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "http://localhost:3000"

    # ── Database ─────────────────────────────────────────────────────────────
    db_path: str = "./jellynet.db"

    # ── Security ─────────────────────────────────────────────────────────────
    # Generate: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    encryption_key: str = ""

    # ── Payment chain ─────────────────────────────────────────────────────────
    # Modular flag — swap to "solana" or "base" without touching route code
    chain: str = "algorand"

    # ── Algorand ──────────────────────────────────────────────────────────────
    algo_network: str = "testnet"
    algo_algod_server: str = "https://testnet-api.algonode.cloud"
    algo_algod_port: int = 443
    algo_algod_token: str = ""
    algo_indexer_server: str = "https://testnet-idx.algonode.cloud"
    algo_indexer_port: int = 443
    # 25-word mnemonic for the master hot wallet that generates per-endpoint addresses
    # Fund on testnet: https://bank.testnet.algorand.network/
    algo_master_mnemonic: str = ""
    # USDC on Algorand testnet (ASA ID 10458941)
    algo_usdc_asset_id: int = 10458941

    # ── x402 ─────────────────────────────────────────────────────────────────
    x402_version: int = 1
    x402_timeout_seconds: int = 60

    # ── Auth ──────────────────────────────────────────────────────────────────
    # Same secret as NEXTAUTH_SECRET in frontend .env.local
    # Generate: openssl rand -base64 32
    nextauth_secret: str = ""
    # Google OAuth client ID (for token audience verification)
    google_client_id: str = ""

    # ── Derived helpers ───────────────────────────────────────────────────────
    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @field_validator("encryption_key")
    @classmethod
    def check_encryption_key(cls, v: str) -> str:
        # Allow empty only during first-run setup; warn at runtime
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
