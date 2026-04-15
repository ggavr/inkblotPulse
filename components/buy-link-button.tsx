"use client";

import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
};

export function BuyLinkButton({ href, children }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="ib-want-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "var(--ib-accent)",
        color: "#FFFFFF",
        border: "none",
        padding: "12px 20px",
        borderRadius: 999,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: "0.02em",
        textDecoration: "none",
        boxShadow: "0 4px 12px rgba(196,104,109,0.3)",
        transition: "transform 200ms, box-shadow 200ms",
      }}
    >
      {children}
    </a>
  );
}
