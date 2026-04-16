"use client";

import { motion } from "framer-motion";

const steps = [
  {
    emoji: "📤",
    step: "01",
    title: "Add Your Resource",
    desc: "Paste an API key, configure a proxy endpoint, or share device compute — takes under 2 minutes.",
  },
  {
    emoji: "🔗",
    step: "02",
    title: "List On-Chain",
    desc: "Your resource gets a unique x402-protected proxy endpoint with payment headers built in.",
  },
  {
    emoji: "🪙",
    step: "03",
    title: "Earn USDC",
    desc: "Every time an AI agent calls your endpoint, you get paid instantly. Watch earnings stack up in real-time.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: "96px 0", position: "relative" }}>
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "rgba(45, 212, 191, 0.025)",
          filter: "blur(150px)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 10 }}>
        {/* Header */}
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
            How It <span className="text-gradient">Works</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
            Three simple steps to start earning from your unused digital resources.
          </p>
        </motion.div>

        {/* Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "32px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              style={{ textAlign: "center", position: "relative" }}
            >
              {/* Connector line (desktop only) */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: "40px",
                    left: "60%",
                    width: "80%",
                    height: "1px",
                    background: "linear-gradient(to right, rgba(45,212,191,0.4), transparent)",
                  }}
                />
              )}

              {/* Icon */}
              <div
                className="glass glow-border"
                style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto 24px",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                }}
              >
                {s.emoji}
              </div>

              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: "var(--accent)",
                  fontWeight: "700",
                  letterSpacing: "0.1em",
                }}
              >
                STEP {s.step}
              </span>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  marginTop: "8px",
                  marginBottom: "12px",
                }}
              >
                {s.title}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
