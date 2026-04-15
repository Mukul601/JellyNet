"""
JellyNet — routes/test.py
In-process test agent endpoint.

POST /api/test/run — simulates the full x402 agent flow server-side:
  1. Load logged-in user's wallet (generated wallet auto-signs; connected wallet requires mnemonic)
  2. Hit the proxy endpoint (expect 402)
  3. Parse payment requirements
  4. Submit USDC payment on Algorand testnet
  5. Retry with X-Payment header
  6. Return full result + steps for frontend display

Auth required: Bearer token in Authorization header.
"""
from __future__ import annotations

import base64
import json
import logging
import time
import uuid
from typing import List, Optional

import httpx
from algosdk import account as algo_account
from algosdk import mnemonic as algo_mnemonic
from algosdk import transaction as algo_transaction
from algosdk.v2client import algod as algod_client
from cryptography.fernet import Fernet
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

from config import settings
from middleware.auth_middleware import get_current_user
from models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["test"])

ALGOD_SERVER = "https://testnet-api.algonode.cloud"


class TestRunRequest(BaseModel):
    endpoint_id: str
    path: str = "v1/models"
    method: str = "GET"
    body: Optional[dict] = None
    # Only needed when user has a connected (non-generated) wallet
    mnemonic: Optional[str] = None


class TestStep(BaseModel):
    id: str
    label: str
    status: str  # pending | running | done | error
    detail: Optional[str] = None


class TestRunResult(BaseModel):
    steps: List[TestStep]
    upstream_response: Optional[dict] = None
    tx_hash: Optional[str] = None
    explorer_url: Optional[str] = None
    success: bool = False
    error: Optional[str] = None


def _make_step(label: str, status: str = "done", detail: str = None) -> TestStep:
    return TestStep(id=str(uuid.uuid4()), label=label, status=status, detail=detail)


def _explorer_tx_url(tx_hash: str) -> str:
    net = settings.algo_network
    if net == "testnet":
        return f"https://testnet.algoexplorer.io/tx/{tx_hash}"
    return f"https://algoexplorer.io/tx/{tx_hash}"


def _decrypt_mnemonic(encrypted: str) -> str:
    return Fernet(settings.encryption_key.encode()).decrypt(encrypted.encode()).decode()


