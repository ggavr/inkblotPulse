import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Bookmark, Heart, LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getUserBookmarks, getUserLikes } from "@/lib/data";
import { signOutAction } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?next=/account");

  const [bookmarks, likes] = await Promise.all([getUserBookmarks(), getUserLikes()]);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 40px" }}>
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          fontWeight: 900,
          color: "var(--ib-text-primary)",
          margin: 0,
        }}
      >
        Account
      </h1>
      <p
        style={{
          marginTop: 4,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: "var(--ib-text-secondary)",
          wordBreak: "break-all",
        }}
      >
        {user.email}
      </p>

      <div style={{ display: "grid", gap: 10, marginTop: 22 }}>
        <StatRow
          href="/bookmarks"
          icon={<Bookmark size={18} color="var(--ib-bookmark)" aria-hidden="true" />}
          label="Saved"
          count={bookmarks.size}
        />
        <StatRow
          icon={<Heart size={18} color="var(--ib-accent)" aria-hidden="true" />}
          label="Liked"
          count={likes.size}
        />
      </div>

      <form action={signOutAction} style={{ marginTop: 28 }}>
        <button
          type="submit"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "transparent",
            border: "1px solid rgba(138,126,116,0.25)",
            borderRadius: 999,
            padding: "10px 18px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--ib-text-primary)",
            cursor: "pointer",
          }}
        >
          <LogOut size={16} aria-hidden="true" />
          Sign out
        </button>
      </form>
    </div>
  );
}

function StatRow({
  href,
  icon,
  label,
  count,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  const content = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--ib-bg-card)",
        border: "1px solid rgba(138,126,116,0.15)",
        borderRadius: 14,
        padding: "14px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28 }}>
        {icon}
      </div>
      <div
        style={{
          flex: 1,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          fontWeight: 600,
          color: "var(--ib-text-primary)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: "var(--ib-text-secondary)",
        }}
      >
        {count}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none" }}>
        {content}
      </Link>
    );
  }
  return content;
}
