/**
 * JellyNet API client — typed fetch wrappers for all backend routes.
 * Uses Next.js rewrites so BASE = "" (no hardcoded port).
 * All protected endpoints require a bearer token from the NextAuth session.
 */
import type {
  Category,
  EndpointGenerated,
  MarketplaceFilters,
  SupplierWithEndpoints,
  TestRunResult,
  Transaction,
  UserBalance,
  UserMe,
  WithdrawalRequest,
} from "./types";

const BASE = "";

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${err}`);
  }

  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function getMe(token: string): Promise<UserMe> {
  return req<UserMe>("GET", "/api/auth/me", undefined, token);
}

// ── Supplier / Keys ───────────────────────────────────────────────────────────

export interface SupplierCreateRequest {
  name: string;
  api_key: string;
  target_url: string;
  min_price_usdca: number;
  category?: string;
  description?: string;
  rpm_limit?: number;
}

export async function listSuppliers(token: string): Promise<SupplierWithEndpoints[]> {
  return req<SupplierWithEndpoints[]>("GET", "/api/keys", undefined, token);
}

export async function createSupplier(
  body: SupplierCreateRequest,
  token: string
): Promise<{ supplier_id: string; name: string; created_at: string }> {
  return req("POST", "/api/keys", body, token);
}

export async function generateEndpoint(
  supplierId: string,
  token: string
): Promise<EndpointGenerated> {
  return req<EndpointGenerated>("POST", `/api/keys/${supplierId}/generate`, undefined, token);
}

// ── Marketplace (public, no auth) ─────────────────────────────────────────────

export async function listPublicEndpoints(
  filters?: MarketplaceFilters
): Promise<SupplierWithEndpoints[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.verified_only) params.set("verified_only", "true");
  if (filters?.min_price != null) params.set("min_price", String(filters.min_price));
  if (filters?.max_price != null) params.set("max_price", String(filters.max_price));
  if (filters?.sort_by) params.set("sort_by", filters.sort_by);
  const qs = params.toString();
  return req<SupplierWithEndpoints[]>("GET", `/api/keys/public${qs ? `?${qs}` : ""}`);
}

export async function listCategories(): Promise<Category[]> {
  return req<Category[]>("GET", "/api/categories");
}

// ── Transactions ──────────────────────────────────────────────────────────────

export async function listTransactions(
  token: string,
  endpointId?: string,
  limit = 50
): Promise<Transaction[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (endpointId) params.set("endpoint_id", endpointId);
  return req<Transaction[]>("GET", `/api/transactions?${params}`, undefined, token);
}

// ── Payments / Balance ────────────────────────────────────────────────────────

export async function getBalance(token: string): Promise<UserBalance> {
  return req<UserBalance>("GET", "/api/payments/balance", undefined, token);
}

export async function requestWithdrawal(
  body: { to_address: string; amount_usdca: number; chain?: string },
  token: string
): Promise<WithdrawalRequest> {
  return req<WithdrawalRequest>("POST", "/api/payments/withdraw", body, token);
}

export async function listWithdrawals(token: string): Promise<WithdrawalRequest[]> {
  return req<WithdrawalRequest[]>("GET", "/api/payments/withdrawals", undefined, token);
}

// ── Test flow ─────────────────────────────────────────────────────────────────

export async function runTestCall(
  endpointId: string,
  path: string,
  token: string,
  method = "GET",
  mnemonic?: string
): Promise<TestRunResult> {
  return req<TestRunResult>(
    "POST",
    "/api/test/run",
    { endpoint_id: endpointId, path, method, mnemonic: mnemonic ?? null },
    token
  );
}
