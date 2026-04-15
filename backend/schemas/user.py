from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class GoogleAuthRequest(BaseModel):
    id_token: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    has_wallet: bool = False
    wallet_address: Optional[str] = None
    wallet_is_generated: bool = False


class UserMe(BaseModel):
    user_id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    has_wallet: bool
    wallet_address: Optional[str] = None
    wallet_is_generated: bool = False


class WalletConnectRequest(BaseModel):
    address: str  # Algorand base32 pubkey


class WalletGenerateResponse(BaseModel):
    address: str
    mnemonic: str  # Shown ONCE — never stored in plaintext, never returned again


class WalletInfoResponse(BaseModel):
    address: str
    is_generated: bool
