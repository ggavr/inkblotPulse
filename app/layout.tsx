import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { TabBar } from "@/components/tab-bar";
import { Toaster } from "@/components/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { signOutAction } from "@/app/actions/auth";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Inkblot Pulse",
    template: "%s · Inkblot Pulse",
  },
  description:
    "Inkblot Pulse — a feed of book excerpts you can read, save, and follow. Discover your next romance read in a single scroll.",
  applicationName: "Inkblot Pulse",
  keywords: ["books", "excerpts", "romance", "reading", "book recommendations"],
  openGraph: {
    type: "website",
    title: "Inkblot Pulse",
    description:
      "A feed of book excerpts you can read, save, and follow. Discover your next romance read.",
    siteName: "Inkblot Pulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inkblot Pulse",
    description:
      "A feed of book excerpts you can read, save, and follow.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FDF6F0",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  const isAdmin = Boolean(profile?.is_admin);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a href="#main" className="ib-visually-hidden">
          Skip to content
        </a>
        <ErrorBoundary>
          <TabBar isAdmin={isAdmin} isAuthed={Boolean(user)} />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Toaster />
          <AuthBadge email={user?.email ?? null} />
        </ErrorBoundary>
      </body>
    </html>
  );
}

function AuthBadge({ email }: { email: string | null }) {
  return (
    <div
      className="ib-auth-badge"
      style={{
        position: "fixed",
        top: 12,
        right: 12,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--ib-bg-card)",
        border: "1px solid rgba(138,126,116,0.2)",
        borderRadius: 999,
        padding: "8px 14px",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        color: "var(--ib-text-secondary)",
        boxShadow: "0 4px 12px rgba(45,42,38,0.06)",
      }}
    >
      {email ? (
        <>
          <span
            className="ib-auth-email"
            style={{
              maxWidth: 160,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            aria-label="Signed in as"
          >
            {email}
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ib-accent)",
                padding: "8px 4px",
              }}
            >
              Sign out
            </button>
          </form>
        </>
      ) : (
        <Link
          href="/auth/sign-in"
          style={{
            display: "inline-block",
            fontWeight: 600,
            color: "var(--ib-accent)",
            padding: "8px 14px",
          }}
        >
          Sign in
        </Link>
      )}
    </div>
  );
}
