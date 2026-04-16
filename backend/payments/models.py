"""
JellyNet Payments — DB Models
Custodial balance tracking for suppliers.

UserBalance     — per-user accumulated USDC balance (credited on each verified payment)
WithdrawalRequest — tracks outbound payouts to supplier wallets
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class UserBalance(Base):
    """
    Tracks the total USDC balance earned by a supplier.
    Balance is credited in micro-USDC (1 USDC = 1_000_000 µUSDC).
    One row per user; created on first payment.
    """
    __tablename__ = "user_balances"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, unique=True,
    )
    # Total confirmed earnings (excluding pending withdrawals)
    balance_usdca: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # Amount in active withdrawal requests (deducted from available balance)
    pending_withdrawal_usdca: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    @property
    def available_usdca(self) -> int:
        """Balance available for withdrawal."""
        return max(0, self.balance_usdca - self.pending_withdrawal_usdca)


class WithdrawalRequest(Base):
    """
    Tracks a supplier's request to withdraw earnings to their wallet.
    Status flow: pending → processing → completed | failed
    """
    __tablename__ = "withdrawal_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    # Destination wallet address (supplier's wallet)
    to_address: Mapped[str] = mapped_column(String(128), nullable=False)
    # Amount requested in micro-USDC
    amount_usdca: Mapped[int] = mapped_column(Integer, nullable=False)
    # Chain identifier (e.g. "algorand", "polygon", "base")
    chain: Mapped[str] = mapped_column(String(32), nullable=False, default="algorand")
    # Status: pending | processing | completed | failed
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending")
    # On-chain tx hash once payout is submitted
    tx_hash: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    # Error message if failed
    error: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
