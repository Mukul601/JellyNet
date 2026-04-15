"""
JellyNet — routes/keys.py
Supplier key management endpoints:
  POST /api/keys           — register supplier + encrypt API key (auth required)
  GET  /api/keys           — list suppliers owned by current user (auth required)
  POST /api/keys/{id}/generate — generate proxy endpoint for a supplier
  GET  /api/transactions   — list transactions for current user's endpoints
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from cryptography.fernet import Fernet
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from config import settings
from database import get_db
from middleware.auth_middleware import get_current_user
from models.endpoint import Endpoint
from models.supplier import Supplier
from models.transaction import Transaction
from models.user import User
from schemas.endpoint import EndpointGenerated, EndpointResponse
from schemas.supplier import SupplierCreate, SupplierResponse, SupplierWithEndpoints
from schemas.transaction import TransactionResponse

router = APIRouter(prefix="/api", tags=["keys"])


# ── GET /api/keys/public ──────────────────────────────────────────────────────

@router.get("/keys/public", response_model=List[SupplierWithEndpoints])
async def list_public_endpoints(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> List[SupplierWithEndpoints]:
    """Public endpoint — returns all available endpoints for marketplace browsing (no auth)."""
    result = await db.execute(
        select(Supplier).options(selectinload(Supplier.endpoints))
    )
    suppliers = result.scalars().all()

    out = []
    for s in suppliers:
        endpoints = [
            _endpoint_to_schema(ep, _build_proxy_url(request, ep.id))
            for ep in s.endpoints
        ]
        out.append(
            SupplierWithEndpoints(
                supplier_id=s.id,
                name=s.name,
                created_at=s.created_at,
                endpoints=endpoints,
            )
        )
    return out


def _fernet() -> Fernet:
    return Fernet(settings.encryption_key.encode())


def _encrypt(plaintext: str) -> str:
    return _fernet().encrypt(plaintext.encode()).decode()


def _build_proxy_url(request: Request, endpoint_id: str) -> str:
    base = str(request.base_url).rstrip("/")
    return f"{base}/proxy/{endpoint_id}/"


def _explorer_url(address: str) -> str:
    network = settings.algo_network
    if network == "testnet":
        return f"https://testnet.algoexplorer.io/address/{address}"
    return f"https://algoexplorer.io/address/{address}"


def _endpoint_to_schema(ep: Endpoint, proxy_url: str = "") -> EndpointResponse:
    return EndpointResponse(
        endpoint_id=ep.id,
        supplier_id=ep.supplier_id,
        target_url=ep.target_url,
        min_price_usdca=ep.min_price_usdca,
        earnings_address=ep.earnings_address,
        call_count=ep.call_count,
        total_earned_usdca=ep.total_earned_usdca,
        proxy_url=proxy_url,
        created_at=ep.created_at,
    )


# ── POST /api/keys ────────────────────────────────────────────────────────────

@router.post("/keys", response_model=SupplierResponse, status_code=201)
async def create_supplier(
    body: SupplierCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SupplierResponse:
    """Register a new supplier API key (stored encrypted). Auth required."""
    if not settings.encryption_key:
        raise HTTPException(
            status_code=500,
            detail="ENCRYPTION_KEY not configured. Set it in .env",
        )

    supplier = Supplier(
        id=str(uuid.uuid4()),
        name=body.name,
        api_key_encrypted=_encrypt(body.api_key),
        user_id=current_user.id,
        created_at=datetime.utcnow(),
    )
    db.add(supplier)

    # Also generate the first endpoint immediately
    chain_service = request.app.state.chain_service
    earnings_address = await chain_service.generate_address(str(uuid.uuid4()))

    endpoint = Endpoint(
        id=str(uuid.uuid4()),
        supplier_id=supplier.id,
        target_url=body.target_url,
        min_price_usdca=body.min_price_usdca,
        earnings_address=earnings_address,
        call_count=0,
        total_earned_usdca=0,
        created_at=datetime.utcnow(),
    )
    db.add(endpoint)
    await db.commit()
    await db.refresh(supplier)

    return SupplierResponse(
        supplier_id=supplier.id,
        name=supplier.name,
        created_at=supplier.created_at,
    )


# ── GET /api/keys ─────────────────────────────────────────────────────────────

@router.get("/keys", response_model=List[SupplierWithEndpoints])
async def list_suppliers(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[SupplierWithEndpoints]:
    """List suppliers owned by the current user, with their endpoints."""
    result = await db.execute(
        select(Supplier)
        .where(Supplier.user_id == current_user.id)
        .options(selectinload(Supplier.endpoints))
    )
    suppliers = result.scalars().all()

    out = []
    for s in suppliers:
        endpoints = [
            _endpoint_to_schema(ep, _build_proxy_url(request, ep.id))
            for ep in s.endpoints
        ]
        out.append(
            SupplierWithEndpoints(
                supplier_id=s.id,
                name=s.name,
                created_at=s.created_at,
                endpoints=endpoints,
            )
        )
    return out


# ── POST /api/keys/{supplier_id}/generate ────────────────────────────────────

@router.post("/keys/{supplier_id}/generate", response_model=EndpointGenerated, status_code=201)
async def generate_endpoint(
    supplier_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EndpointGenerated:
    """Generate an additional proxy endpoint for an existing supplier."""
    result = await db.execute(
        select(Supplier).where(
            Supplier.id == supplier_id,
            Supplier.user_id == current_user.id,
        )
    )
    supplier: Optional[Supplier] = result.scalar_one_or_none()
    if supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")

    ep_result = await db.execute(
        select(Endpoint).where(Endpoint.supplier_id == supplier_id)
    )
    existing_ep = ep_result.scalar_one_or_none()
    if existing_ep is None:
        raise HTTPException(status_code=404, detail="No endpoint found for supplier")

    chain_service = request.app.state.chain_service
    endpoint_id = str(uuid.uuid4())
    earnings_address = await chain_service.generate_address(endpoint_id)

    endpoint = Endpoint(
        id=endpoint_id,
        supplier_id=supplier_id,
        target_url=existing_ep.target_url,
        min_price_usdca=existing_ep.min_price_usdca,
        earnings_address=earnings_address,
        call_count=0,
        total_earned_usdca=0,
        created_at=datetime.utcnow(),
    )
    db.add(endpoint)
    await db.commit()

    proxy_url = _build_proxy_url(request, endpoint_id)

    return EndpointGenerated(
        endpoint_id=endpoint_id,
        proxy_url=proxy_url,
        earnings_address=earnings_address,
        min_price_usdca=existing_ep.min_price_usdca,
        algorand_explorer_url=_explorer_url(earnings_address),
    )


# ── GET /api/transactions ─────────────────────────────────────────────────────

@router.get("/transactions", response_model=List[TransactionResponse])
async def list_transactions(
    endpoint_id: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[TransactionResponse]:
    """List transactions for the current user's endpoints."""
    # Get endpoint IDs owned by this user
    ep_result = await db.execute(
        select(Endpoint.id)
        .join(Supplier, Supplier.id == Endpoint.supplier_id)
        .where(Supplier.user_id == current_user.id)
    )
    user_endpoint_ids = [row[0] for row in ep_result.fetchall()]

    if not user_endpoint_ids:
        return []

    query = (
        select(Transaction)
        .where(Transaction.endpoint_id.in_(user_endpoint_ids))
        .order_by(Transaction.created_at.desc())
        .limit(limit)
    )
    if endpoint_id:
        query = query.where(Transaction.endpoint_id == endpoint_id)

    result = await db.execute(query)
    txns = result.scalars().all()

    return [
        TransactionResponse(
            id=t.id,
            endpoint_id=t.endpoint_id,
            tx_hash=t.tx_hash,
            amount_usdca=t.amount_usdca,
            payer_address=t.payer_address,
            status=t.status,
            created_at=t.created_at,
            confirmed_at=t.confirmed_at,
        )
        for t in txns
    ]
