"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { listSuppliers, listPublicEndpoints, runTestCall } from "@/lib/api";
import type { Endpoint, TestRunResult } from "@/lib/types";
import { TestCallPanel } from "@/components/TestCallPanel";
import { WalletSetupModal } from "@/components/WalletSetupModal";
import { MainnetOverlay } from "@/components/NetworkBadge";

export default function TestPage() {
  const { data: session, status, update: updateSession } = useSession();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [path, setPath] = useState("v1/models");
  const [mnemonic, setMnemonic] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TestRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = session?.backendToken;
  const hasGeneratedWallet = session?.walletIsGenerated;
  const needsWallet = session && !session.hasWallet;
  const isLoggedIn = !!session;

  useEffect(() => {
    // Load endpoints for both logged-in and guest users
    const load = async () => {
      try {
        if (token) {
          const suppliers = await listSuppliers(token);
          const eps = suppliers.flatMap((s) => s.endpoints);
          setEndpoints(eps);
          if (eps.length > 0) setSelectedId(eps[0].endpoint_id);
        } else {
          const suppliers = await listPublicEndpoints();
          const eps = suppliers.flatMap((s) => s.endpoints);
          setEndpoints(eps);
          if (eps.length > 0) setSelectedId(eps[0].endpoint_id);
        }
      } catch {}
    };
    if (status !== "loading") load();
  }, [status, token]);

  async function handleRun() {
    if (!isLoggedIn) {
      signIn("google", { callbackUrl: "/test" });
      return;
    }
    if (!selectedId || !token) return;
    if (!hasGeneratedWallet && !mnemonic.trim()) {
      setError("Paste your 25-word mnemonic to sign the test transaction");
      return;
    }
    setRunning(true);
    setResult(null);
    setError(null);

    try {
      const res = await runTestCall(
        selectedId,
        path,
        token,
        "GET",
        hasGeneratedWallet ? undefined : mnemonic.trim()
      );
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Test failed");
    } finally {
      setRunning(false);
    }
  }

  if (status === "loading") return null;

  return (
    <>
      <MainnetOverlay />
      {needsWallet && (
        <WalletSetupModal
          onComplete={async (address, isGenerated) => {
            await updateSession({ hasWallet: true, walletAddress: address, walletIsGenerated: isGenerated });
          }}
        />
      )}

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>
            Test the x402 Flow
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: "1.6" }}>
            Simulates a full AI agent interaction: sends a request, receives HTTP
            402, pays on Algorand testnet, and retries with payment proof.
          </p>
        </div>

        {/* Guest banner */}
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
              👋 Sign in to run live test calls with your Algorand wallet.
            </span>
            <button
              onClick={() => signIn("google", { callbackUrl: "/test" })}
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

        {/* Config Panel */}
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "28px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "20px", color: "var(--text-primary)" }}>
            Agent Configuration
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            {/* Endpoint selector */}
            <div>
              <label style={labelStyle}>TARGET ENDPOINT</label>
              {endpoints.length === 0 ? (
                <div style={emptyInputStyle}>
                  No endpoints — add one in{" "}
                  <a href="/dashboard" style={{ color: "var(--accent-light)" }}>Dashboard</a>
                </div>
              ) : (
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  style={inputStyle}
                >
                  {endpoints.map((ep) => (
                    <option key={ep.endpoint_id} value={ep.endpoint_id}>
                      {ep.target_url} · {ep.min_price_usdca} µUSDC/call
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Path input */}
            <div>
              <label style={labelStyle}>API PATH</label>
              <input
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="v1/models"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Mnemonic input — only for connected (non-generated) wallets */}
          {isLoggedIn && session.hasWallet && !hasGeneratedWallet && (
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>
                MNEMONIC (25 words)
                <span style={{ color: "var(--text-muted)", fontWeight: "400", marginLeft: "8px" }}>
                  Required for connected wallets · not stored
                </span>
              </label>
              <input
                type="password"
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                placeholder="word1 word2 word3 … word25"
                style={{ ...inputStyle, fontFamily: "monospace" }}
              />
            </div>
          )}

          {/* Wallet status chip */}
          {isLoggedIn && session.hasWallet && (
            <div style={{ marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "11px", fontWeight: "700",
                  padding: "3px 10px", borderRadius: "999px",
                  backgroundColor: "var(--success-dim)", color: "var(--success)",
                  letterSpacing: "0.05em",
                }}
              >
                {hasGeneratedWallet ? "✓ AUTO-SIGN (generated wallet)" : "✓ CONNECTED WALLET"}
              </span>
              <span style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--text-muted)" }}>
                {session.walletAddress?.slice(0, 12)}…{session.walletAddress?.slice(-6)}
              </span>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "12px 16px", borderRadius: "8px",
                backgroundColor: "var(--error-dim)", border: "1px solid var(--error)",
                color: "var(--error)", fontSize: "13px", marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleRun}
            disabled={running || (isLoggedIn && (!selectedId || !session?.hasWallet))}
            style={{
              padding: "12px 28px",
              borderRadius: "10px",
              background: running || (isLoggedIn && (!selectedId || !session?.hasWallet))
                ? "var(--border)"
                : "linear-gradient(135deg, #2dd4bf, #0d9488)",
              color: running || (isLoggedIn && (!selectedId || !session?.hasWallet)) ? "var(--text-muted)" : "#060b0f",
              fontWeight: "700",
              fontSize: "15px",
              border: "none",
              cursor: running || (isLoggedIn && (!selectedId || !session?.hasWallet)) ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {running ? (
              <>
                <span
                  style={{
                    display: "inline-block", width: "16px", height: "16px",
                    border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#060b0f",
                    borderRadius: "50%", animation: "spin 0.7s linear infinite",
                  }}
                />
                Running agent…
              </>
            ) : !isLoggedIn ? (
              <>🔑 Sign in to Run</>
            ) : (
              <>▶ Run Test Call</>
            )}
          </button>
        </div>

        {/* Results */}
        {result && <TestCallPanel result={result} />}

        {/* Instructions */}
        {!result && (
          <div
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "28px",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px", color: "var(--text-primary)" }}>
              Prerequisites
            </h3>
            <ol style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "2", paddingLeft: "20px", margin: 0 }}>
              <li>Sign in with Google → your account is created automatically</li>
              <li>Set up wallet (generate new OR connect existing Algorand address)</li>
              <li>
                Fund your wallet with ALGO:{" "}
                <a href="https://bank.testnet.algorand.network/" target="_blank" rel="noreferrer" style={{ color: "var(--accent-light)" }}>
                  testnet faucet ↗
                </a>
              </li>
              <li>
                Opt-in to USDC (ASA 10458941) and get testnet USDC:{" "}
                <a href="https://usdcfaucet.com/" target="_blank" rel="noreferrer" style={{ color: "var(--accent-light)" }}>
                  usdcfaucet.com ↗
                </a>
              </li>
              <li>Add an API key in Dashboard → generates proxy endpoint</li>
              <li>Click Run Test Call — the backend does everything in-process</li>
            </ol>
          </div>
        )}
      </div>
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: "700",
  color: "var(--text-secondary)",
  marginBottom: "8px",
  letterSpacing: "0.06em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid var(--border)",
  backgroundColor: "var(--surface)",
  color: "var(--text-primary)",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const emptyInputStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid var(--border)",
  backgroundColor: "var(--surface)",
  color: "var(--text-muted)",
  fontSize: "14px",
};
