/**
 * JellyNet API client — typed fetch wrappers for all backend routes.
 * Uses Next.js rewrites so BASE = "" (no hardcoded port).
 * All protected endpoints require a bearer token from the NextAuth session.
 */
import type {
  EndpointGenerated,
  SupplierWithEndpoints,
  TestRunResult,
  Transaction,
  UserMe,
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

export interface SupplierCreateRequest {
  name: string;
  api_key: string;
  target_url: string;
  min_price_usdca: number;
}

export async function getMe(token: string): Promise<UserMe> {
  return req<UserMe>("GET", "/api/auth/me", undefined, token);
}

export async function listSuppliers(token: string): Promise<SupplierWithEndpoints[]> {
  return req<SupplierWithEndpoints[]>("GET", "/api/keys", undefined, token);
}

/** Public endpoint — no auth required. Returns all endpoints for marketplace browsing. */
export async function listPublicEndpoints(): Promise<SupplierWithEndpoints[]> {
  return req<SupplierWithEndpoints[]>("GET", "/api/keys/public");
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

export async function listTransactions(
  token: string,
  endpointId?: string,
  limit = 50
): Promise<Transaction[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (endpointId) params.set("endpoint_id", endpointId);
  return req<Transaction[]>("GET", `/api/transactions?${params}`, undefined, token);
}

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
