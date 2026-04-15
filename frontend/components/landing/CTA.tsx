"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useMode } from "@/lib/contexts/ModeContext";

export default function CTA() {
  const { data: session } = useSession();
  const { mode } = useMode();
  const appHome = mode === "agent" ? "/test" : "/dashboard";

  return (
    <section style={{ padding: "96px 0" }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass glow-border"
          style={{
            borderRadius: "24px",
            padding: "64px 48px",
            textAlign: "center",
            maxWidth: "760px",
            margin: "0 auto",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "400px",
              height: "200px",
              background: "rgba(45,212,191,0.08)",
              filter: "blur(100px)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 10 }}>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: "700",
                color: "var(--text-primary)",
                marginBottom: "16px",
              }}
            >
              Ready to Monetize Your{" "}
              <span className="text-gradient">Digital Resources</span>?
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                maxWidth: "440px",
                margin: "0 auto 32px",
                fontSize: "15px",
                lineHeight: "1.6",
              }}
            >
              Join thousands of suppliers and AI agents on the first trustless resource marketplace.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                justifyContent: "center",
              }}
            >
              {session ? (
                <Link href={appHome} style={{ textDecoration: "none" }}>
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
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    ⚡ {mode === "agent" ? "Test the Flow" : "Open Dashboard"}
                  </button>
                </Link>
              ) : (
                <button
                  className="glow-border"
                  onClick={() => signIn("google", { callbackUrl: appHome })}
                  style={{
                    padding: "14px 32px",
                    borderRadius: "12px",
                    backgroundColor: "var(--accent)",
                    color: "#060b0f",
                    fontWeight: "700",
                    fontSize: "15px",
                    border: "none",
                    cursor: "pointer",
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
                    backgroundColor: "transparent",
                    color: "var(--text-primary)",
                    fontWeight: "600",
                    fontSize: "15px",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.backgroundColor = "var(--card-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  Try the Demo
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
