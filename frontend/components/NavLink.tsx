"use client";

import Link from "next/link";

export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        fontSize: "14px",
        color: "var(--text-secondary)",
        textDecoration: "none",
        padding: "6px 12px",
        borderRadius: "8px",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--text-primary)";
        e.currentTarget.style.backgroundColor = "var(--card)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-secondary)";
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {children}
    </Link>
  );
}
