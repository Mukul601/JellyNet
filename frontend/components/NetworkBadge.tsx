"use client";

import { useNetwork } from "@/lib/contexts/NetworkContext";
import type { Network } from "@/lib/contexts/NetworkContext";

export function NetworkBadge() {
  const { network, setNetwork } = useNetwork();

  const isTestnet = network === "testnet";

  return (
    <div
      style={{
        display: "flex",
        gap: "2px",
        padding: "3px",
        backgroundColor: "var(--surface)",
        borderRadius: "8px",
        border: "1px solid var(--border)",
      }}
    >
      {(["testnet", "mainnet"] as Network[]).map((n) => {
        const active = network === n;
        return (
          <button
            key={n}
            onClick={() => setNetwork(n)}
            style={{
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: "700",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
              letterSpacing: "0.06em",
              backgroundColor: active
                ? n === "testnet"
                  ? "var(--accent-dim)"
                  : "rgba(249,115,22,0.15)"
                : "transparent",
              color: active
                ? n === "testnet"
                  ? "var(--accent-light)"
                  : "#f97316"
                : "var(--text-muted)",
            }}
          >
            {n === "testnet" ? "TESTNET" : "MAINNET"}
          </button>
        );
      })}
    </div>
  );
}

/** Full-page overlay shown on transactional pages when mainnet is selected */
export function MainnetOverlay() {
  const { isTestnet, setNetwork } = useNetwork();
  if (isTestnet) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(8,8,16,0.85)",
        backdropFilter: "blur(6px)",
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "48px",
          lineHeight: 1,
        }}
      >
        🚧
      </div>
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "800",
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}
      >
        Mainnet Coming Soon
      </h2>
      <p
        style={{
          fontSize: "15px",
          color: "var(--text-muted)",
          maxWidth: "360px",
          lineHeight: "1.6",
        }}
      >
        JellyNet is currently live on <strong style={{ color: "var(--accent-light)" }}>Algorand Testnet</strong>.
        Mainnet launch is coming — switch back to Testnet to use all features now.
      </p>
      <button
        onClick={() => setNetwork("testnet")}
        style={{
          padding: "12px 28px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "white",
          fontSize: "15px",
          fontWeight: "700",
          border: "none",
          cursor: "pointer",
        }}
      >
        Switch to Testnet
      </button>
    </div>
  );
}
