from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class EndpointCreate(BaseModel):
    target_url: str = Field(..., description="Upstream API base URL")
    min_price_usdca: int = Field(100, ge=1, description="Minimum price in micro-USDC")


class EndpointResponse(BaseModel):
    model_config = {"from_attributes": True}

    endpoint_id: str
    supplier_id: str
    target_url: str
    min_price_usdca: int
    earnings_address: str
    call_count: int
    total_earned_usdca: int
    proxy_url: str = ""
    created_at: datetime


class EndpointGenerated(BaseModel):
    endpoint_id: str
    proxy_url: str
    earnings_address: str
    min_price_usdca: int
    algorand_explorer_url: str
