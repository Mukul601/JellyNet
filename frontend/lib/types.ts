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
