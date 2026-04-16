from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
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
    # Price in micro-USDC (1 USDC = 1_000_000 µUSDC). 100 = $0.0001
    min_price_usdca: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    # Custodial model: all endpoints point to platform's master payment address
    earnings_address: Mapped[str] = mapped_column(String(64), nullable=False)

    # ── Marketplace metadata ────────────────────────────────────────────────
    # Category slug (matches CATEGORIES taxonomy in routes/categories.py)
    category: Mapped[str] = mapped_column(String(64), nullable=False, default="developer-tools")
    # Short description shown on marketplace card (max ~200 chars)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # listing type: "api" | "proxy" | "dataset" | "service"
    listing_type: Mapped[str] = mapped_column(String(32), nullable=False, default="api")
    # Max requests per minute this endpoint supports
    rpm_limit: Mapped[int] = mapped_column(Integer, nullable=False, default=60)
    # Health score 0–100 (updated periodically based on uptime/latency)
    health_score: Mapped[int] = mapped_column(Integer, nullable=False, default=85)
    # Whether this endpoint has been verified by the platform
    verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # ── Stats ────────────────────────────────────────────────────────────────
    call_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_earned_usdca: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    supplier: Mapped["Supplier"] = relationship("Supplier", back_populates="endpoints")
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction", back_populates="endpoint", cascade="all, delete-orphan"
    )
