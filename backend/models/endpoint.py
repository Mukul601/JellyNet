from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, List

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

if TYPE_CHECKING:
    from models.supplier import Supplier
    from models.transaction import Transaction


class Endpoint(Base):
    __tablename__ = "endpoints"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    supplier_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False
    )
    target_url: Mapped[str] = mapped_column(String, nullable=False)
    # Price in micro-USDC (1 USDC = 1_000_000 micro-USDC). 100 = $0.0001
    min_price_usdca: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    # Algorand address where agents send payment
    earnings_address: Mapped[str] = mapped_column(String(64), nullable=False)
    # Stats — updated on each successful proxied call
    call_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_earned_usdca: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    supplier: Mapped["Supplier"] = relationship("Supplier", back_populates="endpoints")
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction", back_populates="endpoint", cascade="all, delete-orphan"
    )
