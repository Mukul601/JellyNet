"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Props {
  onComplete: (address: string, isGenerated: boolean) => void;
  onDismiss?: () => void;
}

type Tab = "generate" | "connect";
type GenerateStep = "idle" | "loading" | "show_mnemonic" | "done";

export function WalletSetupModal({ onComplete, onDismiss }: Props) {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>("generate");
  const [error, setError] = useState("");

  // Generate flow
  const [genStep, setGenStep] = useState<GenerateStep>("idle");
  const [generatedAddress, setGeneratedAddress] = useState("");
  const [generatedMnemonic, setGeneratedMnemonic] = useState("");
  const [mnemonicConfirmed, setMnemonicConfirmed] = useState(false);

  // Connect flow
  const [connectLoading, setConnectLoading] = useState(false);
  const [peraConnecting, setPeraConnecting] = useState(false);
  const [addressInput, setAddressInput] = useState("");

  const token = session?.backendToken;

  async function handleGenerate() {
    if (!token) return;
    setGenStep("loading");
    setError("");
    try {
      const res = await fetch("/api/auth/wallet/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        let detail = "Failed to generate wallet";
        try {
          const d = await res.json();
          detail = d.detail ?? detail;
        } catch {}
        if (res.status === 409) detail = "Wallet already exists on your account.";
        if (res.status === 502 || res.status === 503 || res.status === 504) {
          detail = "Backend service is unavailable. Make sure the backend is running.";
        }
        throw new Error(detail);
      }
      const data = await res.json();
      setGeneratedAddress(data.address);
      setGeneratedMnemonic(data.mnemonic ?? "");
      setGenStep("show_mnemonic");
    } catch (e: unknown) {
      if (e instanceof TypeError && e.message.includes("fetch")) {
        setError("Cannot reach the backend. Check that the server is running.");
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
      setGenStep("idle");
    }
  }

  async function handleConnectPera() {
    setPeraConnecting(true);
    setError("");
    try {
      // Dynamic import to avoid SSR issues
      const { PeraWalletConnect } = await import("@perawallet/connect");
      const peraWallet = new PeraWalletConnect();
      const accounts = await peraWallet.connect();
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        await submitAddress(address);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // User closed modal = not an error to show
      if (!msg.toLowerCase().includes("closed") && !msg.toLowerCase().includes("cancelled")) {
        setError("Wallet connect failed: " + msg);
      }
    } finally {
      setPeraConnecting(false);
    }
  }

  async function handleConnectManual() {
    const address = addressInput.trim();
    if (address.length !== 58) {
      setError("Wallet address must be exactly 58 characters");
      return;
    }
    await submitAddress(address);
  }

  const submitAddress = useCallback(async (address: string) => {
    if (!token) return;
    setConnectLoading(true);
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
        let detail = "Failed to save wallet address";
        try {
          const d = await res.json();
          detail = d.detail ?? detail;
        } catch {}
        if (res.status === 502 || res.status === 503 || res.status === 504) {
          detail = "Backend service is unavailable. Make sure the backend is running.";
        }
        throw new Error(detail);
      }
      onComplete(address, false);
    } catch (e: unknown) {
      if (e instanceof TypeError && e.message.includes("fetch")) {
        setError("Cannot reach the backend. Check that the server is running.");
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setConnectLoading(false);
    }
  }, [token, onComplete]);

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
    color: active ? "#060b0f" : "var(--text-muted)",
  });

  const mnemonicWords = generatedMnemonic ? generatedMnemonic.split(" ") : [];

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
      onClick={onDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          padding: "36px 32px",
          maxWidth: "500px",
          width: "100%",
          animation: "fade-in 0.3s ease-out",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* X close button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "1px solid var(--border)",
              backgroundColor: "var(--surface)",
              color: "var(--text-muted)",
              fontSize: "18px",
              lineHeight: 1,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        )}

        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "6px", color: "var(--text-primary)" }}>
          Set Up Withdrawal Wallet
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px", lineHeight: "1.6" }}>
          Optional — only needed to withdraw earnings. You can skip this and set it up later.
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
            Generate New
          </button>
          <button style={tabStyle(tab === "connect")} onClick={() => { setTab("connect"); setError(""); }}>
            Connect Wallet
          </button>
        </div>

        {/* ─── Generate tab ─── */}
        {tab === "generate" && (
          <div>
            {genStep === "idle" && (
              <>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: "1.6" }}>
                  We'll create a new crypto wallet for you. You'll receive a 25-word recovery phrase — save it somewhere safe. Your public address will be saved so you can withdraw earnings.
                </p>
                <button
                  onClick={handleGenerate}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, var(--accent), #0d9488)",
                    color: "#060b0f",
                    fontSize: "15px",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Generate Wallet
                </button>
              </>
            )}

            {genStep === "loading" && (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: "14px" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "24px",
                    height: "24px",
                    border: "2px solid var(--border)",
                    borderTopColor: "var(--accent)",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    marginBottom: "12px",
                  }}
                />
                <div>Generating wallet…</div>
              </div>
            )}

            {genStep === "show_mnemonic" && (
              <>
                {/* Success address */}
                <div
                  style={{
                    backgroundColor: "rgba(45,212,191,0.08)",
                    border: "1px solid rgba(45,212,191,0.25)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    marginBottom: "20px",
                  }}
                >
                  <p style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent)", marginBottom: "4px" }}>
                    ✓ Wallet created — Public Address
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace", wordBreak: "break-all" }}>
                    {generatedAddress}
                  </p>
                </div>

                {/* Mnemonic phrase */}
                <div
                  style={{
                    backgroundColor: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: "10px",
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: "700", color: "var(--error)", marginBottom: "12px" }}>
                    ⚠ Save your recovery phrase — shown only once
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: "6px",
                      marginBottom: "4px",
                    }}
                  >
                    {mnemonicWords.map((word, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                          padding: "5px 4px",
                          textAlign: "center",
                        }}
                      >
                        <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block" }}>
                          {i + 1}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--text-primary)", fontWeight: "600" }}>
                          {word}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm checkbox */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    cursor: "pointer",
                    marginBottom: "20px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={mnemonicConfirmed}
                    onChange={(e) => setMnemonicConfirmed(e.target.checked)}
                    style={{ marginTop: "2px", accentColor: "var(--accent)", width: "16px", height: "16px" }}
                  />
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                    I've saved my recovery phrase in a safe place. I understand it cannot be shown again.
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
                      ? "linear-gradient(135deg, var(--accent), #0d9488)"
                      : "var(--surface)",
                    color: mnemonicConfirmed ? "#060b0f" : "var(--text-muted)",
                    fontSize: "15px",
                    fontWeight: "600",
                    border: "none",
                    cursor: mnemonicConfirmed ? "pointer" : "not-allowed",
                  }}
                >
                  Continue →
                </button>
              </>
            )}
          </div>
        )}

        {/* ─── Connect tab ─── */}
        {tab === "connect" && (
          <div>
            {/* Pera Wallet button */}
            <button
              onClick={handleConnectPera}
              disabled={peraConnecting || connectLoading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #FFEE55, #FFC800)",
                color: "#1A1A1A",
                fontSize: "15px",
                fontWeight: "700",
                border: "none",
                cursor: peraConnecting || connectLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "16px",
                opacity: peraConnecting ? 0.7 : 1,
              }}
            >
              {peraConnecting ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: "16px",
                      height: "16px",
                      border: "2px solid rgba(0,0,0,0.2)",
                      borderTopColor: "#1A1A1A",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Connecting…
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                    <rect width="40" height="40" rx="8" fill="#1A1A1A"/>
                    <path d="M8 20C8 13.4 13.4 8 20 8C26.6 8 32 13.4 32 20C32 26.6 26.6 32 20 32" stroke="#FFEE55" strokeWidth="3" strokeLinecap="round"/>
                    <circle cx="20" cy="20" r="4" fill="#FFEE55"/>
                  </svg>
                  Connect Pera Wallet
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-subtle)" }} />
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>or enter address manually</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-subtle)" }} />
            </div>

            {/* Manual address input */}
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: "1.6" }}>
              Enter your public wallet address. Only the address is stored — used to send withdrawal payments to you.
            </p>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Your wallet address (58 characters)"
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
              onClick={handleConnectManual}
              disabled={connectLoading || addressInput.trim().length !== 58}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "10px",
                background: addressInput.trim().length === 58
                  ? "linear-gradient(135deg, var(--accent), #0d9488)"
                  : "var(--surface)",
                color: addressInput.trim().length === 58 ? "#060b0f" : "var(--text-muted)",
                fontSize: "15px",
                fontWeight: "600",
                border: "none",
                cursor: connectLoading || addressInput.trim().length !== 58 ? "not-allowed" : "pointer",
                opacity: connectLoading ? 0.7 : 1,
              }}
            >
              {connectLoading ? "Saving…" : "Save Address"}
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

        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              marginTop: "16px",
              width: "100%",
              padding: "10px",
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Skip for now — set up wallet later
          </button>
        )}
      </div>
    </div>
  );
}
