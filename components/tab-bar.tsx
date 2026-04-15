"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, LayoutGrid, Settings, type LucideIcon } from "lucide-react";

type Tab = { id: string; label: string; href: string; icon: LucideIcon };

const BASE_TABS: Tab[] = [
  { id: "feed", label: "Feed", href: "/", icon: LayoutGrid },
  { id: "bookmarks", label: "Saved", href: "/bookmarks", icon: Bookmark },
];

const ADMIN_TAB: Tab = { id: "admin", label: "Admin", href: "/admin", icon: Settings };

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/book/");
  return pathname === href || pathname.startsWith(href + "/");
}

export function TabBar({ isAdmin, isAuthed }: { isAdmin: boolean; isAuthed: boolean }) {
  const pathname = usePathname() ?? "/";
  const tabs: Tab[] = [...BASE_TABS];
  if (isAdmin) tabs.push(ADMIN_TAB);

  if (pathname.startsWith("/auth")) return null;

  return (
    <>
      <nav
        aria-label="Primary"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: "var(--ib-bg-card)",
          borderRight: "1px solid rgba(138,126,116,0.15)",
          display: "none",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 24,
          zIndex: 50,
        }}
        className="ib-tabbar-desktop"
      >
        <Link
          href="/"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--ib-accent)",
            marginBottom: 32,
          }}
          aria-label="Inkblot Pulse home"
        >
          I
        </Link>
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            active={isActive(pathname, tab.href)}
            variant="desktop"
          />
        ))}
      </nav>

      <nav
        aria-label="Primary"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          background: "var(--ib-bg-card)",
          borderTop: "1px solid rgba(138,126,116,0.15)",
          display: "flex",
          zIndex: 50,
          boxShadow: "0 -4px 16px rgba(45,42,38,0.06)",
        }}
        className="ib-tabbar-mobile"
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            active={isActive(pathname, tab.href)}
            variant="mobile"
          />
        ))}
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .ib-tabbar-desktop { display: flex !important; }
          .ib-tabbar-mobile { display: none !important; }
          main { padding-left: 80px; }
        }
        @media (max-width: 767px) {
          main { padding-bottom: 64px; }
        }
      `}</style>

      {!isAuthed ? null : null}
    </>
  );
}

function TabButton({
  tab,
  active,
  variant,
}: {
  tab: Tab;
  active: boolean;
  variant: "desktop" | "mobile";
}) {
  const Icon = tab.icon;

  if (variant === "desktop") {
    return (
      <Link
        href={tab.href}
        aria-current={active ? "page" : undefined}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "14px 0",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          color: active ? "var(--ib-accent)" : "var(--ib-text-secondary)",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10,
          fontWeight: 600,
          position: "relative",
          textDecoration: "none",
        }}
      >
        {active && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 3,
              height: 28,
              borderRadius: "0 4px 4px 0",
              background: "var(--ib-accent)",
            }}
          />
        )}
        <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
        <span>{tab.label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={tab.href}
      aria-current={active ? "page" : undefined}
      style={{
        flex: 1,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        color: active ? "var(--ib-accent)" : "var(--ib-text-secondary)",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 10,
        fontWeight: 600,
        textDecoration: "none",
      }}
    >
      <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
      <span>{tab.label}</span>
    </Link>
  );
}
