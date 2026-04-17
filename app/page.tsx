import { Sparkles } from "lucide-react";
import { HeaderSearch } from "@/components/header-search";
import { AccountButton } from "@/components/account-button";
import { TagFilter } from "@/components/tag-filter";
import { ExcerptCard } from "@/components/excerpt-card";
import { FeedLoadMore } from "@/components/feed-load-more";
import {
  getBooks,
  getExcerpts,
  getUserBookmarks,
  getUserLikes,
} from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { FEED_BATCH_SIZE } from "@/lib/constants";
import type { Book } from "@/lib/types";

type SearchParams = {
  q?: string;
  tags?: string;
  limit?: string;
};

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const search = sp.q?.trim() ?? "";
  const tagsParam = sp.tags?.trim() ?? "";
  const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : [];
  const requestedLimit = Number.parseInt(sp.limit ?? "", 10);
  const limit =
    Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 200)
      : FEED_BATCH_SIZE;

  const [user, books, excerpts] = await Promise.all([
    getCurrentUser(),
    getBooks(),
    getExcerpts({ search, tags, limit: limit + 1 }),
  ]);

  const hasMore = excerpts.length > limit;
  const visible = hasMore ? excerpts.slice(0, limit) : excerpts;

  const [likes, bookmarks] = await Promise.all([
    user ? getUserLikes() : Promise.resolve(new Set<string>()),
    user ? getUserBookmarks() : Promise.resolve(new Set<string>()),
  ]);

  const booksById = new Map<string, Book>(books.map((b) => [b.id, b]));

  return (
    <>
      <HeaderSearch accountSlot={<AccountButton isAuthed={Boolean(user)} />} />
      <TagFilter />

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "10px 20px 20px" }}>
        {visible.length === 0 ? (
          <EmptyState />
        ) : (
          visible.map((excerpt) => {
            const book = booksById.get(excerpt.book_id);
            if (!book) return null;
            return (
              <ExcerptCard
                key={excerpt.id}
                excerpt={excerpt}
                book={book}
                initialLiked={likes.has(excerpt.id)}
                initialBookmarked={bookmarks.has(excerpt.id)}
                isAuthed={Boolean(user)}
              />
            );
          })
        )}
        {visible.length > 0 && (
          <FeedLoadMore currentCount={visible.length} hasMore={hasMore} />
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div
      role="status"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "60px 24px",
        color: "var(--ib-text-secondary)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Sparkles size={36} color="var(--ib-accent)" aria-hidden="true" />
      <div
        style={{
          marginTop: 14,
          fontFamily: "'Playfair Display', serif",
          fontSize: 22,
          fontWeight: 700,
          color: "var(--ib-text-primary)",
        }}
      >
        No excerpts match those filters.
      </div>
      <div style={{ marginTop: 6, fontSize: 14, maxWidth: 360 }}>
        Try clearing your search or picking a different trope to keep scrolling.
      </div>
    </div>
  );
}
