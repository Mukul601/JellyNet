"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface Props {
  onComplete: (address: string, isGenerated: boolean) => void;
}

type Tab = "generate" | "connect";

export function WalletSetupModal({ onComplete }: Props) {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>("generate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Generate flow
  const [generatedMnemonic, setGeneratedMnemonic] = useState("");
  const [generatedAddress, setGeneratedAddress] = useState("");
  const [mnemonicCopied, setMnemonicCopied] = useState(false);
  const [mnemonicConfirmed, setMnemonicConfirmed] = useState(false);

  // Connect flow
  const [addressInput, setAddressInput] = useState("");

  const token = session?.backendToken;

  async function handleGenerate() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/wallet/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail ?? "Failed to generate wallet");
      }
      const data = await res.json();
      setGeneratedMnemonic(data.mnemonic);
      setGeneratedAddress(data.address);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    if (!token) return;
    const address = addressInput.trim();
    if (address.length !== 58) {
      setError("Algorand address must be exactly 58 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/wallet/connect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail ?? "Failed to connect wallet");
      }
      onComplete(address, false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function copyMnemonic() {
    navigator.clipboard.writeText(generatedMnemonic);
    setMnemonicCopied(true);
    setTimeout(() => setMnemonicCopied(false), 2000);
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "10px 0",
    fontSize: "14px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.15s",
    backgroundColor: active ? "var(--accent)" : "transparent",
    color: active ? "white" : "var(--text-muted)",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          padding: "36px 32px",
          maxWidth: "480px",
          width: "100%",
          animation: "fade-in 0.3s ease-out",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "6px", color: "var(--text-primary)" }}>
          Set Up Your Algorand Wallet
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px", lineHeight: "1.6" }}>
          Your wallet is used to pay for API calls (Agent mode) and receive earnings (Supplier mode).
        </p>

        {/* Tab toggle */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            padding: "4px",
            backgroundColor: "var(--surface)",
            borderRadius: "10px",
            marginBottom: "24px",
          }}
        >
          <button style={tabStyle(tab === "generate")} onClick={() => { setTab("generate"); setError(""); }}>
            Generate New Wallet
          </button>
          <button style={tabStyle(tab === "connect")} onClick={() => { setTab("connect"); setError(""); }}>
            Connect Existing
          </button>
        </div>

        {/* Generate tab */}
        {tab === "generate" && (
          <div>
            {!generatedMnemonic ? (
              <>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: "1.6" }}>
                  We'll generate a fresh Algorand keypair. Your <strong>secret phrase will be shown once</strong> — save it somewhere safe. Only the public address is stored.
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white",
                    fontSize: "15px",
                    fontWeight: "600",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Generating…" : "Generate Wallet"}
                </button>
              </>
            ) : (
              <>
                <div
                  style={{
                    backgroundColor: "var(--warning-dim, rgba(234,179,8,0.1))",
                    border: "1px solid var(--warning, #eab308)",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    marginBottom: "16px",
                  }}
                >
                  <p style={{ fontSize: "13px", fontWeight: "700", color: "var(--warning, #eab308)", marginBottom: "4px" }}>
                    ⚠ Save this mnemonic — it will never be shown again
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    You need it to sign transactions if you run the standalone test agent.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "14px",
                    fontFamily: "monospace",
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    lineHeight: "1.8",
                    marginBottom: "12px",
                    wordBreak: "break-word",
                  }}
                >
                  {generatedMnemonic}
                </div>

                <button
                  onClick={copyMnemonic}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    backgroundColor: mnemonicCopied ? "var(--success-dim)" : "var(--surface)",
                    color: mnemonicCopied ? "var(--success)" : "var(--text-secondary)",
                    fontSize: "13px",
                    fontWeight: "600",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    marginBottom: "16px",
                  }}
                >
                  {mnemonicCopied ? "✓ Copied!" : "Copy Mnemonic"}
                </button>

                <div style={{ marginBottom: "20px" }}>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
                    <strong style={{ color: "var(--text-secondary)" }}>Your wallet address:</strong> {generatedAddress}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Fund it before running test calls:
                  </p>
                  <div style={{ display: "flex", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
                    {[
                      { label: "Get ALGO", url: "https://bank.testnet.algorand.network/" },
                      { label: "Get USDC", url: "https://usdcfaucet.com/" },
                    ].map(({ label, url }) => (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: "12px",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          backgroundColor: "var(--accent-dim)",
                          color: "var(--accent-light)",
                          textDecoration: "none",
                          fontWeight: "600",
                        }}
                      >
                        {label} ↗
                      </a>
                    ))}
                  </div>
                </div>

                <label
                  style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "16px" }}
                >
                  <input
                    type="checkbox"
                    checked={mnemonicConfirmed}
                    onChange={(e) => setMnemonicConfirmed(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "var(--accent)" }}
                  />
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    I've saved my mnemonic phrase safely
                  </span>
                </label>

                <button
                  onClick={() => onComplete(generatedAddress, true)}
                  disabled={!mnemonicConfirmed}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "10px",
                    background: mnemonicConfirmed
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "var(--surface)",
                    color: mnemonicConfirmed ? "white" : "var(--text-muted)",
                    fontSize: "15px",
                    fontWeight: "600",
                    border: "none",
                    cursor: mnemonicConfirmed ? "pointer" : "not-allowed",
                  }}
                >
                  Continue to JellyNet
                </button>
              </>
            )}
          </div>
        )}

        {/* Connect tab */}
        {tab === "connect" && (
          <div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: "1.6" }}>
              Enter your existing Algorand testnet address. Only the public key is stored — you'll need to provide your mnemonic when running test calls.
            </p>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="ALGO... (58 characters)"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                fontSize: "13px",
                fontFamily: "monospace",
                marginBottom: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={handleConnect}
              disabled={loading || addressInput.trim().length !== 58}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "10px",
                background: addressInput.trim().length === 58
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "var(--surface)",
                color: addressInput.trim().length === 58 ? "white" : "var(--text-muted)",
                fontSize: "15px",
                fontWeight: "600",
                border: "none",
                cursor: loading || addressInput.trim().length !== 58 ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Connecting…" : "Connect Wallet"}
            </button>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px 14px",
              borderRadius: "8px",
              backgroundColor: "var(--error-dim)",
              border: "1px solid var(--error)",
              color: "var(--error)",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
