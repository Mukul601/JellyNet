"use client";

import { useState } from "react";
import type { Endpoint } from "@/lib/types";
import {
  formatUsdca,
  getExplorerAddressUrl,
  truncateAddress,
} from "@/lib/algorand";

interface Props {
  endpoint: Endpoint;
}

export function EndpointCard({ endpoint }: Props) {
  const [copied, setCopied] = useState(false);

  function copyUrl() {
    navigator.clipboard.writeText(endpoint.proxy_url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const explorerUrl = getExplorerAddressUrl(endpoint.earnings_address);
  const totalEarned = formatUsdca(endpoint.total_earned_usdca);
  const priceLabel = `${endpoint.min_price_usdca} µUSDC/call`;

  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "24px",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent-dim)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "var(--accent)",
            letterSpacing: "0.08em",
          }}
        >
          PROXY ENDPOINT
        </div>
        <span
          style={{
            padding: "3px 10px",
            borderRadius: "999px",
            backgroundColor: "var(--success-dim)",
            color: "var(--success)",
            fontSize: "11px",
            fontWeight: "700",
          }}
        >
          LIVE
        </span>
      </div>

      {/* Proxy URL */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "8px",
          padding: "10px 14px",
        }}
      >
        <code
          style={{
            flex: 1,
            fontSize: "12px",
            color: "var(--text-secondary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontFamily: "monospace",
          }}
        >
          {endpoint.proxy_url || `…/proxy/${endpoint.endpoint_id.slice(0, 8)}…`}
        </code>
        <button
          onClick={copyUrl}
          style={{
            background: "none",
            border: "none",
            color: copied ? "var(--success)" : "var(--text-muted)",
            cursor: "pointer",
            fontSize: "13px",
            whiteSpace: "nowrap",
            padding: "0",
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      {/* Earnings address */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: "600",
            color: "var(--text-muted)",
            marginBottom: "6px",
            letterSpacing: "0.05em",
          }}
        >
          EARNINGS ADDRESS
        </div>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--accent-light)",
            fontSize: "13px",
            fontFamily: "monospace",
            textDecoration: "none",
          }}
        >
          {truncateAddress(endpoint.earnings_address, 8)}
          <span style={{ fontSize: "11px", opacity: 0.7 }}>↗</span>
        </a>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "12px",
          paddingTop: "16px",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <Stat label="Calls" value={String(endpoint.call_count)} />
        <Stat label="Earned" value={totalEarned} accent />
        <Stat label="Min Price" value={priceLabel} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          marginBottom: "4px",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "14px",
          fontWeight: "700",
          color: accent ? "var(--success)" : "var(--text-primary)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
