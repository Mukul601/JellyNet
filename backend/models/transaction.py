from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

if TYPE_CHECKING:
    from models.endpoint import Endpoint


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    endpoint_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("endpoints.id", ondelete="CASCADE"), nullable=False
    )
    # Algorand transaction ID — unique prevents replay attacks
    tx_hash: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    amount_usdca: Mapped[int] = mapped_column(Integer, nullable=False)
    payer_address: Mapped[str] = mapped_column(String(64), nullable=False)
    # pending → confirmed (on success) | failed (on upstream error)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    endpoint: Mapped["Endpoint"] = relationship("Endpoint", back_populates="transactions")
