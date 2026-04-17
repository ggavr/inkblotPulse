import Link from "next/link";
import { Plus } from "lucide-react";
import { getInviteByToken, getBooksForToken } from "@/lib/data";
import { BookCover } from "@/components/book-cover";
import { StatusBadge } from "@/components/submit/status-badge";
import { primaryBtn } from "@/lib/admin-styles";

export default async function SubmitDashboard({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getInviteByToken(token);
  if (!invite || !invite.is_valid) return null; // layout handles invalid

  const books = await getBooksForToken(invite.id);
  const canAdd =
    invite.max_books === null || books.length < invite.max_books;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--ib-text-primary)",
            margin: 0,
          }}
        >
          Your books
        </h2>
        {canAdd ? (
          <Link
            href={`/submit/${token}/book/new`}
            style={{
              ...primaryBtn,
              textDecoration: "none",
            }}
          >
            <Plus size={16} />
            Add a book
          </Link>
        ) : (
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: "var(--ib-text-secondary)",
            }}
          >
            Book limit reached ({invite.max_books})
          </span>
        )}
      </div>

      {books.length === 0 ? (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "var(--ib-text-secondary)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            background: "var(--ib-bg-card)",
            borderRadius: 14,
            border: "1px solid rgba(138,126,116,0.12)",
          }}
        >
          <p style={{ marginBottom: 8 }}>
            Welcome! Start by adding your first book.
          </p>
          <p style={{ fontSize: 12, opacity: 0.7 }}>
            You can add excerpts after creating a book.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {books.map((b) => (
            <Link
              key={b.id}
              href={`/submit/${token}/book/${b.id}`}
              style={{
                display: "flex",
                gap: 14,
                padding: 14,
                background: "var(--ib-bg-card)",
                border: "1px solid rgba(138,126,116,0.12)",
                borderRadius: 14,
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
                transition: "border-color 200ms",
              }}
            >
              <BookCover book={b} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--ib-text-primary)",
                  }}
                >
                  {b.title}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: "var(--ib-text-secondary)",
                    marginTop: 2,
                  }}
                >
                  {b.author}
                </div>
                <div style={{ marginTop: 6 }}>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
