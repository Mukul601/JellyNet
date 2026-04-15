"use client";

import { useEffect, useState } from "react";
import { listTransactions } from "@/lib/api";
import type { Transaction } from "@/lib/types";
import {
  formatUsdca,
  getExplorerTxUrl,
  relativeTime,
  truncateAddress,
  truncateTxHash,
} from "@/lib/algorand";

interface Props {
  token: string;
  endpointId?: string;
  limit?: number;
}

const STATUS_COLOR: Record<string, string> = {
  confirmed: "var(--success)",
  pending: "var(--warning)",
  failed: "var(--error)",
};

const STATUS_BG: Record<string, string> = {
  confirmed: "var(--success-dim)",
  pending: "var(--warning-dim)",
  failed: "var(--error-dim)",
};

export function TransactionLog({ token, endpointId, limit = 20 }: Props) {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await listTransactions(token, endpointId, limit);
      setTxns(data);
    } catch {
      // silently fail — non-critical widget
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Poll every 6 seconds to show new confirmed transactions
    const interval = setInterval(load, 6000);
    return () => clearInterval(interval);
  }, [endpointId]);

  if (loading) {
    return (
      <div
        style={{
          padding: "32px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "13px",
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
        }}
      >
        Loading transactions…
      </div>
    );
  }

  if (txns.length === 0) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "14px",
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
        }}
      >
        No transactions yet. Run a test call to see payments here.
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{
              borderBottom: "1px solid var(--border)",
            }}
          >
            {["TX Hash", "Amount", "Payer", "Status", "Time"].map((col) => (
              <th
                key={col}
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "var(--text-muted)",
                  letterSpacing: "0.07em",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {txns.map((t, i) => (
            <tr
              key={t.id}
              style={{
                borderBottom:
                  i < txns.length - 1 ? "1px solid var(--border-subtle)" : "none",
                transition: "background-color 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--card-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <td style={cellStyle}>
                <a
                  href={getExplorerTxUrl(t.tx_hash)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "var(--accent-light)",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    textDecoration: "none",
                  }}
                >
                  {truncateTxHash(t.tx_hash)} ↗
                </a>
              </td>
              <td style={cellStyle}>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--success)",
                  }}
                >
                  {formatUsdca(t.amount_usdca)}
                </span>
              </td>
              <td style={cellStyle}>
                <code
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    fontFamily: "monospace",
                  }}
                >
                  {truncateAddress(t.payer_address)}
                </code>
              </td>
              <td style={cellStyle}>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: STATUS_COLOR[t.status] ?? "var(--text-muted)",
                    backgroundColor:
                      STATUS_BG[t.status] ?? "var(--surface)",
                  }}
                >
                  {t.status.toUpperCase()}
                </span>
              </td>
              <td style={cellStyle}>
                <span
                  style={{ fontSize: "12px", color: "var(--text-muted)" }}
                >
                  {relativeTime(t.created_at)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  padding: "12px 16px",
  verticalAlign: "middle",
};
