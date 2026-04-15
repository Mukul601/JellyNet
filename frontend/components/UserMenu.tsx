"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!session?.user) return null;

  const name = session.user.name ?? "User";
  const image = session.user.image;
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid var(--border)",
          cursor: "pointer",
          padding: 0,
          backgroundColor: "var(--accent-dim)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: "700",
          color: "var(--accent-light)",
        }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          initials
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 49 }}
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              width: "200px",
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "8px",
              zIndex: 50,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              animation: "fade-in 0.15s ease-out",
            }}
          >
            <div style={{ padding: "10px 12px 12px", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{name}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{session.user.email}</div>
              {session.walletAddress && (
                <div
                  style={{
                    fontSize: "10px",
                    fontFamily: "monospace",
                    color: "var(--accent-light)",
                    marginTop: "6px",
                    padding: "3px 6px",
                    backgroundColor: "var(--accent-dim)",
                    borderRadius: "4px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {session.walletAddress.slice(0, 14)}…{session.walletAddress.slice(-6)}
                </div>
              )}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                backgroundColor: "transparent",
                color: "var(--error)",
                fontSize: "13px",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                marginTop: "4px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--error-dim)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
