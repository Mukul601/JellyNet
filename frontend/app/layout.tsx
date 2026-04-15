import type { Metadata } from "next";
import { SessionProvider as _SessionProvider } from "next-auth/react";
const SessionProvider = _SessionProvider as React.ComponentType<{ children: React.ReactNode }>;
import "./globals.css";
import { ModeProvider } from "@/lib/contexts/ModeContext";
import { NetworkProvider } from "@/lib/contexts/NetworkContext";

export const metadata: Metadata = {
  title: "JellyNet — Agentic API Marketplace",
  description:
    "Monetize API keys, bandwidth, and compute via x402 micropayments on Algorand. Built for AlgoBharat Hack Series 3.0.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: "var(--background)",
          color: "var(--text-primary)",
          minHeight: "100vh",
        }}
      >
        <SessionProvider>
          <ModeProvider>
            <NetworkProvider>
              {children}
            </NetworkProvider>
          </ModeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
