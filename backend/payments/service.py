"""
JellyNet Payments — Service Layer
Handles balance crediting and withdrawal initiation.

Platform collects all payments to its master wallet address.
Supplier earnings are tracked off-chain in UserBalance.
Withdrawals send USDC from platform wallet to supplier's wallet.
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from payments.models import UserBalance, WithdrawalRequest

logger = logging.getLogger(__name__)

# Platform fee: 10% of each payment goes to platform, 90% to supplier
PLATFORM_FEE_BPS = 1000  # basis points (1000 = 10%)


def _supplier_share(amount_usdca: int) -> int:
    """Amount credited to supplier after platform fee deduction."""
    fee = int(amount_usdca * PLATFORM_FEE_BPS / 10000)
    return amount_usdca - fee


async def credit_user(
    db: AsyncSession,
    user_id: str,
    amount_usdca: int,
    tx_hash: str,
) -> UserBalance:
    """
    Credit a supplier's balance after a verified payment.
    Called from payment_required.py after on-chain verification.
    Applies 10% platform fee — supplier gets 90%.
    """
    supplier_amount = _supplier_share(amount_usdca)

    result = await db.execute(
        select(UserBalance).where(UserBalance.user_id == user_id)
    )
    balance = result.scalar_one_or_none()

    if balance is None:
        balance = UserBalance(
            id=str(uuid.uuid4()),
            user_id=user_id,
            balance_usdca=supplier_amount,
            pending_withdrawal_usdca=0,
        )
        db.add(balance)
    else:
        balance.balance_usdca += supplier_amount

    logger.info(
        f"Credited user {user_id}: +{supplier_amount} µUSDC "
        f"(payment {amount_usdca} µUSDC, fee {amount_usdca - supplier_amount} µUSDC, tx={tx_hash})"
    )
    await db.commit()
    return balance


async def get_balance(db: AsyncSession, user_id: str) -> UserBalance:
    """Return or create a UserBalance row for the given user."""
    result = await db.execute(
        select(UserBalance).where(UserBalance.user_id == user_id)
    )
    balance = result.scalar_one_or_none()
    if balance is None:
        balance = UserBalance(
            id=str(uuid.uuid4()),
            user_id=user_id,
            balance_usdca=0,
            pending_withdrawal_usdca=0,
        )
        db.add(balance)
        await db.commit()
    return balance


async def create_withdrawal_request(
    db: AsyncSession,
    user_id: str,
    to_address: str,
    amount_usdca: int,
    chain: str = "algorand",
) -> WithdrawalRequest:
    """
    Create a withdrawal request. Deducts from pending balance.
    Actual payout is handled asynchronously by algorand_payout.py.
    """
    balance = await get_balance(db, user_id)

    if amount_usdca <= 0:
        raise ValueError("Withdrawal amount must be positive")
    if amount_usdca > balance.available_usdca:
        raise ValueError(
            f"Insufficient balance: requested {amount_usdca} µUSDC, "
            f"available {balance.available_usdca} µUSDC"
        )

    # Reserve the amount
    balance.pending_withdrawal_usdca += amount_usdca

    withdrawal = WithdrawalRequest(
        id=str(uuid.uuid4()),
        user_id=user_id,
        to_address=to_address,
        amount_usdca=amount_usdca,
        chain=chain,
        status="pending",
    )
    db.add(withdrawal)
    await db.commit()
    await db.refresh(withdrawal)

    logger.info(
        f"Withdrawal request {withdrawal.id}: {amount_usdca} µUSDC → {to_address} "
        f"(chain={chain}, user={user_id})"
    )
    return withdrawal


async def complete_withdrawal(
    db: AsyncSession,
    withdrawal_id: str,
    tx_hash: str,
) -> None:
    """Mark a withdrawal as completed after on-chain payout succeeds."""
    result = await db.execute(
        select(WithdrawalRequest).where(WithdrawalRequest.id == withdrawal_id)
    )
    withdrawal = result.scalar_one_or_none()
    if not withdrawal:
        return

    balance_result = await db.execute(
        select(UserBalance).where(UserBalance.user_id == withdrawal.user_id)
    )
    balance = balance_result.scalar_one_or_none()
    if balance:
        balance.balance_usdca -= withdrawal.amount_usdca
        balance.pending_withdrawal_usdca = max(
            0, balance.pending_withdrawal_usdca - withdrawal.amount_usdca
        )

    withdrawal.status = "completed"
    withdrawal.tx_hash = tx_hash
    withdrawal.completed_at = datetime.now(timezone.utc)
    await db.commit()


async def fail_withdrawal(
    db: AsyncSession,
    withdrawal_id: str,
    error: str,
) -> None:
    """Mark a withdrawal as failed and release the reserved amount."""
    result = await db.execute(
        select(WithdrawalRequest).where(WithdrawalRequest.id == withdrawal_id)
    )
    withdrawal = result.scalar_one_or_none()
    if not withdrawal:
        return

    balance_result = await db.execute(
        select(UserBalance).where(UserBalance.user_id == withdrawal.user_id)
    )
    balance = balance_result.scalar_one_or_none()
    if balance:
        # Release the reserved amount back to available
        balance.pending_withdrawal_usdca = max(
            0, balance.pending_withdrawal_usdca - withdrawal.amount_usdca
        )

    withdrawal.status = "failed"
    withdrawal.error = error
    await db.commit()
