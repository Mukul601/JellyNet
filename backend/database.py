"""
JellyNet — database.py
Async SQLite engine + session factory + Base class.
Pattern: identical to vocalswap.ai backend structure.
"""
from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from config import settings

engine = create_async_engine(
    f"sqlite+aiosqlite:///{settings.db_path}",
    echo=False,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def init_db() -> None:
    """Create all tables and apply lightweight column migrations for SQLite."""
    from models import user, supplier, endpoint, transaction  # noqa: F401 — import to register models

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Add new marketplace columns to endpoints table if they don't exist yet.
        # SQLite doesn't support IF NOT EXISTS on ALTER TABLE, so we check first.
        await _migrate_endpoint_columns(conn)


async def _migrate_endpoint_columns(conn) -> None:
    """Add any missing columns to the endpoints table (SQLite safe migration)."""
    from sqlalchemy import text
    result = await conn.execute(text("PRAGMA table_info(endpoints)"))
    existing = {row[1] for row in result.fetchall()}
    migrations = [
        ("category", "VARCHAR DEFAULT 'developer-tools'"),
        ("description", "TEXT"),
        ("listing_type", "VARCHAR DEFAULT 'api'"),
        ("rpm_limit", "INTEGER DEFAULT 60"),
        ("health_score", "INTEGER DEFAULT 85"),
        ("verified", "BOOLEAN DEFAULT 0"),
    ]
    for col_name, col_def in migrations:
        if col_name not in existing:
            await conn.execute(text(f"ALTER TABLE endpoints ADD COLUMN {col_name} {col_def}"))


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency — yields an async DB session per request."""
    async with AsyncSessionLocal() as session:
        yield session
