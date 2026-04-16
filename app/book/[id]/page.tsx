import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { BookCover } from "@/components/book-cover";
import { ExcerptCard } from "@/components/excerpt-card";
import { BuyLinkButton } from "@/components/buy-link-button";
import {
  getBookById,
  getBooks,
  getExcerptsForBook,
  getUserBookmarks,
  getUserLikes,
} from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeHttpsUrl } from "@/lib/url";

type Params = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) return { title: "Book not found" };
  return {
    title: book.title,
    description: `${book.title} by ${book.author}. ${book.synopsis}`.slice(0, 300),
    openGraph: {
      title: book.title,
      description: book.synopsis,
      type: "book",
    },
  };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const [user, book, allBooks, likes, bookmarks] = await Promise.all([
    getCurrentUser(),
    getBookById(id),
    getBooks(),
    getUserLikes(),
    getUserBookmarks(),
  ]);

  if (!book) notFound();

  const excerpts = await getExcerptsForBook(book.id);

  const similar = allBooks
    .filter(
      (b) =>
        b.id !== book.id && b.tags.some((t) => book.tags.includes(t))
    )
    .slice(0, 6);

  const safeBuyLink = sanitizeHttpsUrl(book.buy_link);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 40px" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "var(--ib-bg-primary)",
          padding: "14px 0 10px",
          zIndex: 30,
          borderBottom: "1px solid rgba(138,126,116,0.08)",
          marginBottom: 20,
        }}
      >
        <Link
          href="/"
          aria-label="Back to feed"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "var(--ib-text-secondary)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>

      <header
        className="ib-book-header"
        style={{
          display: "flex",
          gap: 22,
          alignItems: "flex-start",
          marginBottom: 22,
        }}
      >
        <BookCover book={book} size="lg" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 28,
              fontWeight: 900,
              color: "var(--ib-text-primary)",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            {book.title}
          </h1>
          <div
            style={{
              marginTop: 4,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              color: "var(--ib-text-secondary)",
              letterSpacing: "0.02em",
            }}
          >
            {book.author}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginTop: 12,
            }}
          >
            {book.tags.map((t) => (
              <span
                key={t}
                style={{
                  background: "var(--ib-tag-bg)",
                  color: "var(--ib-tag-text)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  padding: "5px 11px",
                  borderRadius: 999,
                  fontWeight: 500,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </header>

      <p
        style={{
          fontFamily: "'Lora', serif",
          fontSize: 16,
          lineHeight: 1.7,
          color: "var(--ib-text-primary)",
          marginBottom: 22,
        }}
      >
        {book.synopsis}
      </p>

      {safeBuyLink && (
        <div style={{ marginBottom: 30 }}>
          <BuyLinkButton href={safeBuyLink}>
            <ShoppingBag size={16} />
            Buy this book
          </BuyLinkButton>
        </div>
      )}

      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 22,
          fontWeight: 700,
          color: "var(--ib-text-primary)",
          marginBottom: 14,
        }}
      >
        Excerpts
      </h2>

      {excerpts.length === 0 ? (
        <div
          style={{
            padding: "20px 0",
            color: "var(--ib-text-secondary)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
          }}
        >
          No excerpts yet for this book.
        </div>
      ) : (
        excerpts.map((excerpt) => (
          <ExcerptCard
            key={excerpt.id}
            excerpt={excerpt}
            book={book}
            initialLiked={likes.has(excerpt.id)}
            initialBookmarked={bookmarks.has(excerpt.id)}
            isAuthed={Boolean(user)}
          />
        ))
      )}

      {similar.length > 0 && (
        <section style={{ marginTop: 36 }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--ib-text-primary)",
              marginBottom: 14,
            }}
          >
            You may also like
          </h2>
          <div
            className="ib-no-scrollbar"
            style={{
              display: "flex",
              gap: 14,
              overflowX: "auto",
              paddingBottom: 8,
              scrollbarWidth: "none",
            }}
          >
            {similar.map((b) => (
              <Link
                key={b.id}
                href={`/book/${b.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  flexShrink: 0,
                  width: 120,
                }}
              >
                <BookCover book={b} size="md" />
                <div
                  style={{
                    marginTop: 8,
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--ib-text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {b.title}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    color: "var(--ib-text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {b.author}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
