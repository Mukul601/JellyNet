"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Testimonials", href: "#testimonials" },
];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        borderBottom: "1px solid rgba(45,212,191,0.1)",
        backgroundColor: "rgba(6,11,15,0.8)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #2dd4bf, #0d9488)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: "700",
              color: "#060b0f",
              fontSize: "13px",
            }}
          >
            JN
          </div>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: "600",
              fontSize: "18px",
              color: "var(--text-primary)",
            }}
          >
            Jelly<span style={{ color: "var(--accent)" }}>Net</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }} className="desktop-nav">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              {l.label}
            </a>
          ))}
          {session ? (
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  backgroundColor: "var(--accent)",
                  color: "#060b0f",
                  fontWeight: "600",
                  fontSize: "13px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Dashboard →
              </button>
            </Link>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                backgroundColor: "var(--accent)",
                color: "#060b0f",
                fontWeight: "600",
                fontSize: "13px",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Get Started
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontSize: "20px",
            display: "none",
          }}
          className="mobile-menu-btn"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          style={{
            borderTop: "1px solid rgba(45,212,191,0.1)",
            padding: "16px 24px",
            backgroundColor: "rgba(6,11,15,0.95)",
          }}
        >
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "12px 0",
                fontSize: "14px",
                color: "var(--text-secondary)",
                textDecoration: "none",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              if (session) {
                window.location.href = "/dashboard";
              } else {
                signIn("google", { callbackUrl: "/dashboard" });
              }
            }}
            style={{
              marginTop: "16px",
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              backgroundColor: "var(--accent)",
              color: "#060b0f",
              fontWeight: "600",
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {session ? "Dashboard →" : "Get Started"}
          </button>
        </motion.div>
      )}

      <style jsx>{`
        @media (min-width: 768px) {
          .mobile-menu-btn { display: none !important; }
          .desktop-nav { display: flex !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </motion.nav>
  );
}
