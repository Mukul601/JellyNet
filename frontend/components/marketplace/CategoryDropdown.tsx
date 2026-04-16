"use client";

import { useState, useRef, useEffect } from "react";
import type { Category } from "@/lib/types";

interface Props {
  categories: Category[];
  value: string; // "" = All categories
  onChange: (slug: string) => void;
}

export function CategoryDropdown({ categories, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = value
    ? categories.find((c) => c.slug === value)?.label ??
      categories.flatMap((c) => c.subcategories).find((s) => s.slug === value)?.label ??
      "All categories"
    : "All categories";

  const filtered = search
    ? categories.filter(
        (c) =>
          c.label.toLowerCase().includes(search.toLowerCase()) ||
          c.subcategories.some((s) => s.label.toLowerCase().includes(search.toLowerCase()))
      )
    : categories;

  function select(slug: string) {
    onChange(slug);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={ref} style={{ position: "relative", minWidth: "180px" }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          color: "var(--text-primary)",
          fontSize: "14px",
          cursor: "pointer",
          whiteSpace: "nowrap",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <span>{selectedLabel}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}
        >
          <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 100,
            width: "260px",
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            overflow: "hidden",
            animation: "fade-in 0.12s ease-out",
          }}
        >
          {/* Search */}
          <div style={{ padding: "8px", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ position: "relative" }}>
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
              >
                <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                style={{
                  width: "100%",
                  padding: "7px 10px 7px 30px",
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Options list */}
          <div style={{ maxHeight: "320px", overflowY: "auto" }}>
            {/* All categories */}
            <button
              onClick={() => select("")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                padding: "9px 12px",
                backgroundColor: "transparent",
                border: "none",
                color: value === "" ? "var(--accent)" : "var(--text-primary)",
                fontSize: "13px",
                fontWeight: value === "" ? "600" : "400",
                cursor: "pointer",
                textAlign: "left",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--card-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {value === "" && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1.5 6l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <span style={{ marginLeft: value === "" ? 0 : "20px" }}>All categories</span>
            </button>

            {/* Categories with subcategories */}
            {filtered.map((cat) => (
              <div key={cat.slug}>
                {/* Parent category */}
                <button
                  onClick={() => select(cat.slug)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "transparent",
                    border: "none",
                    color: value === cat.slug ? "var(--accent)" : "var(--text-primary)",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--card-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  {value === cat.slug && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M1.5 6l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <span style={{ marginLeft: value === cat.slug ? 0 : "20px" }}>{cat.label}</span>
                </button>

                {/* Subcategories */}
                {cat.subcategories.map((sub) => (
                  <button
                    key={sub.slug}
                    onClick={() => select(sub.slug)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      padding: "6px 12px 6px 32px",
                      backgroundColor: "transparent",
                      border: "none",
                      color: value === sub.slug ? "var(--accent)" : "var(--text-secondary)",
                      fontSize: "12px",
                      cursor: "pointer",
                      textAlign: "left",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--card-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    {value === sub.slug && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M1.5 6l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    <span style={{ marginLeft: value === sub.slug ? 0 : "18px" }}>{sub.label}</span>
                  </button>
                ))}
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ padding: "16px 12px", color: "var(--text-muted)", fontSize: "13px", textAlign: "center" }}>
                No categories found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
