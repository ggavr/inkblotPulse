import Link from "next/link";
import { notFound } from "next/navigation";
import { getInviteByToken, getExcerptsForTokenBook } from "@/lib/data";
import { createServiceClient } from "@/lib/supabase/service";
import { AuthorBookForm } from "@/components/submit/author-book-form";
import { AuthorExcerptManager } from "@/components/submit/author-excerpt-manager";
import { StatusBadge } from "@/components/submit/status-badge";
import type { Book } from "@/lib/types";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ token: string; bookId: string }>;
}) {
  const { token, bookId } = await params;

  const invite = await getInviteByToken(token);
  if (!invite || !invite.is_valid) return null;

  // Fetch book and verify ownership
  const sb = createServiceClient();
  const { data: book } = await sb
    .from("books")
    .select("*")
    .eq("id", bookId)
    .eq("invite_token_id", invite.id)
    .maybeSingle();

  if (!book) notFound();

  const excerpts = await getExcerptsForTokenBook(invite.id, bookId);

  return (
    <div>
      <Link
        href={`/submit/${token}`}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: "var(--ib-text-secondary)",
          textDecoration: "none",
          marginBottom: 14,
          display: "inline-block",
        }}
      >
        &larr; Back to dashboard
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
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
          {(book as Book).title}
        </h2>
        <StatusBadge status={(book as Book).status} />
      </div>

      <AuthorBookForm token={token} book={book as Book} />

      <div style={{ marginTop: 30 }}>
        <AuthorExcerptManager
          token={token}
          bookId={bookId}
          excerpts={excerpts}
        />
      </div>
    </div>
  );
}
