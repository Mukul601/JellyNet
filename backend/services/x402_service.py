"""
JellyNet — x402_service.py
Implements the x402 payment protocol for JellyNet.

x402 spec / reference implementations:
  - Core SDK: https://github.com/BofAI/x402
  - Python package: https://pypi.org/project/x402/
  - fastapi-x402: https://github.com/jordo1138/fastapi-x402
  - awesome-x402: https://github.com/xpaysh/awesome-x402

Protocol summary:
  1. Resource server returns HTTP 402 with JSON body describing payment requirements
  2. AI agent reads `accepts[]`, submits on-chain payment
  3. Agent retries with X-Payment: base64url(paymentPayload) header
  4. Resource server verifies on-chain, returns proxied response
"""
from __future__ import annotations

import base64
import json
import time
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from config import Settings
    from models.endpoint import Endpoint


class X402Service:
    def __init__(self, settings: "Settings") -> None:
        self.settings = settings

    def build_402_response(self, endpoint: "Endpoint", resource_path: str) -> dict:
        """
        Construct the x402 Payment Required response body.
        Spec: https://github.com/BofAI/x402

        The `accepts` array lists accepted payment schemes.
        For MVP: one entry — exact USDC amount on Algorand testnet.
        """
        return {
            "x402Version": self.settings.x402_version,
            "error": "X402 Payment Required",
            "accepts": [
                {
                    "scheme": "exact",
                    "network": f"algo-{self.settings.algo_network}",
                    "maxAmountRequired": str(endpoint.min_price_usdca),
                    "resource": resource_path,
                    "description": (
                        f"API call via JellyNet proxy — {endpoint.min_price_usdca} µUSDC"
                    ),
                    "mimeType": "application/json",
                    "payTo": endpoint.earnings_address,
                    "maxTimeoutSeconds": self.settings.x402_timeout_seconds,
                    "asset": "USDC",
                    "extra": {
                        # ASA ID for USDC on Algorand (testnet: 10458941)
                        "assetAddress": str(self.settings.algo_usdc_asset_id),
                        "name": f"USDC on Algorand {self.settings.algo_network}",
                        "decimals": 6,
                    },
                }
            ],
        }

    def decode_payment_header(self, header_value: str) -> dict:
        """
        Decode the base64url-encoded X-Payment header.
        Returns parsed dict with:
          - x402Version
          - scheme
          - network
          - payload.signature   (tx hash / tx ID)
          - payload.authorization.from
          - payload.authorization.to
          - payload.authorization.value
          - payload.authorization.validBefore (Unix timestamp)
        """
        # Pad base64url to multiple of 4 chars
        padded = header_value + "==" * ((4 - len(header_value) % 4) % 4)
        try:
            decoded = base64.urlsafe_b64decode(padded)
            return json.loads(decoded)
        except Exception as exc:
            raise ValueError(f"Invalid X-Payment header: {exc}") from exc

    def encode_payment_header(
        self,
        tx_hash: str,
        from_address: str,
        to_address: str,
        value: int,
        network: str = "algo-testnet",
    ) -> str:
        """
        Build a base64url-encoded X-Payment header value.
        Used by test_agent.py and the /api/test/run in-process runner.
        """
        valid_after = int(time.time()) - 5
        valid_before = int(time.time()) + self.settings.x402_timeout_seconds

        payload = {
            "x402Version": self.settings.x402_version,
            "scheme": "exact",
            "network": network,
            "payload": {
                "signature": tx_hash,
                "authorization": {
                    "from": from_address,
                    "to": to_address,
                    "value": str(value),
                    "validAfter": str(valid_after),
                    "validBefore": str(valid_before),
                },
            },
        }
        encoded = base64.urlsafe_b64encode(json.dumps(payload).encode())
        return encoded.rstrip(b"=").decode()

    def is_payment_expired(self, valid_before: int) -> bool:
        """Check if the payment window has passed."""
        return time.time() > valid_before

    def extract_payment_details(self, payment_data: dict) -> dict:
        """
        Convenience helper — extracts the fields used in verification
        from a decoded X-Payment payload.
        Returns: {tx_hash, from_address, to_address, value, valid_before}
        """
        auth = payment_data.get("payload", {}).get("authorization", {})
        return {
            "tx_hash": payment_data.get("payload", {}).get("signature", ""),
            "from_address": auth.get("from", ""),
            "to_address": auth.get("to", ""),
            "value": int(auth.get("value", 0)),
            "valid_before": int(auth.get("validBefore", 0)),
        }
