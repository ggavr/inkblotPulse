import type { Metadata } from "next";
import { getInviteByToken } from "@/lib/data";

export const metadata: Metadata = {
  title: "Submit Your Book — Inkblot Pulse",
  robots: { index: false, follow: false },
};

export default async function SubmitLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getInviteByToken(token);

  if (!invite || !invite.is_valid) {
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
          Link expired or invalid
        </h1>
        <p
          style={{
            marginTop: 10,
            color: "var(--ib-text-secondary)",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          This submission link is no longer valid. Please contact us for a new
          one.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px 60px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 26,
            fontWeight: 900,
            color: "var(--ib-text-primary)",
            margin: 0,
          }}
        >
          Inkblot Pulse
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "var(--ib-text-secondary)",
            marginTop: 4,
          }}
        >
          Author submission portal
        </p>
      </div>
      {children}
    </div>
  );
}
