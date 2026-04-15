"use client";

import Link from "next/link";
import { NavLink } from "@/components/NavLink";
import { ModeToggle } from "@/components/ModeToggle";
import { NetworkBadge } from "@/components/NetworkBadge";
import { UserMenu } from "@/components/UserMenu";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* App Navbar */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          backgroundColor: "rgba(6, 11, 15, 0.85)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #2dd4bf, #0d9488)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#060b0f",
                }}
              >
                JN
              </div>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: "700",
                  fontSize: "16px",
                  color: "var(--text-primary)",
                }}
              >
                Jelly<span style={{ color: "var(--accent)" }}>Net</span>
              </span>
            </div>
          </Link>

          {/* Center nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, justifyContent: "center" }}>
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/test">Test Flow</NavLink>
          </nav>

          {/* Right: toggles + user */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <ModeToggle />
            <NetworkBadge />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main>{children}</main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "24px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "13px",
        }}
      >
        Built for{" "}
        <span style={{ color: "var(--accent)" }}>AlgoBharat Hack Series 3.0</span>{" "}
        · Powered by{" "}
        <a
          href="https://github.com/BofAI/x402"
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--text-secondary)", textDecoration: "none" }}
        >
          x402
        </a>{" "}
        + Algorand
      </footer>
    </>
  );
}
