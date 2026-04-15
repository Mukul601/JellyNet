"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

export default function Hero() {
  const { data: session } = useSession();

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        paddingTop: "64px",
      }}
    >
      {/* Background glow effects */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "800px",
            borderRadius: "50%",
            background: "rgba(45, 212, 191, 0.04)",
            filter: "blur(120px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(45, 212, 191, 0.025)",
            filter: "blur(100px)",
          }}
        />
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.03,
            backgroundImage:
              "linear-gradient(rgba(45,212,191,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <div
            className="glass"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "999px",
              marginBottom: "32px",
            }}
          >
            <span
              className="glow-dot"
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "var(--accent)",
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-secondary)" }}>
              Powered by Algorand x402 Protocol
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 72px)",
              fontWeight: "700",
              lineHeight: "1.1",
              letterSpacing: "-0.03em",
              marginBottom: "24px",
              color: "var(--text-primary)",
            }}
          >
            Turn Unused APIs &amp; Resources Into{" "}
            <span className="text-gradient">Passive Crypto Income</span>
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "0 auto 40px",
              lineHeight: "1.7",
            }}
          >
            AI agents pay you instantly — no keys, no accounts. List any API,
            IP address, or compute power and earn ALGO &amp; USDC with every
            request through trustless micropayments.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
            {session ? (
              <Link href="/dashboard" style={{ textDecoration: "none" }}>
                <button
                  className="glow-border"
                  style={{
                    padding: "14px 32px",
                    borderRadius: "12px",
                    backgroundColor: "var(--accent)",
                    color: "#060b0f",
                    fontWeight: "700",
                    fontSize: "15px",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  ⚡ Open Dashboard
                </button>
              </Link>
            ) : (
              <button
                className="glow-border"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                style={{
                  padding: "14px 32px",
                  borderRadius: "12px",
                  backgroundColor: "var(--accent)",
                  color: "#060b0f",
                  fontWeight: "700",
                  fontSize: "15px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                ⚡ Join the Waitlist
              </button>
            )}
            <Link href="/test" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "14px 32px",
                  borderRadius: "12px",
                  backgroundColor: "var(--card)",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                  fontSize: "15px",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.backgroundColor = "var(--card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.backgroundColor = "var(--card)";
                }}
              >
                ▶ Try the Demo
              </button>
            </Link>
          </div>

          {/* Trust bullets */}
          <div
            style={{
              marginTop: "64px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "32px",
              color: "var(--text-muted)",
              fontSize: "13px",
            }}
          >
            {["Zero setup", "Instant payouts", "Non-custodial"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "var(--accent)",
                    display: "inline-block",
                  }}
                />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
