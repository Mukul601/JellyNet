"use client";

import { useState } from "react";
import { createSupplier } from "@/lib/api";

interface Props {
  token: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddKeyForm({ token, onSuccess, onCancel }: Props) {
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [targetUrl, setTargetUrl] = useState("https://api.openai.com");
  const [minPrice, setMinPrice] = useState(100);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createSupplier({
        name,
        api_key: apiKey,
        target_url: targetUrl,
        min_price_usdca: minPrice,
      }, token);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add key");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "32px",
        width: "480px",
        maxWidth: "100vw",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Add API Key</h2>
        <button
          onClick={onCancel}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: "20px",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <Field label="NAME" hint="e.g. My OpenAI Key">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My OpenAI Key"
            required
            style={inputStyle}
          />
        </Field>

        <Field label="API KEY" hint="Stored encrypted — never exposed">
          <div style={{ position: "relative" }}>
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              required
              style={{ ...inputStyle, paddingRight: "48px" }}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              {showKey ? "hide" : "show"}
            </button>
          </div>
        </Field>

        <Field label="TARGET URL" hint="Upstream API base URL">
          <input
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://api.openai.com"
            required
            type="url"
            style={inputStyle}
          />
        </Field>

        <Field
          label="MIN PRICE (µUSDC)"
          hint="100 = $0.0001 per call · 1,000,000 µUSDC = $1"
        >
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            min={1}
            required
            style={inputStyle}
          />
        </Field>

        {error && (
          <div
            style={{
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "var(--error-dim)",
              border: "1px solid var(--error)",
              color: "var(--error)",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: "10px",
              backgroundColor: "var(--surface)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 2,
              padding: "11px",
              borderRadius: "10px",
              background: loading
                ? "var(--border)"
                : "linear-gradient(135deg, #6366f1, #7c3aed)",
              color: "white",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "700",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: "14px",
                    height: "14px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Generating endpoint…
              </>
            ) : (
              "Generate Endpoint"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "7px",
        }}
      >
        <label
          style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "var(--text-secondary)",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </label>
        {hint && (
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

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
  transition: "border-color 0.15s",
};
