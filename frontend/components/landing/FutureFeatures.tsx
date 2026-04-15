"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "📦",
    title: "API Stacking",
    desc: "Chain multiple APIs into composable bundles — agents get multi-step workflows in a single call.",
    status: "Q2 2026",
  },
  {
    icon: "📡",
    title: "Residential IP Network",
    desc: "Monetize your home internet connection as a trusted proxy for AI web agents.",
    status: "Q2 2026",
  },
  {
    icon: "🌐",
    title: "MCP Web Limits",
    desc: "Sell access to your authenticated web sessions and platform limits via Model Context Protocol.",
    status: "Q3 2026",
  },
  {
    icon: "💻",
    title: "Device Compute",
    desc: "Share idle GPU/CPU cycles for AI inference tasks and earn per-computation.",
    status: "Q3 2026",
  },
];

export default function FutureFeatures() {
  return (
    <section style={{ padding: "96px 0", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "rgba(45,212,191,0.025)",
          filter: "blur(140px)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: "64px" }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "12px",
            }}
          >
            What&apos;s <span className="text-gradient">Coming Next</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", maxWidth: "480px", margin: "0 auto" }}>
            We&apos;re building the full-stack agentic resource marketplace.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "24px",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass"
              style={{
                borderRadius: "16px",
                padding: "24px",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(45,212,191,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(45,212,191,0.1)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(45,212,191,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                  }}
                >
                  {f.icon}
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontFamily: "monospace",
                    color: "rgba(45,212,191,0.6)",
                    backgroundColor: "rgba(45,212,191,0.05)",
                    padding: "3px 8px",
                    borderRadius: "999px",
                  }}
                >
                  {f.status}
                </span>
              </div>
              <h4
                style={{
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                  fontSize: "15px",
                }}
              >
                {f.title}
              </h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
