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
  const [category, setCategory] = useState("developer-tools");
  const [description, setDescription] = useState("");
  const [rpmLimit, setRpmLimit] = useState(60);
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
        category,
        description: description || undefined,
        rpm_limit: rpmLimit,
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

      <form onSubmit={handleSubmit} autoComplete="off">
        <Field label="NAME" hint="e.g. My OpenAI Key">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My OpenAI Key"
            required
            autoComplete="off"
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
              autoComplete="new-password"
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

        <Field label="CATEGORY" hint="Helps buyers find your API">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <optgroup label="AI & Machine Learning">
              <option value="ai-ml">AI / Machine Learning</option>
              <option value="language-models">Language Models (LLMs)</option>
              <option value="image-generation">Image Generation</option>
              <option value="speech-audio">Speech & Audio</option>
              <option value="computer-vision">Computer Vision</option>
              <option value="embeddings">Embeddings</option>
            </optgroup>
            <optgroup label="Finance & Data">
              <option value="finance">Finance</option>
              <option value="crypto-data">Crypto Data</option>
              <option value="market-data">Market Data</option>
              <option value="data-analytics">Data & Analytics</option>
            </optgroup>
            <optgroup label="Web & Search">
              <option value="search">Search</option>
              <option value="web-scraping">Web Scraping</option>
            </optgroup>
            <optgroup label="Other">
              <option value="communication">Communication</option>
              <option value="location-maps">Location & Maps</option>
              <option value="weather">Weather</option>
              <option value="commerce">Commerce</option>
              <option value="media-content">Media & Content</option>
              <option value="security-identity">Security & Identity</option>
              <option value="developer-tools">Developer Tools</option>
              <option value="health-wellness">Health & Wellness</option>
              <option value="travel-transport">Travel & Transport</option>
            </optgroup>
          </select>
        </Field>

        <Field label="DESCRIPTION" hint="Optional — shown on marketplace">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Proxies OpenAI's chat completions API with x402 payment protection..."
            rows={2}
            style={{
              ...inputStyle,
              resize: "vertical",
              lineHeight: "1.5",
              minHeight: "60px",
            }}
          />
        </Field>

        <Field label="RATE LIMIT (RPM)" hint="Max requests per minute">
          <input
            type="number"
            value={rpmLimit}
            onChange={(e) => setRpmLimit(Number(e.target.value))}
            min={1}
            max={10000}
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
