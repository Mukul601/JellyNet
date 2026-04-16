"""
JellyNet Payments — API Routes

GET  /api/payments/balance     — get current user's USDC balance
POST /api/payments/withdraw    — request a USDC withdrawal to user's wallet
GET  /api/payments/withdrawals — list user's withdrawal history
"""
from __future__ import annotations

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from payments.models import UserBalance, WithdrawalRequest
from payments import service as payment_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/payments", tags=["payments"])


# ── Response schemas ──────────────────────────────────────────────────────────

class BalanceResponse(BaseModel):
    user_id: str
    balance_usdca: int
    pending_withdrawal_usdca: int
    available_usdca: int
    # Human-readable USDC values (divide by 1_000_000)
    balance_usdc: float
    available_usdc: float


class WithdrawRequest(BaseModel):
    to_address: str
    amount_usdca: int
    chain: str = "algorand"


class WithdrawalResponse(BaseModel):
    id: str
    user_id: str
    to_address: str
    amount_usdca: float
    chain: str
    status: str
    tx_hash: Optional[str]
    created_at: str
    completed_at: Optional[str]
    error: Optional[str]


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/balance", response_model=BalanceResponse)
async def get_balance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BalanceResponse:
    """Return current user's USDC balance and available amount for withdrawal."""
    balance = await payment_service.get_balance(db, current_user.id)
    return BalanceResponse(
        user_id=current_user.id,
        balance_usdca=balance.balance_usdca,
        pending_withdrawal_usdca=balance.pending_withdrawal_usdca,
        available_usdca=balance.available_usdca,
        balance_usdc=round(balance.balance_usdca / 1_000_000, 6),
        available_usdc=round(balance.available_usdca / 1_000_000, 6),
    )


@router.post("/withdraw", response_model=WithdrawalResponse, status_code=201)
async def request_withdrawal(
    body: WithdrawRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WithdrawalResponse:
    """
    Request a USDC withdrawal to the user's wallet address.
    Requires user to have a wallet set up.
    Amount is in micro-USDC (1 USDC = 1,000,000 µUSDC).
    """
    if not current_user.wallet:
        raise HTTPException(
            status_code=400,
            detail="Wallet not set up. Please connect a wallet before withdrawing.",
        )

    if not body.to_address:
        raise HTTPException(status_code=422, detail="to_address is required")

    if body.amount_usdca < 1000:
        raise HTTPException(
            status_code=422,
            detail="Minimum withdrawal is 1000 µUSDC (0.001 USDC)",
        )

    try:
        withdrawal = await payment_service.create_withdrawal_request(
            db=db,
            user_id=current_user.id,
            to_address=body.to_address,
            amount_usdca=body.amount_usdca,
            chain=body.chain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return _withdrawal_to_response(withdrawal)


@router.get("/withdrawals", response_model=List[WithdrawalResponse])
async def list_withdrawals(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[WithdrawalResponse]:
    """List the current user's withdrawal history."""
    result = await db.execute(
        select(WithdrawalRequest)
        .where(WithdrawalRequest.user_id == current_user.id)
        .order_by(WithdrawalRequest.created_at.desc())
        .limit(limit)
    )
    withdrawals = result.scalars().all()
    return [_withdrawal_to_response(w) for w in withdrawals]


def _withdrawal_to_response(w: WithdrawalRequest) -> WithdrawalResponse:
    return WithdrawalResponse(
        id=w.id,
        user_id=w.user_id,
        to_address=w.to_address,
        amount_usdca=w.amount_usdca,
        chain=w.chain,
        status=w.status,
        tx_hash=w.tx_hash,
        created_at=w.created_at.isoformat(),
        completed_at=w.completed_at.isoformat() if w.completed_at else None,
        error=w.error,
    )
