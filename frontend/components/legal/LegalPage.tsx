import Link from "next/link";

interface Section {
  title: string;
  body: string;
}

interface Props {
  title: string;
  lastUpdated: string;
  sections: Section[];
}

export function LegalPage({ title, lastUpdated, sections }: Props) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      {/* Top nav */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          backgroundColor: "rgba(6,11,15,0.9)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "6px",
                background: "linear-gradient(135deg, #2dd4bf, #0d9488)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: "700",
                color: "#060b0f",
                fontSize: "11px",
                flexShrink: 0,
              }}
            >
              JN
            </div>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: "700",
                fontSize: "15px",
                color: "var(--text-primary)",
              }}
            >
              Jelly<span style={{ color: "var(--accent)" }}>Net</span>
            </span>
          </Link>
          <div style={{ display: "flex", gap: "16px" }}>
            <Link href="/legal/privacy" style={navLinkStyle}>Privacy</Link>
            <Link href="/legal/terms" style={navLinkStyle}>Terms</Link>
            <Link href="/legal/cookies" style={navLinkStyle}>Cookies</Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "56px 24px 96px" }}>
        {/* Header */}
        <div style={{ marginBottom: "48px", paddingBottom: "32px", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent)", letterSpacing: "0.1em", marginBottom: "10px" }}>
            LEGAL
          </p>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "var(--text-primary)",
              margin: "0 0 12px",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
          {sections.map((s) => (
            <div key={s.title}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  marginBottom: "12px",
                }}
              >
                {s.title}
              </h2>
              <div>
                {s.body.split("\n\n").map((para, i) => (
                  <p
                    key={i}
                    style={{
                      fontSize: "14px",
                      color: "var(--text-secondary)",
                      lineHeight: "1.75",
                      marginBottom: "12px",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {para.replace(/\*\*(.*?)\*\*/g, (_, t) => t)}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const navLinkStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "var(--text-secondary)",
  textDecoration: "none",
};
