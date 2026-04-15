"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Sarah K.",
    role: "Freelance Developer",
    text: "I had 3 unused API subscriptions sitting around. Listed them on JellyNet and now they earn me ~$200/month in ALGO passively. Absolutely wild.",
    avatar: "SK",
  },
  {
    name: "AgentFlow Labs",
    role: "AI Startup",
    text: "x402 micropayments changed our cost model. We pay per-call instead of committing to expensive enterprise plans. JellyNet's marketplace is a goldmine.",
    avatar: "AF",
  },
  {
    name: "Marcus T.",
    role: "Crypto Enthusiast",
    text: "I share my residential IP for web scraping agents and earn USDC daily. Setup took 90 seconds. This is the future of the sharing economy.",
    avatar: "MT",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" style={{ padding: "96px 0" }}>
      <div className="container">
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
            Loved by <span className="text-gradient">Early Users</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
            What our beta community is saying.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass"
              style={{
                borderRadius: "16px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Stars */}
              <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
                {Array.from({ length: 5 }).map((_, si) => (
                  <span key={si} style={{ color: "var(--accent)", fontSize: "14px" }}>★</span>
                ))}
              </div>

              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  lineHeight: "1.7",
                  flex: 1,
                }}
              >
                "{t.text}"
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "24px",
                  paddingTop: "16px",
                  borderTop: "1px solid rgba(45,212,191,0.1)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(45,212,191,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "var(--accent)",
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
                    {t.name}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
