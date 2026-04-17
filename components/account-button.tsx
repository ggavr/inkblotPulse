import Link from "next/link";
import { User } from "lucide-react";

export function AccountButton({ isAuthed }: { isAuthed: boolean }) {
  if (!isAuthed) {
    return (
      <Link
        href="/auth/sign-in"
        style={{
          display: "inline-flex",
          alignItems: "center",
          height: 40,
          padding: "0 16px",
          background: "var(--ib-accent)",
          color: "#FFFFFF",
          borderRadius: 999,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Sign in
      </Link>
    );
  }

  return (
    <Link
      href="/account"
      aria-label="Account"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "var(--ib-bg-card)",
        color: "var(--ib-text-primary)",
        border: "1px solid rgba(138,126,116,0.2)",
        textDecoration: "none",
        flexShrink: 0,
      }}
    >
      <User size={18} strokeWidth={2} aria-hidden="true" />
    </Link>
  );
}
