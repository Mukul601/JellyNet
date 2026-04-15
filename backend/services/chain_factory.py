"""
JellyNet — chain_factory.py
Abstract payment chain interface + factory function.

To add a new chain (Solana, Base, etc.):
  1. Create services/solana_service.py implementing PaymentChain
  2. Add elif branch in get_chain_service()
  3. Add env vars to config.py + .env.example
  No route code needs to change.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from config import Settings


class PaymentChain(ABC):
    """Abstract interface all payment chain implementations must satisfy."""

    @abstractmethod
    async def generate_address(self, endpoint_id: str) -> str:
        """
        Generate (or derive) an on-chain address for a new endpoint.
        Agents send payment to this address when calling the proxy.
        """
        ...

    @abstractmethod
    async def verify_payment(
        self,
        tx_hash: str,
        expected_to: str,
        expected_amount: int,
        asset_id: int,
    ) -> bool:
        """
        Verify that a submitted on-chain transaction:
          - exists and is confirmed (or at least pending)
          - sends at least expected_amount of asset_id
          - destination is expected_to
        Returns True if valid, False otherwise.
        """
        ...

    @abstractmethod
    async def get_transaction_info(self, tx_hash: str) -> dict:
        """Return raw chain transaction data for receipt display."""
        ...


def get_chain_service(settings: "Settings") -> PaymentChain:
    """
    Factory — returns the correct PaymentChain implementation
    based on settings.chain. Instantiated once in FastAPI lifespan.
    """
    chain = settings.chain.lower()

    if chain == "algorand":
        from services.algorand_service import AlgorandService
        return AlgorandService(settings)

    # ── Future chains ────────────────────────────────────────────────────────
    # elif chain == "solana":
    #     from services.solana_service import SolanaService
    #     return SolanaService(settings)
    # elif chain == "base":
    #     from services.base_service import BaseService
    #     return BaseService(settings)

    raise ValueError(
        f"Unsupported chain: '{chain}'. "
        "Add it to services/chain_factory.py and implement PaymentChain."
    )
