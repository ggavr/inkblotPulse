import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?next=/admin");

  const profile = await getCurrentProfile();
  if (!profile?.is_admin) {
    return (
      <div
        style={{
          maxWidth: 520,
          margin: "80px auto",
          padding: "0 24px",
          textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 800,
            color: "var(--ib-text-primary)",
          }}
        >
          Admins only
        </h1>
        <p
          style={{
            marginTop: 10,
            color: "var(--ib-text-secondary)",
            fontSize: 14,
          }}
        >
          Your account does not have admin access.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 20px 60px" }}>
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          fontWeight: 900,
          color: "var(--ib-text-primary)",
          marginBottom: 10,
        }}
      >
        Admin
      </h1>
      <nav
        aria-label="Admin sections"
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 26,
          borderBottom: "1px solid rgba(138,126,116,0.15)",
          paddingBottom: 14,
        }}
      >
        {[
          { href: "/admin", label: "Overview" },
          { href: "/admin/books", label: "Books" },
          { href: "/admin/excerpts", label: "Excerpts" },
          { href: "/admin/analytics", label: "Analytics" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              background: "var(--ib-tag-bg)",
              color: "var(--ib-tag-text)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
