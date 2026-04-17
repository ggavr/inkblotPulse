import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TabBar } from "@/components/tab-bar";
import { Toaster } from "@/components/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";

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
        </ErrorBoundary>
      </body>
    </html>
  );
}
