"""
JellyNet — routes/auth.py
Google OAuth + wallet management.

Flow:
  1. Frontend signs in via NextAuth (Google provider)
  2. NextAuth calls POST /api/auth/google with the Google id_token
  3. Backend verifies with Google tokeninfo, upserts User, returns JWT
  4. Frontend stores JWT in NextAuth session
  5. All subsequent requests send Authorization: Bearer <jwt>

Wallet:
  POST /api/auth/wallet/generate — creates fresh Algorand keypair, stores encrypted mnemonic
  POST /api/auth/wallet/connect  — stores user-provided pubkey (no mnemonic)
  GET  /api/auth/me              — current user + wallet info
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx
from algosdk import account as algo_account
from algosdk import mnemonic as algo_mnemonic
from cryptography.fernet import Fernet
from fastapi import APIRouter, Depends, HTTPException, Request, status
from jose import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from config import settings
from database import get_db
from middleware.auth_middleware import get_current_user
from models.user import User, Wallet
from schemas.user import (
    AuthResponse,
    GoogleAuthRequest,
    UserMe,
    WalletConnectRequest,
    WalletGenerateResponse,
    WalletInfoResponse,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

_GOOGLE_TOKENINFO = "https://oauth2.googleapis.com/tokeninfo"


def _fernet() -> Fernet:
    return Fernet(settings.encryption_key.encode())


def _encrypt(value: str) -> str:
    return _fernet().encrypt(value.encode()).decode()


def _decrypt(value: str) -> str:
    return _fernet().decrypt(value.encode()).decode()


def _mint_jwt(user_id: str, email: str) -> str:
    """Create a signed JWT using NEXTAUTH_SECRET (same key NextAuth uses)."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "email": email,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=30)).timestamp()),
    }
    return jwt.encode(payload, settings.nextauth_secret, algorithm="HS256")


async def _verify_google_token(id_token: str) -> dict:
    """Verify Google id_token via Google's tokeninfo endpoint."""
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(_GOOGLE_TOKENINFO, params={"id_token": id_token})
    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )
    data = resp.json()
    if "error" in data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google token error: {data['error']}",
        )
    # Verify audience matches our client ID (if configured)
    if settings.google_client_id and data.get("aud") != settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token audience mismatch",
        )
    return data


@router.post("/google", response_model=AuthResponse)
async def google_auth(body: GoogleAuthRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    """
    Verify a Google id_token (sent by NextAuth after sign-in).
    Upserts the User record and returns a JWT + user info.
    """
    google_data = await _verify_google_token(body.id_token)

    google_id = google_data["sub"]
    email = google_data.get("email", "")
    name = google_data.get("name", email.split("@")[0])
    avatar_url = google_data.get("picture")

    # Upsert user
    result = await db.execute(
        select(User).where(User.google_id == google_id).options(selectinload(User.wallet))
    )
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            id=str(uuid.uuid4()),
            google_id=google_id,
            email=email,
            name=name,
            avatar_url=avatar_url,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        # Re-load with wallet relationship
        result = await db.execute(
            select(User).where(User.id == user.id).options(selectinload(User.wallet))
        )
        user = result.scalar_one()
    else:
        # Update name/avatar in case they changed
        user.name = name
        user.avatar_url = avatar_url
        await db.commit()

    token = _mint_jwt(user.id, user.email)

    return AuthResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        name=user.name,
        avatar_url=user.avatar_url,
        has_wallet=user.wallet is not None,
        wallet_address=user.wallet.address if user.wallet else None,
        wallet_is_generated=user.wallet.is_generated if user.wallet else False,
    )


@router.get("/me", response_model=UserMe)
async def get_me(current_user: User = Depends(get_current_user)) -> UserMe:
    """Return the currently authenticated user + wallet info."""
    return UserMe(
        user_id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        avatar_url=current_user.avatar_url,
        has_wallet=current_user.wallet is not None,
        wallet_address=current_user.wallet.address if current_user.wallet else None,
        wallet_is_generated=current_user.wallet.is_generated if current_user.wallet else False,
    )


@router.post("/wallet/generate", response_model=WalletGenerateResponse)
async def generate_wallet(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WalletGenerateResponse:
    """
    Generate a fresh Algorand keypair for the user.
    Returns mnemonic ONCE — never returned again, only encrypted pubkey stored.
    """
    if current_user.wallet is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Wallet already set up. Cannot generate a new one.",
        )

    private_key, address = algo_account.generate_account()
    mnemonic_phrase = algo_mnemonic.from_private_key(private_key)

    wallet = Wallet(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        address=address,
        mnemonic_encrypted=_encrypt(mnemonic_phrase),
        is_generated=True,
    )
    db.add(wallet)
    await db.commit()

    # Return mnemonic plaintext exactly once
    return WalletGenerateResponse(address=address, mnemonic=mnemonic_phrase)


@router.post("/wallet/connect", response_model=WalletInfoResponse)
async def connect_wallet(
    body: WalletConnectRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WalletInfoResponse:
    """
    Store a user-provided Algorand address (pubkey only).
    No mnemonic stored — user must supply mnemonic when running test calls.
    """
    if current_user.wallet is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Wallet already set up.",
        )

    address = body.address.strip()
    if len(address) != 58:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid Algorand address (must be 58 characters)",
        )

    wallet = Wallet(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        address=address,
        mnemonic_encrypted=None,
        is_generated=False,
    )
    db.add(wallet)
    await db.commit()

    return WalletInfoResponse(address=address, is_generated=False)
