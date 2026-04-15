/**
 * Browser-safe Algorand utility functions.
 * No SDK imports — purely string/number manipulation.
 */

const EXPLORER_BASE: Record<string, string> = {
  testnet: "https://testnet.algoexplorer.io",
  mainnet: "https://algoexplorer.io",
};

function explorerBase(network = "testnet"): string {
  return EXPLORER_BASE[network] ?? EXPLORER_BASE.testnet;
}

/** Format micro-USDC as a dollar string. 100 → "$0.0001" */
export function formatUsdca(microUsdc: number): string {
  const usdc = microUsdc / 1_000_000;
  if (usdc < 0.0001) return `$${usdc.toFixed(8)}`;
  if (usdc < 0.01) return `$${usdc.toFixed(6)}`;
  return `$${usdc.toFixed(4)}`;
}

/** e.g. "ABCD...WXYZ" */
export function truncateAddress(address: string, chars = 6): string {
  if (!address || address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/** e.g. "TXID1234...ABCD" */
export function truncateTxHash(hash: string, chars = 8): string {
  if (!hash || hash.length <= chars * 2) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

export function getExplorerTxUrl(txHash: string, network = "testnet"): string {
  return `${explorerBase(network)}/tx/${txHash}`;
}

export function getExplorerAddressUrl(
  address: string,
  network = "testnet"
): string {
  return `${explorerBase(network)}/address/${address}`;
}

/** Relative time: "2s ago", "5m ago", "1h ago" */
export function relativeTime(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
