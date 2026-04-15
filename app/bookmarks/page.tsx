import Link from "next/link";
import { Bookmark } from "lucide-react";
import type { Metadata } from "next";
import { ExcerptCard } from "@/components/excerpt-card";
import {
  getBookmarkedExcerpts,
  getBooks,
  getUserBookmarks,
  getUserLikes,
} from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import type { Book } from "@/lib/types";

export const metadata: Metadata = {
  title: "Saved",
};

export default async function BookmarksPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div style={{ maxWidth: 560, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
        <Bookmark size={40} color="var(--ib-accent)" aria-hidden="true" />
        <h1
          style={{
            marginTop: 14,
            fontFamily: "'Playfair Display', serif",
            fontSize: 26,
            fontWeight: 700,
            color: "var(--ib-text-primary)",
          }}
        >
          Sign in to save excerpts
        </h1>
        <p
          style={{
            marginTop: 8,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "var(--ib-text-secondary)",
          }}
        >
          Your bookmarks live in your account so they travel with you.
        </p>
        <Link
          href="/auth/sign-in"
          style={{
            display: "inline-block",
            marginTop: 22,
            background: "var(--ib-accent)",
            color: "#FFFFFF",
            padding: "12px 22px",
            borderRadius: 999,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Sign in
        </Link>
      </div>
    );
  }

  const [bookmarkedExcerpts, books, likes, bookmarks] = await Promise.all([
    getBookmarkedExcerpts(),
    getBooks(),
    getUserLikes(),
    getUserBookmarks(),
  ]);

  const booksById = new Map<string, Book>(books.map((b) => [b.id, b]));

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 20px 40px" }}>
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          fontWeight: 900,
          color: "var(--ib-text-primary)",
          marginBottom: 20,
        }}
      >
        Saved excerpts
      </h1>

      {bookmarkedExcerpts.length === 0 ? (
        <div
          role="status"
          style={{
            padding: "40px 24px",
            textAlign: "center",
            color: "var(--ib-text-secondary)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <Bookmark size={36} color="var(--ib-bookmark)" aria-hidden="true" />
          <div
            style={{
              marginTop: 12,
              fontFamily: "'Playfair Display', serif",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--ib-text-primary)",
            }}
          >
            Nothing saved yet
          </div>
          <div style={{ marginTop: 6, fontSize: 14 }}>
            Tap the bookmark icon on any excerpt to keep it here.
          </div>
        </div>
      ) : (
        bookmarkedExcerpts.map((excerpt) => {
          const book = booksById.get(excerpt.book_id);
          if (!book) return null;
          return (
            <ExcerptCard
              key={excerpt.id}
              excerpt={excerpt}
              book={book}
              initialLiked={likes.has(excerpt.id)}
              initialBookmarked={bookmarks.has(excerpt.id)}
              isAuthed
            />
          );
        })
      )}
    </div>
  );
}
