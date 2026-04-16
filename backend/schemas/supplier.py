from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from schemas.endpoint import EndpointResponse


class SupplierCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=128, description="Display name")
    api_key: str = Field(..., min_length=1, description="Raw API key — stored encrypted")
    target_url: str = Field(..., description="Upstream API base URL e.g. https://api.openai.com")
    min_price_usdca: int = Field(
        100, ge=1, description="Minimum price per call in micro-USDC (100 = $0.0001)"
    )
    category: str = Field("developer-tools", description="Category slug")
    description: Optional[str] = Field(None, max_length=300, description="Short description for marketplace")
    rpm_limit: int = Field(60, ge=1, description="Max requests per minute")


class SupplierResponse(BaseModel):
    model_config = {"from_attributes": True}

    supplier_id: str
    name: str
    created_at: datetime


class SupplierWithEndpoints(BaseModel):
    model_config = {"from_attributes": True}

    supplier_id: str
    name: str
    created_at: datetime
    endpoints: List[EndpointResponse] = []
