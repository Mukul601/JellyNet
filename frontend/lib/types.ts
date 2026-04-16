export interface Supplier {
  supplier_id: string;
  name: string;
  created_at: string;
}

export interface Endpoint {
  endpoint_id: string;
  supplier_id: string;
  target_url: string;
  min_price_usdca: number;
  earnings_address: string;
  // Marketplace metadata
  category: string;
  description: string | null;
  listing_type: string;
  rpm_limit: number;
  health_score: number;
  verified: boolean;
  // Stats
  call_count: number;
  total_earned_usdca: number;
  proxy_url: string;
  created_at: string;
}

export interface SupplierWithEndpoints extends Supplier {
  endpoints: Endpoint[];
}

export interface EndpointGenerated {
  endpoint_id: string;
  proxy_url: string;
  earnings_address: string;
  min_price_usdca: number;
  algorand_explorer_url: string;
}

export interface Transaction {
  id: string;
  endpoint_id: string;
  tx_hash: string;
  amount_usdca: number;
  payer_address: string;
  status: "pending" | "confirmed" | "failed";
  created_at: string;
  confirmed_at: string | null;
}

export interface TestStep {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "error";
  detail?: string;
}

export interface TestRunResult {
  steps: TestStep[];
  upstream_response: Record<string, unknown> | string | null;
  tx_hash: string | null;
  explorer_url: string | null;
  success: boolean;
  error: string | null;
}

export interface UserWallet {
  address: string;
  is_generated: boolean;
}

export interface UserMe {
  user_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  has_wallet: boolean;
  wallet_address: string | null;
  wallet_is_generated: boolean;
}

// ── Payments ──────────────────────────────────────────────────────────────────

export interface UserBalance {
  user_id: string;
  balance_usdca: number;
  pending_withdrawal_usdca: number;
  available_usdca: number;
  balance_usdc: number;
  available_usdc: number;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  to_address: string;
  amount_usdca: number;
  chain: string;
  status: "pending" | "processing" | "completed" | "failed";
  tx_hash: string | null;
  created_at: string;
  completed_at: string | null;
  error: string | null;
}

// ── Marketplace ───────────────────────────────────────────────────────────────

export interface SubCategory {
  slug: string;
  label: string;
}

export interface Category {
  slug: string;
  label: string;
  subcategories: SubCategory[];
}

export interface MarketplaceFilters {
  category?: string;
  search?: string;
  verified_only?: boolean;
  min_price?: number;
  max_price?: number;
  sort_by?: "newest" | "price_asc" | "price_desc" | "health_desc";
}
