"use client";

import { useEffect, useState, useCallback } from "react";
import { listPublicEndpoints, listCategories } from "@/lib/api";
import type { Category, Endpoint, MarketplaceFilters, SupplierWithEndpoints } from "@/lib/types";
import { CategoryDropdown } from "@/components/marketplace/CategoryDropdown";
import { MarketplaceCard } from "@/components/marketplace/MarketplaceCard";

type ViewMode = "grid" | "list";

export default function MarketplacePage() {
  const [suppliers, setSuppliers] = useState<SupplierWithEndpoints[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("grid");

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<MarketplaceFilters["sort_by"]>("newest");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPublicEndpoints({
        category: category || undefined,
        search: search || undefined,
        verified_only: verifiedOnly || undefined,
        sort_by: sortBy,
      });
      setSuppliers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load marketplace");
    } finally {
      setLoading(false);
    }
  }, [category, search, verifiedOnly, sortBy]);

  // Load categories once
  useEffect(() => {
    listCategories().then(setCategories).catch(() => {});
  }, []);

  // Load endpoints when filters change (debounced for search)
  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const allEndpoints: Array<{ endpoint: Endpoint; supplierName: string }> =
    suppliers.flatMap((s) =>
      s.endpoints.map((ep) => ({ endpoint: ep, supplierName: s.name }))
    );

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: "6px" }}>
          MARKETPLACE
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
            Browse API Capacity
          </h1>
          <div
            title="Pay-per-call API endpoints protected by x402 micropayments. Agents pay USDC per request."
            style={{
              width: "20px", height: "20px", borderRadius: "50%",
              border: "1px solid var(--border)", display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "var(--text-muted)", fontSize: "12px", cursor: "help",
              flexShrink: 0,
            }}
          >
            i
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "28px",
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1", minWidth: "180px", maxWidth: "280px" }}>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}
          >
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search APIs..."
            style={{
              width: "100%",
              padding: "8px 12px 8px 32px",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text-primary)",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
          />
        </div>

        {/* Category dropdown */}
        <CategoryDropdown
          categories={categories}
          value={category}
          onChange={setCategory}
        />

        {/* Verified only toggle */}
        <label
          style={{ display: "flex", alignItems: "center", gap: "7px", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          <div
            onClick={() => setVerifiedOnly((v) => !v)}
            style={{
              width: "32px", height: "18px", borderRadius: "999px",
              backgroundColor: verifiedOnly ? "var(--accent)" : "var(--surface)",
              border: `1px solid ${verifiedOnly ? "var(--accent)" : "var(--border)"}`,
              position: "relative", cursor: "pointer", flexShrink: 0,
              transition: "background-color 0.15s",
            }}
          >
            <div style={{
              position: "absolute", top: "2px",
              left: verifiedOnly ? "14px" : "2px",
              width: "12px", height: "12px", borderRadius: "50%",
              backgroundColor: verifiedOnly ? "#060b0f" : "var(--text-muted)",
              transition: "left 0.15s",
            }} />
          </div>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Verified only</span>
        </label>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as MarketplaceFilters["sort_by"])}
          style={{
            padding: "8px 10px",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: "var(--text-secondary)",
            fontSize: "13px",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="health_desc">Health Score</option>
        </select>

        {/* Grid / List toggle */}
        <div style={{ display: "flex", gap: "2px", marginLeft: "auto" }}>
          {(["grid", "list"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                width: "34px", height: "34px",
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "7px", border: "none", cursor: "pointer",
                backgroundColor: view === v ? "var(--accent-dim)" : "var(--surface)",
                color: view === v ? "var(--accent)" : "var(--text-muted)",
                transition: "all 0.1s",
              }}
            >
              {v === "grid" ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M1 4h14M1 8h14M1 12h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
          {allEndpoints.length === 0
            ? "No endpoints found"
            : `${allEndpoints.length} endpoint${allEndpoints.length !== 1 ? "s" : ""}${category || search || verifiedOnly ? " (filtered)" : ""}`}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{
          display: "grid",
          gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(300px, 1fr))" : "1fr",
          gap: "12px",
        }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: view === "grid" ? "140px" : "60px",
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                animation: "pulse 1.5s ease-in-out infinite",
                opacity: 1 - i * 0.1,
              }}
            />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{
          padding: "20px", borderRadius: "12px",
          backgroundColor: "var(--error-dim)", border: "1px solid var(--error)",
          color: "var(--error)", fontSize: "14px",
        }}>
          {error} —{" "}
          <button onClick={load} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", textDecoration: "underline", fontSize: "inherit" }}>
            retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && allEndpoints.length === 0 && (
        <div style={{
          textAlign: "center", padding: "80px 32px",
          border: "2px dashed var(--border)", borderRadius: "16px",
          color: "var(--text-muted)",
        }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔍</div>
          <p style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>
            No APIs found
          </p>
          <p style={{ fontSize: "14px" }}>
            {category || search || verifiedOnly
              ? "Try adjusting your filters"
              : "No endpoints listed yet. Be the first to list your API."}
          </p>
          {(category || search || verifiedOnly) && (
            <button
              onClick={() => { setCategory(""); setSearch(""); setVerifiedOnly(false); }}
              style={{
                marginTop: "16px", padding: "8px 20px", borderRadius: "8px",
                backgroundColor: "var(--surface)", color: "var(--text-secondary)",
                border: "1px solid var(--border)", cursor: "pointer", fontSize: "13px",
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Endpoint grid/list */}
      {!loading && !error && allEndpoints.length > 0 && (
        <div style={{
          display: view === "grid"
            ? "grid"
            : "flex",
          gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(300px, 1fr))" : undefined,
          flexDirection: view === "list" ? "column" : undefined,
          gap: "12px",
        }}>
          {allEndpoints.map(({ endpoint, supplierName }) => (
            <MarketplaceCard
              key={endpoint.endpoint_id}
              endpoint={endpoint}
              supplierName={supplierName}
              view={view}
            />
          ))}
        </div>
      )}
    </div>
  );
}
