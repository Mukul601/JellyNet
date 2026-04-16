"use client";

import Link from "next/link";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "quick-start", label: "Quick Start" },
  { id: "payment-flow", label: "Payment Flow" },
  { id: "api-reference", label: "API Reference" },
  { id: "faq", label: "FAQ" },
];

export default function DocsPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      {/* Minimal top nav */}
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
            maxWidth: "1100px",
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
            <span style={{ color: "var(--border)", marginLeft: "4px" }}>/</span>
            <span style={{ fontSize: "14px", color: "var(--text-muted)", marginLeft: "4px" }}>
              Docs
            </span>
          </Link>
          <Link
            href="/marketplace"
            style={{
              fontSize: "13px",
              color: "var(--accent)",
              textDecoration: "none",
              padding: "6px 14px",
              border: "1px solid rgba(45,212,191,0.3)",
              borderRadius: "8px",
            }}
          >
            Browse Marketplace →
          </Link>
        </div>
      </header>

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "48px 24px",
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: "48px",
          alignItems: "start",
        }}
      >
        {/* Sidebar */}
        <aside style={{ position: "sticky", top: "80px" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "var(--text-muted)",
              letterSpacing: "0.08em",
              marginBottom: "12px",
            }}
          >
            ON THIS PAGE
          </p>
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  transition: "background-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--surface)";
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ minWidth: 0 }}>

          {/* ── Overview ─────────────────────────────────────── */}
          <section id="overview" style={{ marginBottom: "64px" }}>
            <Eyebrow>Overview</Eyebrow>
            <H2>What is JellyNet?</H2>
            <P>
              JellyNet is an open marketplace where API suppliers list their endpoints and AI agents
              (or any HTTP client) pay per request using x402 micropayments in USDC. There are no
              subscriptions, no API keys to manage on the consumer side, and no minimum spend.
            </P>
            <P>
              The platform handles payment verification, rate-limiting, and proxying automatically.
              Suppliers earn USDC every time their endpoint is called. Earnings accumulate in a
              custodial balance and can be withdrawn to any wallet address at any time.
            </P>

            <H3>The x402 Protocol</H3>
            <P>
              x402 reuses HTTP status code <Code>402 Payment Required</Code> as a machine-readable
              signal. When a consumer calls a protected endpoint without payment, the server returns
              a <Code>402</Code> response with a <Code>X-Payment-Requirements</Code> header
              describing the price and payment destination. The client pays on-chain, attaches the
              proof in an <Code>X-Payment</Code> header, and retries — the server verifies and
              proxies through.
            </P>
            <P>
              This makes micropayments as easy as a standard HTTP request. Any AI agent, script, or
              CLI can integrate without OAuth flows or billing accounts.
            </P>
          </section>

          {/* ── Quick Start ───────────────────────────────────── */}
          <section id="quick-start" style={{ marginBottom: "64px" }}>
            <Eyebrow>Quick Start</Eyebrow>
            <H2>Get started in minutes</H2>

            <H3>For API Suppliers</H3>
            <Steps>
              <Step n={1} title="Sign in">
                Go to <Link href="/dashboard" style={linkStyle}>Dashboard</Link> and sign in with
                Google.
              </Step>
              <Step n={2} title="Add your API key">
                Click <strong>Add API Key</strong>. Enter your upstream API key, the base URL of the
                upstream service, a minimum price per request (in µUSDC), a category, and an optional
                description.
              </Step>
              <Step n={3} title="Generate a proxy endpoint">
                After creating a supplier, click <strong>Generate Endpoint</strong>. JellyNet creates
                a unique proxy URL that wraps your upstream API with x402 payment protection.
              </Step>
              <Step n={4} title="List on the marketplace">
                Your endpoint is immediately visible on the{" "}
                <Link href="/marketplace" style={linkStyle}>Marketplace</Link>. Buyers can discover
                it by category, name, or description.
              </Step>
              <Step n={5} title="Earn USDC">
                Every successful call credits your account balance (after the platform fee). Go to
                Dashboard → Earnings to track and withdraw.
              </Step>
            </Steps>

            <H3 style={{ marginTop: "32px" }}>For AI Agents & Developers</H3>
            <Steps>
              <Step n={1} title="Find an endpoint">
                Browse the <Link href="/marketplace" style={linkStyle}>Marketplace</Link> and copy
                a proxy URL.
              </Step>
              <Step n={2} title="Fund a wallet">
                Get USDC-compatible stablecoins on a supported chain and fund the wallet you&apos;ll
                use to pay.
              </Step>
              <Step n={3} title="Call the endpoint">
                Make a normal HTTP request. On first call you&apos;ll receive a{" "}
                <Code>402</Code> response. Pay, attach the proof, and retry.
              </Step>
            </Steps>

            <CodeBlock title="Example — Python agent">{`import httpx

PROXY = "https://api.jellynet.xyz/p/<endpoint-id>"
WALLET_MNEMONIC = "your 25-word mnemonic"

resp = httpx.get(PROXY + "/v1/models")
if resp.status_code == 402:
    reqs = resp.headers["X-Payment-Requirements"]
    payment_header = pay(reqs, WALLET_MNEMONIC)   # see SDK docs
    resp = httpx.get(
        PROXY + "/v1/models",
        headers={"X-Payment": payment_header},
    )

print(resp.json())`}</CodeBlock>
          </section>

          {/* ── Payment Flow ─────────────────────────────────── */}
          <section id="payment-flow" style={{ marginBottom: "64px" }}>
            <Eyebrow>Payment Flow</Eyebrow>
            <H2>How payments work</H2>

            <FlowStep n={1} label="Consumer calls proxy URL">
              Any HTTP client sends a request to the JellyNet proxy URL for the desired endpoint.
            </FlowStep>
            <FlowStep n={2} label="402 returned if no payment">
              The proxy returns <Code>402 Payment Required</Code> with a{" "}
              <Code>X-Payment-Requirements</Code> header containing the price (in µUSDC), the
              platform&apos;s payment address, and the accepted chain.
            </FlowStep>
            <FlowStep n={3} label="Client pays on-chain">
              The client sends a USDC transaction to the platform wallet. The tx hash and
              amount are encoded into an <Code>X-Payment</Code> header.
            </FlowStep>
            <FlowStep n={4} label="Proxy verifies on-chain">
              JellyNet queries the chain to confirm the transaction is confirmed and the correct
              amount was received.
            </FlowStep>
            <FlowStep n={5} label="Request proxied upstream">
              The proxy injects the real API key into the forwarded request and returns the upstream
              response to the consumer.
            </FlowStep>
            <FlowStep n={6} label="Supplier credited">
              The supplier&apos;s balance is credited for the payment amount minus the platform fee
              (currently 10%). Earnings accumulate and can be withdrawn at any time.
            </FlowStep>
          </section>

          {/* ── API Reference ────────────────────────────────── */}
          <section id="api-reference" style={{ marginBottom: "64px" }}>
            <Eyebrow>API Reference</Eyebrow>
            <H2>Backend endpoints</H2>
            <P>
              All endpoints are served at <Code>https://api.jellynet.xyz</Code> (or your local
              backend at <Code>http://localhost:8000</Code> during development). Protected routes
              require a bearer token from a JellyNet session.
            </P>

            <H3>Public</H3>
            <ApiTable rows={[
              ["GET", "/api/keys/public", "No", "List all public endpoints with optional filters: ?category=, ?search=, ?verified_only=true, ?sort_by=newest|price_asc|price_desc|health_desc"],
              ["GET", "/api/categories", "No", "List all categories and subcategories"],
            ]} />

            <H3 style={{ marginTop: "28px" }}>Auth</H3>
            <ApiTable rows={[
              ["GET", "/api/auth/me", "Yes", "Get current user profile"],
              ["POST", "/api/auth/wallet/generate", "Yes", "Generate a new custodial withdrawal wallet"],
              ["POST", "/api/auth/wallet/connect", "Yes", "Connect an existing wallet address for withdrawals"],
            ]} />

            <H3 style={{ marginTop: "28px" }}>Suppliers & Endpoints</H3>
            <ApiTable rows={[
              ["GET", "/api/keys", "Yes", "List your suppliers and endpoints"],
              ["POST", "/api/keys", "Yes", "Create a supplier (name, api_key, target_url, min_price_usdca, category, description, rpm_limit)"],
              ["POST", "/api/keys/:id/generate", "Yes", "Generate a proxy endpoint for a supplier"],
            ]} />

            <H3 style={{ marginTop: "28px" }}>Payments</H3>
            <ApiTable rows={[
              ["GET", "/api/payments/balance", "Yes", "Get your USDC balance and available amount"],
              ["POST", "/api/payments/withdraw", "Yes", "Request a withdrawal (to_address, amount_usdca, chain)"],
              ["GET", "/api/payments/withdrawals", "Yes", "List your withdrawal history"],
            ]} />

            <H3 style={{ marginTop: "28px" }}>Transactions</H3>
            <ApiTable rows={[
              ["GET", "/api/transactions", "Yes", "List transactions (?endpoint_id=, ?limit=50)"],
            ]} />

            <H3 style={{ marginTop: "28px" }}>Test Flow</H3>
            <ApiTable rows={[
              ["POST", "/api/test/run", "Yes", "Run a test x402 payment call (endpoint_id, path, method, mnemonic)"],
            ]} />
          </section>

          {/* ── FAQ ──────────────────────────────────────────── */}
          <section id="faq" style={{ marginBottom: "64px" }}>
            <Eyebrow>FAQ</Eyebrow>
            <H2>Frequently Asked Questions</H2>

            <FaqItem q="What chains are supported?">
              JellyNet currently operates on Algorand testnet with USDC (ASA 10458941). Multi-chain
              support including Polygon, Base, and other EVM networks is on the roadmap.
            </FaqItem>

            <FaqItem q="What is the platform fee?">
              JellyNet takes a 10% fee on each payment. The remaining 90% is credited to the
              supplier&apos;s balance.
            </FaqItem>

            <FaqItem q="Do I need a wallet to list my API?">
              No. You can list your API and start earning without a wallet. You only need a wallet
              when you want to withdraw your accumulated USDC balance.
            </FaqItem>

            <FaqItem q="How do I withdraw my earnings?">
              Go to Dashboard → Earnings and click Withdraw. If you haven&apos;t set up a wallet
              yet, you&apos;ll be prompted to generate one or connect an existing address.
            </FaqItem>

            <FaqItem q="Are payments final?">
              Yes. On-chain USDC transactions are irreversible once confirmed. Make sure your
              agent is calling the correct endpoint before attaching a payment header.
            </FaqItem>

            <FaqItem q="Is this production-ready?">
              JellyNet is currently in beta running on testnet. Do not use mainnet funds. APIs
              and endpoints may change without notice during the beta period.
            </FaqItem>
          </section>

        </main>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent)", letterSpacing: "0.1em", marginBottom: "8px" }}>
      {children}
    </p>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px", marginTop: 0 }}>
      {children}
    </h2>
  );
}

