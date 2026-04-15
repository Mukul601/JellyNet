"""
JellyNet — payment_required.py
FastAPI dependency (not Starlette middleware) that enforces x402 payment.

Mounted as Depends(require_payment) on /proxy/* routes only.
This keeps /api/* routes untouched.

Full x402 verification flow:
  1. Load Endpoint from DB — 404 if not found
  2. No X-Payment header → return 402 JSON per x402 spec
  3. Decode header → extract tx_hash, from/to, value, validBefore
  4. Expiry check
  5. Address match check
  6. Amount check
  7. Replay attack check (tx_hash must not exist in transactions table)
  8. On-chain verification via chain_service
  9. Write pending Transaction to DB
  10. Return Endpoint — proxy route proceeds
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from fastapi import Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.endpoint import Endpoint
from models.transaction import Transaction


async def require_payment(
    endpoint_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> Endpoint:
    """
    x402 payment gate dependency. Returns the validated Endpoint if payment is good.
    Raises HTTPException(402) if payment is missing, invalid, or expired.
    Raises HTTPException(404) if endpoint_id is unknown.
    """
    chain_service = request.app.state.chain_service
    x402_service = request.app.state.x402_service

    # ── 1. Load endpoint ──────────────────────────────────────────────────────
    result = await db.execute(
        select(Endpoint).where(Endpoint.id == endpoint_id)
    )
    endpoint: Optional[Endpoint] = result.scalar_one_or_none()
    if endpoint is None:
        raise HTTPException(status_code=404, detail="Endpoint not found")

    # ── 2. Check for X-Payment header ────────────────────────────────────────
    payment_header: Optional[str] = request.headers.get("x-payment")
    if not payment_header:
        resource_path = f"/proxy/{endpoint_id}/{request.path_params.get('path', '')}"
        payment_body = x402_service.build_402_response(endpoint, resource_path)
        raise HTTPException(status_code=402, detail=payment_body)

    # ── 3. Decode header ──────────────────────────────────────────────────────
    try:
        payment_data = x402_service.decode_payment_header(payment_header)
        details = x402_service.extract_payment_details(payment_data)
    except ValueError as exc:
        raise HTTPException(status_code=402, detail={"error": str(exc)})

    tx_hash = details["tx_hash"]
    to_address = details["to_address"]
    value = details["value"]
    valid_before = details["valid_before"]
    from_address = details["from_address"]

    # ── 4. Expiry check ───────────────────────────────────────────────────────
    if x402_service.is_payment_expired(valid_before):
        raise HTTPException(status_code=402, detail={"error": "Payment expired"})

    # ── 5. Address match ──────────────────────────────────────────────────────
    if to_address != endpoint.earnings_address:
        raise HTTPException(
            status_code=402,
            detail={"error": "Payment sent to wrong address"},
        )

    # ── 6. Amount check ───────────────────────────────────────────────────────
    if value < endpoint.min_price_usdca:
        raise HTTPException(
            status_code=402,
            detail={
                "error": (
                    f"Insufficient payment: {value} < {endpoint.min_price_usdca} µUSDC"
                )
            },
        )

    # ── 7. Replay attack prevention ───────────────────────────────────────────
    existing = await db.execute(
        select(Transaction).where(Transaction.tx_hash == tx_hash)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=402,
            detail={"error": "Transaction already used (replay attack)"},
        )

    # ── 8. On-chain verification ──────────────────────────────────────────────
    is_valid = await chain_service.verify_payment(
        tx_hash=tx_hash,
        expected_to=to_address,
        expected_amount=value,
        asset_id=request.app.state.settings.algo_usdc_asset_id,
    )
    if not is_valid:
        raise HTTPException(
            status_code=402,
            detail={"error": "On-chain payment verification failed"},
        )

    # ── 9. Record pending transaction ─────────────────────────────────────────
    tx = Transaction(
        id=str(uuid.uuid4()),
        endpoint_id=endpoint.id,
        tx_hash=tx_hash,
        amount_usdca=value,
        payer_address=from_address,
        status="pending",
        created_at=datetime.utcnow(),
    )
    db.add(tx)
    await db.commit()

    # Store tx_hash in request state so the proxy route can confirm it after success
    request.state.tx_hash = tx_hash

    return endpoint
