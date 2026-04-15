"""
JellyNet — algorand_service.py
AlgorandService implements PaymentChain using py-algorand-sdk + algokit-utils.

References:
  - AlgoKit: https://github.com/algorandfoundation/algokit-cli
  - VibeKit (agentic Algorand stack): https://www.getvibekit.ai/
  - py-algorand-sdk: https://py-algorand-sdk.readthedocs.io/
  - Public testnet node: https://testnet-api.algonode.cloud

USDC on Algorand testnet: Asset ID 10458941
Fund testnet wallet: https://bank.testnet.algorand.network/
USDC testnet faucet: https://usdcfaucet.com/ (select Algorand testnet)
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Optional

from algosdk import account as algo_account
from algosdk import mnemonic as algo_mnemonic
from algosdk.v2client import algod, indexer

from services.chain_factory import PaymentChain

if TYPE_CHECKING:
    from config import Settings

logger = logging.getLogger(__name__)


class AlgorandService(PaymentChain):
    def __init__(self, settings: "Settings") -> None:
        self.settings = settings
        self.usdc_asset_id = settings.algo_usdc_asset_id

        # Algod client — primary; used for tx submission and fast lookups
        algod_headers = {}
        if settings.algo_algod_token:
            algod_headers = {"X-API-Key": settings.algo_algod_token}

        self.algod_client = algod.AlgodClient(
            algod_token=settings.algo_algod_token,
            algod_address=f"{settings.algo_algod_server}",
            headers=algod_headers,
        )

        # Indexer client — fallback for confirmed tx lookups
        self.indexer_client = indexer.IndexerClient(
            indexer_token="",
            indexer_address=f"{settings.algo_indexer_server}",
        )

        # Master wallet — used only for address generation in MVP
        # In production use HD derivation; here we store per-endpoint keypairs
        self._master_mnemonic = settings.algo_master_mnemonic

    async def generate_address(self, endpoint_id: str) -> str:
        """
        Generate a fresh Algorand keypair for this endpoint.
        Stores only the address here — private key is logged ONCE to console.
        Operator must manually fund this address and opt into USDC (ASA 10458941).

        Production upgrade: derive deterministically from master key + endpoint_id
        using BIP32/BIP44 path, keeping private key in secure vault.
        """
        private_key, address = algo_account.generate_account()
        logger.warning(
            "\n"
            "═══════════════════════════════════════════════════════════════\n"
            " NEW ENDPOINT KEYPAIR — SAVE THE PRIVATE KEY SECURELY\n"
            f" Endpoint ID : {endpoint_id}\n"
            f" Address     : {address}\n"
            f" Private Key : {private_key}\n"
            f" Mnemonic    : {algo_mnemonic.from_private_key(private_key)}\n"
            "\n"
            " ACTION REQUIRED:\n"
            f"  1. Fund with ALGO: https://bank.testnet.algorand.network/ → {address}\n"
            f"  2. Opt in to USDC (ASA {self.usdc_asset_id}) via algokit or explorer\n"
            "═══════════════════════════════════════════════════════════════\n"
        )
        return address

    async def verify_payment(
        self,
        tx_hash: str,
        expected_to: str,
        expected_amount: int,
        asset_id: int,
    ) -> bool:
        """
        Verify an ASA transfer (USDC) on Algorand testnet.
        Strategy:
          1. Try algod.pending_transaction_info() — fastest, works for recent txns
          2. Fall back to indexer search — works for confirmed txns
        Checks: type=axfer, asset-id matches, receiver correct, amount >= required
        """
        txn_info = await self._get_txn_info(tx_hash)
        if not txn_info:
            logger.warning(f"Transaction not found: {tx_hash}")
            return False

        try:
            # Both algod pending and indexer use slightly different structures
            txn = txn_info.get("txn", txn_info.get("transaction", {}))
            inner = txn.get("txn", txn)  # algod wraps in an extra "txn" key

            # Must be asset transfer (axfer)
            tx_type = inner.get("type", inner.get("tx-type", ""))
            if tx_type not in ("axfer", "afrz"):
                logger.warning(f"Wrong tx type: {tx_type}")
                return False

            # Asset ID must match USDC
            xaid = inner.get("xaid", inner.get("asset-id", 0))
            if int(xaid) != int(asset_id):
                logger.warning(f"Wrong asset ID: {xaid} != {asset_id}")
                return False

            # Receiver must match earnings address
            arcv = inner.get("arcv", inner.get("receiver", ""))
            if arcv != expected_to:
                logger.warning(f"Wrong receiver: {arcv} != {expected_to}")
                return False

            # Amount must be at least expected (in micro-USDC)
            aamt = int(inner.get("aamt", inner.get("amount", 0)))
            if aamt < expected_amount:
                logger.warning(f"Insufficient amount: {aamt} < {expected_amount}")
                return False

            return True

        except Exception as exc:
            logger.error(f"Payment verification error for {tx_hash}: {exc}")
            return False

    async def get_transaction_info(self, tx_hash: str) -> dict:
        """Return raw transaction info for receipt display."""
        info = await self._get_txn_info(tx_hash)
        return info or {}

    async def _get_txn_info(self, tx_hash: str) -> Optional[dict]:
        """Try algod first (fast), fall back to indexer (reliable for confirmed txns)."""
        # 1. Algod pending transaction info
        try:
            info = self.algod_client.pending_transaction_info(tx_hash)
            if info and info.get("confirmed-round"):
                return info
        except Exception:
            pass

        # 2. Indexer search
        try:
            result = self.indexer_client.search_transactions(txid=tx_hash)
            txns = result.get("transactions", [])
            if txns:
                return {"txn": {"txn": txns[0]}, "transaction": txns[0]}
        except Exception as exc:
            logger.debug(f"Indexer lookup failed for {tx_hash}: {exc}")

        return None
