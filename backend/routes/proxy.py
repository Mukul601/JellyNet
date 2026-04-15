"""
JellyNet — routes/proxy.py
The x402-protected reverse proxy endpoint.

Flow:
  1. require_payment dependency validates x402 payment (or returns 402)
  2. Decrypt supplier API key
  3. Forward request to upstream via ProxyService
  4. On success: mark transaction confirmed, update endpoint stats
  5. Return upstream response to caller
"""
from __future__ import annotations

from datetime import datetime

from cryptography.fernet import Fernet
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from config import settings
from database import get_db
from middleware.payment_required import require_payment
from models.endpoint import Endpoint
from models.supplier import Supplier
from models.transaction import Transaction

router = APIRouter(tags=["proxy"])


def _decrypt(ciphertext: str) -> str:
    return Fernet(settings.encryption_key.encode()).decrypt(ciphertext.encode()).decode()


@router.api_route(
    "/proxy/{endpoint_id}/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
)
async def proxy(
    endpoint_id: str,
    path: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    endpoint: Endpoint = Depends(require_payment),  # ← x402 gate
) -> StreamingResponse:
    """
    x402-protected reverse proxy.
    After payment verification, forwards the request to the supplier's upstream API.
    """
    proxy_service = request.app.state.proxy_service

    # Load supplier to get encrypted API key
    result = await db.execute(
        select(Supplier)
        .options(selectinload(Supplier.endpoints))
        .where(Supplier.id == endpoint.supplier_id)
    )
    supplier = result.scalar_one_or_none()
    if supplier is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Supplier record missing")

    # Decrypt supplier's API key
    api_key = _decrypt(supplier.api_key_encrypted)

    # Read raw request body
    body = await request.body()

    # Strip x402-specific headers from forwarded request
    forward_headers = dict(request.headers)

    # Forward to upstream
    upstream_response = await proxy_service.forward(
        target_url=endpoint.target_url,
        api_key=api_key,
        method=request.method,
        path=path,
        headers=forward_headers,
        body=body if body else None,
        query_string=request.url.query,
    )

    # Mark transaction as confirmed (or failed) based on upstream response
    tx_hash = getattr(request.state, "tx_hash", None)
    if tx_hash:
        new_status = "confirmed" if upstream_response.status_code < 400 else "failed"
        confirmed_at = datetime.utcnow() if new_status == "confirmed" else None

        await db.execute(
            update(Transaction)
            .where(Transaction.tx_hash == tx_hash)
            .values(status=new_status, confirmed_at=confirmed_at)
        )

        if new_status == "confirmed":
            # Update endpoint stats
            payment_amount = request.state.__dict__.get("payment_amount", endpoint.min_price_usdca)
            await db.execute(
                update(Endpoint)
                .where(Endpoint.id == endpoint_id)
                .values(
                    call_count=Endpoint.call_count + 1,
                    total_earned_usdca=Endpoint.total_earned_usdca + endpoint.min_price_usdca,
                )
            )

        await db.commit()

    # Stream upstream response back to caller
    # Pass through relevant response headers
    excluded_response_headers = {"transfer-encoding", "content-encoding", "content-length"}
    response_headers = {
        k: v
        for k, v in upstream_response.headers.items()
        if k.lower() not in excluded_response_headers
    }

    return StreamingResponse(
        content=iter([upstream_response.content]),
        status_code=upstream_response.status_code,
        headers=response_headers,
        media_type=upstream_response.headers.get("content-type", "application/json"),
    )
