"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { WalletSetupModal } from "@/components/WalletSetupModal";

export function UserMenu() {
  const { data: session, update: updateSession } = useSession();
  const [open, setOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  if (!session?.user) return null;

  const name = session.user.name ?? "User";
  const image = session.user.image;
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const hasWallet = session.hasWallet;

  async function handleWalletComplete(address: string, isGenerated: boolean) {
    await updateSession({ hasWallet: true, walletAddress: address, walletIsGenerated: isGenerated });
    setShowWalletModal(false);
  }

  const menuItemStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "8px",
    backgroundColor: "transparent",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  return (
    <>
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
                width: "210px",
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "8px",
                zIndex: 50,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                animation: "fade-in 0.15s ease-out",
              }}
            >
              {/* User info */}
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

              {/* Wallet action */}
              <div style={{ paddingTop: "4px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>
                <button
                  style={menuItemStyle}
                  onClick={() => { setOpen(false); setShowWalletModal(true); }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--surface)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <span style={{ fontSize: "14px" }}>◎</span>
                  {hasWallet ? "Manage Wallet" : "Add Wallet"}
                </button>
              </div>

              {/* Sign out */}
              <div style={{ paddingTop: "4px" }}>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  style={{ ...menuItemStyle, color: "var(--error)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--error-dim)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <span style={{ fontSize: "14px" }}>↗</span>
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showWalletModal && (
        <WalletSetupModal
          onComplete={handleWalletComplete}
          onDismiss={() => setShowWalletModal(false)}
        />
      )}
    </>
  );
}
