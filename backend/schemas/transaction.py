from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TransactionResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    endpoint_id: str
    tx_hash: str
    amount_usdca: int
    payer_address: str
    status: str
    created_at: datetime
    confirmed_at: Optional[datetime] = None
