"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginModal() {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          padding: "48px 40px",
          maxWidth: "420px",
          width: "calc(100% - 48px)",
          textAlign: "center",
          animation: "fade-in 0.3s ease-out",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: "800",
            color: "white",
            margin: "0 auto 24px",
          }}
        >
          V
        </div>

        <h2
          style={{
            fontSize: "22px",
            fontWeight: "700",
            color: "var(--text-primary)",
            marginBottom: "8px",
          }}
        >
          Welcome to JellyNet
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-muted)",
            marginBottom: "32px",
            lineHeight: "1.6",
          }}
        >
          Sign in to monetize your API keys or run AI agent test calls — one account, both modes.
        </p>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px 24px",
            borderRadius: "12px",
            backgroundColor: "white",
            color: "#1a1a1a",
            fontSize: "15px",
            fontWeight: "600",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            opacity: loading ? 0.7 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {/* Google G icon */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loading ? "Signing in…" : "Continue with Google"}
        </button>

        <p
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            marginTop: "20px",
            lineHeight: "1.5",
          }}
        >
          Pay per call · USDC stablecoins · x402 protocol
        </p>
      </div>
    </div>
  );
}