@router.post("/test/run", response_model=TestRunResult)
async def run_test(
    body: TestRunRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
) -> TestRunResult:
    """
    Run the full x402 + Algorand payment flow in-process.
    Uses the logged-in user's wallet (auto-signs if generated, requires mnemonic if connected).
    """
    steps: List[TestStep] = []
    x402_service = request.app.state.x402_service

    # ── Wallet setup ──────────────────────────────────────────────────────────
    wallet = current_user.wallet
    if wallet is None:
        return TestRunResult(
            steps=[_make_step(
                "Wallet not set up",
                "error",
                "Complete wallet setup first — go to your profile to generate or connect a wallet",
            )],
            success=False,
            error="No wallet configured for this account",
        )

    # Resolve mnemonic
    mnemonic_phrase: Optional[str] = None
    if wallet.is_generated and wallet.mnemonic_encrypted:
        try:
            mnemonic_phrase = _decrypt_mnemonic(wallet.mnemonic_encrypted)
        except Exception as exc:
            return TestRunResult(
                steps=[_make_step("Wallet decryption failed", "error", str(exc))],
                success=False,
                error="Could not decrypt wallet mnemonic",
            )
    elif body.mnemonic:
        mnemonic_phrase = body.mnemonic.strip()
    else:
        return TestRunResult(
            steps=[_make_step(
                "Mnemonic required",
                "error",
                "You connected an existing wallet — provide its 25-word mnemonic in the 'Mnemonic' field to sign test transactions",
            )],
            success=False,
            error="Mnemonic required for connected wallets",
        )

    # Derive keys
    try:
        private_key = algo_mnemonic.to_private_key(mnemonic_phrase)
        sender_address = algo_account.address_from_private_key(private_key)
    except Exception as exc:
        return TestRunResult(
            steps=[_make_step("Wallet setup", "error", str(exc))],
            success=False,
            error=str(exc),
        )

    steps.append(_make_step(
        "Agent wallet loaded",
        "done",
        f"Address: {sender_address[:12]}...{sender_address[-6:]}",
    ))

    # ── Step 1: Hit proxy (expect 402) ────────────────────────────────────────
    steps.append(_make_step("Sending request to proxy (no payment)", "done"))
    base_url = str(request.base_url).rstrip("/")
    proxy_url = f"{base_url}/proxy/{body.endpoint_id}/{body.path.lstrip('/')}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            first_resp = await client.request(body.method, proxy_url)
    except Exception as exc:
        steps.append(_make_step("Proxy connection failed", "error", str(exc)))
        return TestRunResult(steps=steps, success=False, error=str(exc))

    if first_resp.status_code != 402:
        steps.append(_make_step(
            f"Unexpected response (expected 402, got {first_resp.status_code})",
            "error",
            first_resp.text[:200],
        ))
        return TestRunResult(steps=steps, success=False, error="Expected HTTP 402")

    # Parse 402 body
    try:
        payment_info = first_resp.json()
        accepts = payment_info.get("accepts", [{}])[0]
        pay_to = accepts["payTo"]
        amount = int(accepts["maxAmountRequired"])
        asset_id = int(accepts["extra"]["assetAddress"])
    except Exception as exc:
        steps.append(_make_step("Failed to parse 402 response", "error", str(exc)))
        return TestRunResult(steps=steps, success=False, error=str(exc))

    steps.append(_make_step(
        "Received 402 Payment Required",
        "done",
        f"Pay {amount} µUSDC to {pay_to[:12]}...{pay_to[-6:]}",
    ))

    # ── Step 2: Submit Algorand USDC payment ─────────────────────────────────
    steps.append(_make_step("Submitting Algorand USDC payment", "running"))
    try:
        algod = algod_client.AlgodClient("", ALGOD_SERVER)
        sp = algod.suggested_params()

        txn = algo_transaction.AssetTransferTxn(
            sender=sender_address,
            sp=sp,
            receiver=pay_to,
            amt=amount,
            index=asset_id,
            note=body.endpoint_id.encode(),
        )
        signed = txn.sign(private_key)
        tx_id = algod.send_transaction(signed)
        logger.info(f"Test agent submitted tx: {tx_id}")

        # Wait for confirmation (up to 10 rounds)
        algo_transaction.wait_for_confirmation(algod, tx_id, 10)

    except Exception as exc:
        err_msg = str(exc)
        if "overspend" in err_msg.lower():
            err_msg = (
                f"Insufficient balance — Fund your wallet:\n"
                f"1. Get testnet ALGO: https://bank.testnet.algorand.network/\n"
                f"2. Opt-in to USDC (ASA {asset_id})\n"
                f"3. Get testnet USDC: https://usdcfaucet.com/\n"
                f"Wallet address: {sender_address}"
            )
        steps[-1] = _make_step("Payment submission failed", "error", err_msg)
        return TestRunResult(steps=steps, success=False, error=err_msg)

    steps[-1] = _make_step(
        "Payment confirmed on Algorand testnet",
        "done",
        f"TX: {tx_id[:16]}...",
    )

    # ── Step 3: Build X-Payment header ────────────────────────────────────────
    payment_header = x402_service.encode_payment_header(
        tx_hash=tx_id,
        from_address=sender_address,
        to_address=pay_to,
        value=amount,
        network=f"algo-{settings.algo_network}",
    )
    steps.append(_make_step("X-Payment header built", "done", f"Encoded {len(payment_header)} chars"))

    # ── Step 4: Retry with payment ────────────────────────────────────────────
    steps.append(_make_step("Retrying request with payment proof", "running"))
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            second_resp = await client.request(
                body.method,
                proxy_url,
                headers={"X-Payment": payment_header},
                json=body.body,
            )
    except Exception as exc:
        steps[-1] = _make_step("Retry request failed", "error", str(exc))
        return TestRunResult(steps=steps, success=False, error=str(exc))

    if second_resp.status_code >= 400:
        steps[-1] = _make_step(
            f"Upstream returned {second_resp.status_code}",
            "error",
            second_resp.text[:300],
        )
        return TestRunResult(steps=steps, success=False, error=f"Upstream error {second_resp.status_code}")

    steps[-1] = _make_step(
        f"Upstream response received ({second_resp.status_code})",
        "done",
    )

    # Try parse upstream JSON
    try:
        upstream_data = second_resp.json()
    except Exception:
        upstream_data = {"raw": second_resp.text[:500]}

    steps.append(_make_step("Flow complete — payment verified and request proxied", "done"))

    return TestRunResult(
        steps=steps,
        upstream_response=upstream_data,
        tx_hash=tx_id,
        explorer_url=_explorer_tx_url(tx_id),
        success=True,
    )
