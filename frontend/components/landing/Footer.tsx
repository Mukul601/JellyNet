"use client";

import Link from "next/link";

const links: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: "Marketplace", href: "/marketplace" },
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/docs#api-reference" },
    { label: "Quick Start", href: "/docs#quick-start" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "GitHub", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms of Service", href: "/legal/terms" },
    { label: "Cookie Policy", href: "/legal/cookies" },
  ],
};

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(45,212,191,0.1)",
        padding: "28px 0 20px",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "24px",
            marginBottom: "20px",
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  background: "linear-gradient(135deg, #2dd4bf, #0d9488)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: "700",
                  color: "#060b0f",
                  fontSize: "11px",
                }}
              >
                JN
              </div>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  fontSize: "15px",
                }}
              >
                Jelly<span style={{ color: "var(--accent)" }}>Net</span>
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              The Jelly Network — an agentic marketplace for API capacity. Powered by x402 micropayments.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h4
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                {heading}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {items.map((item) => (
                  <li key={item.label} style={{ marginBottom: "8px" }}>
                    <Link
                      href={item.href}
                      style={{
                        fontSize: "13px",
                        color: "var(--text-muted)",
                        textDecoration: "none",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: "16px",
            borderTop: "1px solid rgba(45,212,191,0.08)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            © 2026 JellyNet. All rights reserved.
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            x402 Protocol · USDC stablecoins · Multi-chain
          </p>
        </div>
      </div>
    </footer>
  );
}
