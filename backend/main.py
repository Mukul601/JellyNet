"""
JellyNet — main.py
FastAPI application entry point.

JellyNet is an agentic API marketplace with crypto micropayments.
Core features:
  - Supplier adds API key → gets x402-protected proxy endpoint
  - AI agent pays per call via USDC stablecoin (multi-chain)
  - Proxy forwards to upstream, confirms payment on-chain
  - Custodial model: platform collects payments, suppliers withdraw to their wallet

Future pillars:
  - Multi-chain support (Polygon, Base, Solana)
  - ProxyGate-style marketplace with categories and filtering
  - Bandwidth sharing (residential proxy tier)
  - Compute sharing (CPU/GPU/RAM monetization)
  - Job/bounty board with escrow
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import init_db
from routes import auth, keys, proxy, test
from routes.categories import router as categories_router
from payments.routes import router as payments_router
from services.chain_factory import get_chain_service
from services.proxy_service import ProxyService
from services.x402_service import X402Service

logger = logging.getLogger(__name__)


def _derive_platform_address() -> str:
    """Derive the platform's public payment address from the master mnemonic."""
    if settings.platform_payment_address:
        return settings.platform_payment_address
    if not settings.algo_master_mnemonic:
        logger.warning(
            "ALGO_MASTER_MNEMONIC not set — platform_payment_address will be empty. "
            "New endpoints will have no payment address until this is configured."
        )
        return ""
    try:
        from algosdk import mnemonic as algo_mnemonic, account as algo_account
        private_key = algo_mnemonic.to_private_key(settings.algo_master_mnemonic)
        address = algo_account.address_from_private_key(private_key)
        logger.info(f"Platform payment address derived: {address}")
        return address
    except Exception as exc:
        logger.error(f"Failed to derive platform address from mnemonic: {exc}")
        return ""


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application startup + shutdown.
    - Initialize SQLite tables (including new payments tables)
    - Derive platform payment address from master mnemonic
    - Instantiate shared services (chain, proxy, x402)
    """
    # Import payment models so SQLAlchemy registers them before init_db
    import payments.models  # noqa: F401

    # Init DB tables
    await init_db()

    # Derive and store platform payment address
    platform_address = _derive_platform_address()
    settings.platform_payment_address = platform_address

    # Attach services to app.state
    app.state.settings = settings
    app.state.chain_service = get_chain_service(settings)
    app.state.x402_service = X402Service(settings)
    app.state.proxy_service = ProxyService()

    yield  # app is running

    await app.state.proxy_service.close()


def create_app() -> FastAPI:
    app = FastAPI(
        title="JellyNet",
        description=(
            "Agentic API marketplace — monetize API keys, bandwidth, and compute "
            "via crypto micropayments. Pay per call with USDC stablecoins."
        ),
        version="0.2.0",
        lifespan=lifespan,
        docs_url="/api-docs",
        redoc_url="/api-redoc",
    )

    # CORS — allow frontend dev server + Vercel deployment
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(auth.router)
    app.include_router(keys.router)
    app.include_router(categories_router)
    app.include_router(proxy.router)
    app.include_router(test.router)
    app.include_router(payments_router)

    @app.get("/health", tags=["system"])
    async def health() -> dict:
        return {
            "status": "ok",
            "chain": settings.chain,
            "version": "0.2.0",
            "platform_payment_configured": bool(settings.platform_payment_address),
        }

    return app


# Module-level app instance — used by uvicorn
app = create_app()
