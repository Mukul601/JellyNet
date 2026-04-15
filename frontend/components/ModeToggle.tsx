"use client";

import { useMode } from "@/lib/contexts/ModeContext";
import type { Mode } from "@/lib/contexts/ModeContext";

export function ModeToggle() {
  const { mode, setMode } = useMode();

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: "5px 12px",
    fontSize: "12px",
    fontWeight: "600",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.15s",
    backgroundColor: active ? "var(--accent)" : "transparent",
    color: active ? "white" : "var(--text-muted)",
    letterSpacing: "0.02em",
  });

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
      {(["supplier", "agent"] as Mode[]).map((m) => (
        <button key={m} style={btnStyle(mode === m)} onClick={() => setMode(m)}>
          {m === "supplier" ? "Supplier" : "Agent"}
        </button>
      ))}
    </div>
  );
}
