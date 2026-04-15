"""
JellyNet — main.py
FastAPI application entry point.

JellyNet is a DePIN + agentic commerce platform on Algorand.
This MVP ships the core "Pay-Per-Call API Proxy" feature:
  - Supplier adds API key → gets x402-protected proxy endpoint
  - AI agent pays per call via Algorand testnet USDC
  - Proxy forwards to upstream, confirms payment on-chain

Future pillars (see /future/ comments throughout codebase):
  - API Quota Stacker (ProxyGate) — stack multiple providers, auto-route
  - Web-Limit MCP Node — monetize ChatGPT/Gemini free tier via MCP
  - Residential IP & Bandwidth Sharer — privacy-preserving proxy network
  - Compute Sharer — monetize local CPU/GPU/RAM in 25/50/75% slices
  - DPDP consent logs for India — on-chain data usage consent

References:
  - VibeKit (official Algorand agentic stack): https://www.getvibekit.ai/
  - AlgoKit: https://github.com/algorandfoundation/algokit-cli
  - x402 protocol: https://github.com/BofAI/x402
  - fastapi-x402 reference: https://github.com/jordo1138/fastapi-x402
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import init_db
from routes import auth, keys, proxy, test
from services.chain_factory import get_chain_service
from services.proxy_service import ProxyService
from services.x402_service import X402Service


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application startup + shutdown.
    - Initialize SQLite tables
    - Instantiate shared services (chain, proxy, x402)
    """
    # Init DB tables
    await init_db()

    # Attach services to app.state (available in all routes via request.app.state)
    app.state.settings = settings
    app.state.chain_service = get_chain_service(settings)
    app.state.x402_service = X402Service(settings)
    app.state.proxy_service = ProxyService()

    yield  # app is running

    # Graceful shutdown
    await app.state.proxy_service.close()


def create_app() -> FastAPI:
    app = FastAPI(
        title="JellyNet",
        description=(
            "Unified agentic marketplace — monetize API keys, bandwidth, and compute "
            "via x402 micropayments on Algorand. Built for AlgoBharat Hack Series 3.0."
        ),
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS — allow frontend dev server
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
    app.include_router(proxy.router)
    app.include_router(test.router)

    @app.get("/health", tags=["system"])
    async def health() -> dict:
        return {
            "status": "ok",
            "chain": settings.chain,
            "network": settings.algo_network,
            "version": "0.1.0",
        }

    return app


# Module-level app instance — used by uvicorn
app = create_app()
