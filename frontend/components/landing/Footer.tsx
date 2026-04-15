const links = {
  Product: ["Marketplace", "Pricing", "Documentation", "API Reference"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(45,212,191,0.1)",
        padding: "48px 0",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "32px",
            marginBottom: "48px",
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
              The Jelly Network — an agentic marketplace for unused digital resources. Powered by Algorand.
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
                  <li key={item} style={{ marginBottom: "8px" }}>
                    <a
                      href="#"
                      style={{
                        fontSize: "13px",
                        color: "var(--text-muted)",
                        textDecoration: "none",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: "32px",
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
            Built on <span style={{ color: "var(--accent)" }}>Algorand</span> · x402 Protocol ·{" "}
            <a
              href="https://algobharat.in"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--text-muted)", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              AlgoBharat Hack Series 3.0
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
