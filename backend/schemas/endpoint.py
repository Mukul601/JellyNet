from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class EndpointCreate(BaseModel):
    target_url: str = Field(..., description="Upstream API base URL")
    min_price_usdca: int = Field(100, ge=1, description="Minimum price in micro-USDC")
    category: str = Field("developer-tools", description="Category slug")
    description: Optional[str] = Field(None, max_length=300)
    rpm_limit: int = Field(60, ge=1)


class EndpointResponse(BaseModel):
    model_config = {"from_attributes": True}

    endpoint_id: str
    supplier_id: str
    target_url: str
    min_price_usdca: int
    earnings_address: str
    category: str = "developer-tools"
    description: Optional[str] = None
    listing_type: str = "api"
    rpm_limit: int = 60
    health_score: int = 85
    verified: bool = False
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
