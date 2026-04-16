"""
JellyNet — routes/categories.py
Serves the marketplace category taxonomy.
Matches ProxyGate's 12 top-level categories with subcategories.
"""
from __future__ import annotations

from typing import Dict, List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["marketplace"])


class SubCategory(BaseModel):
    slug: str
    label: str


class Category(BaseModel):
    slug: str
    label: str
    subcategories: List[SubCategory] = []


CATEGORIES: List[Category] = [
    Category(slug="ai-ml", label="AI & Machine Learning", subcategories=[
        SubCategory(slug="language-models", label="Language Models"),
        SubCategory(slug="image-generation", label="Image Generation"),
        SubCategory(slug="speech-audio", label="Speech & Audio"),
        SubCategory(slug="computer-vision", label="Computer Vision"),
        SubCategory(slug="embeddings", label="Embeddings & Vectors"),
    ]),
    Category(slug="finance", label="Finance", subcategories=[
        SubCategory(slug="crypto-data", label="Crypto & Web3"),
        SubCategory(slug="market-data", label="Market Data"),
        SubCategory(slug="payments", label="Payments"),
    ]),
    Category(slug="data-analytics", label="Data & Analytics", subcategories=[
        SubCategory(slug="search", label="Search"),
        SubCategory(slug="web-scraping", label="Web Scraping"),
        SubCategory(slug="databases", label="Databases"),
    ]),
    Category(slug="communication", label="Communication", subcategories=[
        SubCategory(slug="email", label="Email"),
        SubCategory(slug="sms", label="SMS & Messaging"),
        SubCategory(slug="push", label="Push Notifications"),
    ]),
    Category(slug="location-maps", label="Location & Maps", subcategories=[
        SubCategory(slug="geocoding", label="Geocoding"),
        SubCategory(slug="routing", label="Routing"),
        SubCategory(slug="places", label="Places"),
    ]),
    Category(slug="weather", label="Weather", subcategories=[
        SubCategory(slug="forecast", label="Forecast"),
        SubCategory(slug="historical", label="Historical"),
    ]),
    Category(slug="commerce", label="Commerce", subcategories=[
        SubCategory(slug="products", label="Products"),
        SubCategory(slug="pricing", label="Pricing"),
        SubCategory(slug="inventory", label="Inventory"),
    ]),
    Category(slug="media-content", label="Media & Content", subcategories=[
        SubCategory(slug="images", label="Images"),
        SubCategory(slug="video", label="Video"),
        SubCategory(slug="news", label="News"),
    ]),
    Category(slug="security-identity", label="Security & Identity", subcategories=[
        SubCategory(slug="auth", label="Authentication"),
        SubCategory(slug="fraud", label="Fraud Detection"),
        SubCategory(slug="kyc", label="KYC / Verification"),
    ]),
    Category(slug="developer-tools", label="Developer Tools", subcategories=[
        SubCategory(slug="code", label="Code & CI"),
        SubCategory(slug="monitoring", label="Monitoring"),
        SubCategory(slug="infra", label="Infrastructure"),
    ]),
    Category(slug="health-wellness", label="Health & Wellness", subcategories=[
        SubCategory(slug="medical", label="Medical Data"),
        SubCategory(slug="fitness", label="Fitness"),
    ]),
    Category(slug="travel-transport", label="Travel & Transport", subcategories=[
        SubCategory(slug="flights", label="Flights"),
        SubCategory(slug="hotels", label="Hotels"),
        SubCategory(slug="transit", label="Transit"),
    ]),
]

# Flat lookup: slug → Category
_CATEGORY_MAP: Dict[str, Category] = {c.slug: c for c in CATEGORIES}
# Include subcategory slugs for validation
_ALL_SLUGS = set(_CATEGORY_MAP.keys()) | {
    sub.slug for cat in CATEGORIES for sub in cat.subcategories
}


@router.get("/categories", response_model=List[Category])
async def list_categories() -> List[Category]:
    """Return the full category taxonomy for the marketplace filter."""
    return CATEGORIES


def is_valid_category(slug: str) -> bool:
    return slug in _ALL_SLUGS