function H3({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "12px", marginTop: "24px", ...style }}>
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "14px" }}>
      {children}
    </p>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{ fontSize: "12px", fontFamily: "monospace", backgroundColor: "var(--surface)", padding: "2px 6px", borderRadius: "4px", color: "var(--accent-light)", border: "1px solid var(--border-subtle)" }}>
      {children}
    </code>
  );
}

function Steps({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{children}</div>;
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
      <div style={{
        width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--accent)",
        color: "#060b0f", fontSize: "11px", fontWeight: "700", display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px",
      }}>
        {n}
      </div>
      <div>
        <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 3px" }}>{title}</p>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.6" }}>{children}</p>
      </div>
    </div>
  );
}

function FlowStep({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "14px", marginBottom: "16px", alignItems: "flex-start" }}>
      <div style={{
        width: "28px", height: "28px", borderRadius: "8px",
        backgroundColor: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.25)",
        color: "var(--accent)", fontSize: "12px", fontWeight: "700",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {n}
      </div>
      <div>
        <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 3px" }}>{label}</p>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.6" }}>{children}</p>
      </div>
    </div>
  );
}

function CodeBlock({ title, children }: { title: string; children: string }) {
  return (
    <div style={{ marginTop: "20px", marginBottom: "20px", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border)" }}>
      <div style={{ padding: "8px 14px", backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)", fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>
        {title}
      </div>
      <pre style={{ margin: 0, padding: "16px", backgroundColor: "var(--card)", color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.6", overflowX: "auto", fontFamily: "monospace" }}>
        {children}
      </pre>
    </div>
  );
}

function ApiTable({ rows }: { rows: [string, string, string, string][] }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid var(--border)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ backgroundColor: "var(--surface)" }}>
            {["Method", "Path", "Auth", "Description"].map((h) => (
              <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-muted)", fontWeight: "600", fontSize: "11px", letterSpacing: "0.06em", borderBottom: "1px solid var(--border)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([method, path, auth, desc], i) => (
            <tr key={path} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
              <td style={{ padding: "10px 14px" }}>
                <span style={{
                  fontSize: "11px", fontWeight: "700", padding: "2px 7px", borderRadius: "5px",
                  backgroundColor: method === "GET" ? "rgba(34,197,94,0.1)" : "rgba(99,102,241,0.1)",
                  color: method === "GET" ? "#22c55e" : "#818cf8",
                }}>
                  {method}
                </span>
              </td>
              <td style={{ padding: "10px 14px", fontFamily: "monospace", color: "var(--text-primary)", fontSize: "12px" }}>{path}</td>
              <td style={{ padding: "10px 14px", color: auth === "Yes" ? "var(--accent)" : "var(--text-muted)", fontSize: "12px" }}>{auth}</td>
              <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "20px", marginBottom: "20px" }}>
      <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "8px" }}>{q}</p>
      <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.7" }}>{children}</p>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  color: "var(--accent)",
  textDecoration: "none",
};
