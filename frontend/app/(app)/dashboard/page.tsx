"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { listSuppliers, listPublicEndpoints } from "@/lib/api";
import type { SupplierWithEndpoints } from "@/lib/types";
import { AddKeyForm } from "@/components/AddKeyForm";
import { EndpointCard } from "@/components/EndpointCard";
import { TransactionLog } from "@/components/TransactionLog";
import { WalletSetupModal } from "@/components/WalletSetupModal";
import { MainnetOverlay } from "@/components/NetworkBadge";

export default function Dashboard() {
  const { data: session, status, update: updateSession } = useSession();
  const [suppliers, setSuppliers] = useState<SupplierWithEndpoints[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const token = session?.backendToken;
  const needsWallet = session && !session.hasWallet;
  const isLoggedIn = !!session;

  async function load() {
    try {
      setError(null);
      if (token) {
        // Authenticated: load user's own suppliers
        const data = await listSuppliers(token);
        setSuppliers(data);
      } else {
        // Public: load all available endpoints for marketplace view
        const data = await listPublicEndpoints();
        setSuppliers(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status !== "loading") {
      load();
    }
  }, [status, token]);

  async function handleWalletComplete(address: string, isGenerated: boolean) {
    await updateSession({ hasWallet: true, walletAddress: address, walletIsGenerated: isGenerated });
    load();
  }

  const allEndpoints = suppliers.flatMap((s) => s.endpoints);

  if (status === "loading") return null;

  return (
    <>
      <MainnetOverlay />
      {needsWallet && <WalletSetupModal onComplete={handleWalletComplete} />}

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "6px" }}>
              {isLoggedIn ? "Your API Keys" : "Marketplace"}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              {isLoggedIn
                ? "Each key gets a unique x402-protected proxy endpoint on Algorand"
                : "Browse available x402-protected API endpoints · Sign in to start earning"}
            </p>
          </div>
          {isLoggedIn ? (
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #2dd4bf, #0d9488)",
                color: "#060b0f",
                fontWeight: "600",
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>+</span> Add API Key
            </button>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #2dd4bf, #0d9488)",
                color: "#060b0f",
                fontWeight: "600",
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Sign in to Earn →
            </button>
          )}
        </div>

        {/* Add Key Modal */}
        {showForm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
            }}
            onClick={() => setShowForm(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <AddKeyForm
                token={token!}
                onSuccess={() => { setShowForm(false); load(); }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px", color: "var(--text-muted)" }}>
            <div
              style={{
                width: "32px", height: "32px",
                border: "2px solid var(--border)",
                borderTopColor: "var(--accent)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            Loading endpoints…
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              padding: "24px", borderRadius: "12px",
              backgroundColor: "var(--error-dim)", border: "1px solid var(--error)",
              color: "var(--error)", marginBottom: "24px",
            }}
          >
            {error} —{" "}
            <button
              onClick={load}
              style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", textDecoration: "underline", fontSize: "inherit" }}
            >
              retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && allEndpoints.length === 0 && (
          <div
            style={{
              textAlign: "center", padding: "80px 32px",
              borderRadius: "16px", border: "2px dashed var(--border)",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔑</div>
            <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "var(--text-secondary)" }}>
              No API keys yet
            </p>
            <p style={{ fontSize: "14px", marginBottom: "24px" }}>
              {isLoggedIn
                ? "Add your first API key to generate an x402-protected proxy endpoint"
                : "No endpoints available yet. Be the first to list your API."}
            </p>
            {isLoggedIn ? (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  padding: "10px 24px", borderRadius: "10px",
                  background: "linear-gradient(135deg, #2dd4bf, #0d9488)",
                  color: "#060b0f", fontWeight: "600", border: "none", cursor: "pointer", fontSize: "14px",
                }}
              >
                + Add API Key
              </button>
            ) : (
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                style={{
                  padding: "10px 24px", borderRadius: "10px",
                  background: "linear-gradient(135deg, #2dd4bf, #0d9488)",
                  color: "#060b0f", fontWeight: "600", border: "none", cursor: "pointer", fontSize: "14px",
                }}
              >
                Sign in to List Your API →
              </button>
            )}
          </div>
        )}

        {/* Endpoint Grid */}
        {!loading && allEndpoints.length > 0 && (
          <>
            {!isLoggedIn && (
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(45,212,191,0.06)",
                  border: "1px solid rgba(45,212,191,0.2)",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  👋 You&apos;re browsing as a guest. Sign in to list your own APIs and earn USDC.
                </span>
                <button
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  style={{
                    padding: "7px 16px", borderRadius: "8px",
                    backgroundColor: "var(--accent)", color: "#060b0f",
                    fontWeight: "600", fontSize: "12px", border: "none", cursor: "pointer",
                  }}
                >
                  Sign in →
                </button>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "16px",
                marginBottom: "48px",
              }}
            >
              {allEndpoints.map((ep) => (
                <EndpointCard key={ep.endpoint_id} endpoint={ep} />
              ))}
            </div>

            {isLoggedIn && (
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>
                  Recent Transactions
                </h2>
                <TransactionLog token={token!} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
