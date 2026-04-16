"use client";

import { motion } from "framer-motion";

const suppliers = [
  {
    icon: "💰",
    title: "Earn While You Sleep",
    desc: "List unused API keys, IP addresses, or spare compute — AI agents pay you per-request in ALGO or USDC.",
  },
  {
    icon: "🛡️",
    title: "No Technical Skills Needed",
    desc: "Our dashboard walks you through every step. Paste an API key, set your price, and start earning.",
  },
  {
    icon: "🌐",
    title: "Global Marketplace",
    desc: "Your resources are accessible to thousands of AI agents worldwide, 24/7, with zero downtime.",
  },
];

const agents = [
  {
    icon: "🤖",
    title: "Instant API Access",
    desc: "Pay-per-call with x402 headers. No signup, no API keys to manage — just send a request and pay.",
  },
  {
    icon: "🔒",
    title: "Trustless & Verifiable",
    desc: "Every transaction is verified on-chain. Transparent pricing, no vendor lock-in.",
  },
  {
    icon: "🗺️",
    title: "Discover Any Resource",
    desc: "Browse a curated marketplace of APIs, proxies, compute nodes — all priced in micropayments.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

function CardGrid({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: typeof suppliers;
}) {
  return (
    <div>
      <h3
        style={{
          fontSize: "24px",
          fontWeight: "600",
          color: "var(--text-primary)",
          marginBottom: "8px",
        }}
      >
        {title}
      </h3>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "15px" }}>
        {subtitle}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px",
        }}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={cardVariants}
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
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "rgba(45,212,191,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                marginBottom: "16px",
              }}
            >
              {item.icon}
            </div>
            <h4
              style={{
                fontWeight: "600",
                color: "var(--text-primary)",
                marginBottom: "8px",
                fontSize: "16px",
              }}
            >
              {item.title}
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function ValueProps() {
  return (
    <section id="features" style={{ padding: "96px 0" }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "12px",
            }}
          >
            Built for <span className="text-gradient">Everyone</span>
          </motion.h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto", fontSize: "15px" }}>
            Whether you have spare resources or need on-demand access, JellyNet connects both sides seamlessly.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "80px" }}>
          <CardGrid
            title="🧑‍💻 For Suppliers"
            subtitle="Monetize what you already have."
            items={suppliers}
          />
          <CardGrid
            title="🤖 For AI Agents & Developers"
            subtitle="Access any resource with a single HTTP request."
            items={agents}
          />
        </div>
      </div>
    </section>
  );
}
