import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ExcerptCard } from "@/components/excerpt-card";
import {
  getPublishedExcerptById,
  getUserBookmarks,
  getUserLikes,
} from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

type Params = { id: string };

function normalize(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function firstLine(s: string, limit: number) {
  const n = normalize(s);
  if (n.length <= limit) return n;
  return n.slice(0, limit).replace(/\s+\S*$/, "") + "…";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getPublishedExcerptById(id);
  if (!result) return { title: "Excerpt not found", robots: { index: false, follow: false } };
  const { excerpt, book } = result;

  const title = `${firstLine(excerpt.text, 60)} · ${book.title}`;
  const description = firstLine(excerpt.text, 200);
  const canonical = `/excerpt/${id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: "Inkblot Pulse",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ExcerptPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const [user, result] = await Promise.all([
    getCurrentUser(),
    getPublishedExcerptById(id),
  ]);

  if (!result) notFound();
  const { excerpt, book } = result;

  const [likes, bookmarks] = await Promise.all([
    getUserLikes(),
    getUserBookmarks(),
  ]);

  const isAuthed = Boolean(user);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 40px" }}>
      <header
        style={{
          padding: "22px 0 14px",
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(138,126,116,0.08)",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 900,
            color: "var(--ib-text-primary)",
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}
        >
          Inkblot Pulse
        </Link>
        <Link
          href="/"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            color: "#FFFFFF",
            background: "var(--ib-accent)",
            borderRadius: 999,
            padding: "9px 16px",
            textDecoration: "none",
            letterSpacing: "0.02em",
            boxShadow: "0 4px 12px rgba(196,104,109,0.3)",
          }}
        >
          Open the feed
        </Link>
      </header>

      <ExcerptCard
        excerpt={excerpt}
        book={book}
        initialLiked={likes.has(excerpt.id)}
        initialBookmarked={bookmarks.has(excerpt.id)}
        isAuthed={isAuthed}
      />

      {!isAuthed && (
        <section
          style={{
            marginTop: 28,
            padding: "28px 24px",
            borderRadius: 20,
            background: "var(--ib-bg-card)",
            border: "1px solid rgba(138,126,116,0.1)",
            boxShadow: "0 10px 30px rgba(45,42,38,0.06)",
            textAlign: "center",
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
            Discover more excerpts like this
          </h2>
          <p
            style={{
              fontFamily: "'Lora', serif",
              fontSize: 15,
              color: "var(--ib-text-secondary)",
              margin: "10px 0 18px",
              lineHeight: 1.6,
            }}
          >
            A feed of book excerpts you can read, save, and follow.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: "#FFFFFF",
              background: "var(--ib-accent)",
              borderRadius: 999,
              padding: "12px 22px",
              textDecoration: "none",
              letterSpacing: "0.02em",
              boxShadow: "0 4px 12px rgba(196,104,109,0.3)",
            }}
          >
            Open the feed
          </Link>
        </section>
      )}
    </div>
  );
}
