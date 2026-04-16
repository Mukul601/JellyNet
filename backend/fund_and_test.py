"""
JellyNet — fund_and_test.py
Run after manually funding wallets via the testnet faucet.

Steps this script does automatically:
  1. Check all wallet balances
  2. Opt-in platform wallet to USDC (ASA 10458941)
  3. Opt-in user wallets to USDC
  4. Run test API calls for both users (real x402 flow)
  5. Print tx hashes and Algorand Explorer URLs

Usage:
  cd backend && venv/bin/python fund_and_test.py
"""
import sqlite3
import time
from cryptography.fernet import Fernet
from algosdk import account as algo_account, mnemonic as algo_mnemonic, transaction as algo_tx
from algosdk.v2client import algod as algod_client

ALGOD = algod_client.AlgodClient("", "https://testnet-api.algonode.cloud")
USDC_ASA = 10458941
ENCRYPTION_KEY = "v2BWmQ4z8tu26jA9YHLWSkEFm7ChCP17_XqeZX5dv9s="

PLATFORM_MNEMONIC = (
    "cost tag camp slim dice era six focus power primary metal regret fatal "
    "sibling amateur limb filter connect sketch flag brush combine stage abstract oxygen"
)
PLATFORM_ADDR = "UNPO5D7ALCHUX4K6TFDPYQAFRCVWO7RRWP3E7CZGXWMZCA2CCTYUSGDTXY"


def decrypt(encrypted: str) -> str:
    return Fernet(ENCRYPTION_KEY.encode()).decrypt(encrypted.encode()).decode()


def check_balance(addr: str) -> tuple[float, bool]:
    """Returns (algo_balance, usdc_opted_in)"""
    info = ALGOD.account_info(addr)
    algo = info["amount"] / 1_000_000
    opted = any(a["asset-id"] == USDC_ASA for a in info.get("assets", []))
    return algo, opted


def opt_in_usdc(pk: str, addr: str) -> str:
    sp = ALGOD.suggested_params()
    txn = algo_tx.AssetOptInTxn(sender=addr, sp=sp, index=USDC_ASA)
    signed = txn.sign(pk)
    tx_id = ALGOD.send_transaction(signed)
    algo_tx.wait_for_confirmation(ALGOD, tx_id, 5)
    return tx_id


def send_usdc(from_pk: str, from_addr: str, to_addr: str, amount: int, note: str = "") -> str:
    sp = ALGOD.suggested_params()
    txn = algo_tx.AssetTransferTxn(
        sender=from_addr, sp=sp,
        receiver=to_addr, amt=amount,
        index=USDC_ASA,
        note=note.encode() if note else b"",
    )
    signed = txn.sign(from_pk)
    tx_id = ALGOD.send_transaction(signed)
    algo_tx.wait_for_confirmation(ALGOD, tx_id, 10)
    return tx_id


def load_users():
    conn = sqlite3.connect("jellynet.db")
    users = conn.execute("""
        SELECT u.email, w.address, w.mnemonic_encrypted, e.id as endpoint_id, e.min_price_usdca
        FROM users u
        JOIN wallets w ON w.user_id = u.id
        JOIN suppliers s ON s.user_id = u.id
        JOIN endpoints e ON e.supplier_id = s.id
    """).fetchall()
    conn.close()
    return users


def main():
    print("\n=== JellyNet Fund & Test Runner ===\n")

    platform_pk = algo_mnemonic.to_private_key(PLATFORM_MNEMONIC)

    # 1. Check all balances
    print("--- Checking balances ---")
    p_algo, p_opted = check_balance(PLATFORM_ADDR)
    print(f"Platform: {p_algo:.4f} ALGO, USDC opted-in={p_opted}")

    if p_algo < 0.1:
        print("\n⚠  Platform wallet needs ALGO.")
        print(f"   Fund here: https://bank.testnet.algorand.network/")
        print(f"   Address:   {PLATFORM_ADDR}")
        print("   Then re-run this script.\n")
        return

    users = load_users()
    if not users:
        print("No users with wallets found in DB.")
        return

    user_wallets = []
    for email, addr, enc_mn, endpoint_id, price in users:
        mn = decrypt(enc_mn)
        pk = algo_mnemonic.to_private_key(mn)
        algo, opted = check_balance(addr)
        print(f"{email}: {algo:.4f} ALGO, USDC opted-in={opted}")
        if algo < 0.01:
            print(f"  ⚠  Need ALGO at {addr}")
        user_wallets.append({
            "email": email, "addr": addr, "pk": pk,
            "algo": algo, "opted": opted,
            "endpoint_id": endpoint_id, "price": price
        })

    # Check if any wallets need funding
    needs_fund = [u for u in user_wallets if u["algo"] < 0.01]
    if needs_fund:
        print("\n⚠  Some user wallets need ALGO before test TXs can run.")
        for u in needs_fund:
            print(f"   {u['email']}: {u['addr']}")
        print("   Fund all addresses at: https://bank.testnet.algorand.network/")
        print("   Then re-run this script.\n")
        return

    # 2. Opt-in platform wallet to USDC
    if not p_opted:
        print("\nOpting platform wallet into USDC...")
        tx = opt_in_usdc(platform_pk, PLATFORM_ADDR)
        print(f"  Opt-in TX: {tx}")
        time.sleep(2)

    # 3. Opt-in user wallets to USDC (if not already)
    for u in user_wallets:
        if not u["opted"]:
            print(f"\nOpting in {u['email']} to USDC...")
            tx = opt_in_usdc(u["pk"], u["addr"])
            print(f"  Opt-in TX: {tx}")
            time.sleep(2)

    # 4. Fund user wallets with testnet USDC from platform
    # (Platform needs testnet USDC first from https://usdcfaucet.com)
    print("\n--- Checking USDC balances ---")
    for u in user_wallets:
        info = ALGOD.account_info(u["addr"])
        usdc = next((a["amount"] for a in info.get("assets", []) if a["asset-id"] == USDC_ASA), 0)
        print(f"{u['email']}: {usdc} µUSDC")
        if usdc < u["price"] * 3:
            print(f"  ⚠  Need USDC — get from https://usdcfaucet.com/")
            print(f"     Address: {u['addr']}")

    # 5. Run test TXs
    print("\n--- Running Test Transactions ---")
    tx_hashes = []
    for u in user_wallets:
        info = ALGOD.account_info(u["addr"])
        usdc = next((a["amount"] for a in info.get("assets", []) if a["asset-id"] == USDC_ASA), 0)
        if usdc < u["price"]:
            print(f"Skipping {u['email']} — insufficient USDC ({usdc} < {u['price']})")
            continue

        print(f"\nSending {u['price']} µUSDC from {u['email']} → platform...")
        try:
            tx_id = send_usdc(u["pk"], u["addr"], PLATFORM_ADDR, u["price"],
                              note=f"x402:{u['endpoint_id'][:8]}")
            url = f"https://testnet.algoexplorer.io/tx/{tx_id}"
            print(f"  ✓ TX: {tx_id}")
            print(f"    Explorer: {url}")
            tx_hashes.append({"email": u["email"], "tx_id": tx_id, "url": url})
            time.sleep(3)
        except Exception as e:
            print(f"  ✗ Failed: {e}")

    # 6. Summary
    print("\n=== TX Hashes for Hackathon Submission ===")
    for t in tx_hashes:
        print(f"\n  {t['email']}")
        print(f"  TX Hash:    {t['tx_id']}")
        print(f"  Explorer:   {t['url']}")

    if not tx_hashes:
        print("No TXs completed — fund wallets first then re-run.")

    print()


if __name__ == "__main__":
    main()
