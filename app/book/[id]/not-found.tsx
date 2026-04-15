import Link from "next/link";

export default function BookNotFound() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        textAlign: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          fontWeight: 700,
          color: "var(--ib-text-primary)",
          marginBottom: 10,
        }}
      >
        Book not found
      </div>
      <div
        style={{
          fontSize: 14,
          color: "var(--ib-text-secondary)",
          marginBottom: 22,
        }}
      >
        That book may have been removed or the link is wrong.
      </div>
      <Link
        href="/"
        style={{
          background: "var(--ib-accent)",
          color: "#FFFFFF",
          padding: "10px 20px",
          borderRadius: 999,
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        Back to feed
      </Link>
    </div>
  );
}
