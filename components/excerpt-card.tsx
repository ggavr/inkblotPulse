"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Bookmark, ChevronDown, ChevronUp, Heart, ShoppingBag } from "lucide-react";
import {
  registerViewAction,
  registerWantAction,
  toggleBookmarkAction,
  toggleLikeAction,
} from "@/app/actions/engagement";
import { BookCover } from "@/components/book-cover";
import { DISCORD_URL } from "@/lib/constants";
import { sanitizeHttpsUrl } from "@/lib/url";
import { toast } from "@/components/toaster";
import type { Book, ExcerptWithStats } from "@/lib/types";

const TEXT_TRUNCATE_LIMIT = 520;

type Props = {
  excerpt: ExcerptWithStats;
  book: Pick<Book, "id" | "title" | "author" | "tags" | "cover_bg" | "cover_text" | "buy_link">;
  initialLiked: boolean;
  initialBookmarked: boolean;
  isAuthed: boolean;
};

export function ExcerptCard({ excerpt, book, initialLiked, initialBookmarked, isAuthed }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const seenRef = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(initialLiked);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [likeCount, setLikeCount] = useState(excerpt.stats.likes);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isAuthed) return;
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !seenRef.current) {
            seenRef.current = true;
            registerViewAction({ excerptId: excerpt.id }).catch(() => {});
          }
        });
      },
      { threshold: [0.5] }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [excerpt.id, isAuthed]);

  const isLong = excerpt.text.length > TEXT_TRUNCATE_LIMIT;
  const showFull = expanded || !isLong;
  const visibleText = showFull ? excerpt.text : excerpt.text.slice(0, TEXT_TRUNCATE_LIMIT) + "…";

  const handleLike = () => {
    if (!isAuthed) {
      toast("Sign in to like excerpts.", "info");
      return;
    }
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));
    startTransition(async () => {
      const res = await toggleLikeAction({ excerptId: excerpt.id });
      if (!res.ok) {
        setLiked(!nextLiked);
        setLikeCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)));
        toast("Could not save your like.", "error");
      }
    });
  };

  const handleBookmark = () => {
    if (!isAuthed) {
      toast("Sign in to save excerpts.", "info");
      return;
    }
    const next = !bookmarked;
    setBookmarked(next);
    startTransition(async () => {
      const res = await toggleBookmarkAction({ excerptId: excerpt.id });
      if (!res.ok) {
        setBookmarked(!next);
        toast("Could not update bookmark.", "error");
      }
    });
  };

  const handleWant = () => {
    const safeUrl = sanitizeHttpsUrl(book.buy_link);
    if (!safeUrl) {
      toast("This book has no purchase link yet.", "error");
      return;
    }
    startTransition(async () => {
      const res = await registerWantAction({ excerptId: excerpt.id });
      if (!res.ok) toast("Could not register interest.", "error");
    });
    window.open(safeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <article
      ref={ref}
      className="ib-card-fade-in"
      style={{
        background: "var(--ib-bg-card)",
        borderRadius: 20,
        padding: 22,
        marginBottom: 22,
        boxShadow: "0 10px 30px rgba(45,42,38,0.08)",
        border: "1px solid rgba(138,126,116,0.1)",
      }}
    >
      <Link
        href={`/book/${book.id}`}
        style={{
          display: "flex",
          gap: 14,
          alignItems: "center",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <BookCover book={book} size="sm" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 19,
              fontWeight: 700,
              color: "var(--ib-text-primary)",
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {book.title}
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "var(--ib-text-secondary)",
              marginTop: 2,
              letterSpacing: "0.02em",
            }}
          >
            {book.author}
          </div>
        </div>
      </Link>

      <div
        className="ib-no-scrollbar"
        style={{
          display: "flex",
          gap: 6,
          marginTop: 14,
          marginBottom: 16,
          overflowX: "auto",
          paddingBottom: 4,
          scrollbarWidth: "none",
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
              whiteSpace: "nowrap",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      <div style={{ position: "relative" }}>
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontSize: 17,
            lineHeight: 1.72,
            color: "var(--ib-text-primary)",
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {visibleText}
        </p>
        {isLong && !expanded && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -2,
              height: 60,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, var(--ib-bg-card) 95%)",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          style={{
            marginTop: 10,
            background: "transparent",
            border: "none",
            color: "var(--ib-accent)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: 0,
          }}
        >
          {expanded ? (
            <>
              Collapse <ChevronUp size={14} />
            </>
          ) : (
            <>
              Read more <ChevronDown size={14} />
            </>
          )}
        </button>
      )}

      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid rgba(138,126,116,0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <button
            type="button"
            onClick={handleLike}
            disabled={isPending}
            className={`ib-card-action${liked ? " ib-like-pop" : ""}`}
            aria-pressed={liked}
            aria-label={liked ? "Unlike" : "Like"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: "none",
              cursor: isPending ? "default" : "pointer",
              opacity: isPending ? 0.5 : 1,
              padding: "8px 10px",
              borderRadius: 10,
              color: liked ? "var(--ib-accent)" : "var(--ib-text-secondary)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              transition: "color 200ms, background 200ms, opacity 200ms",
            }}
          >
            <Heart size={20} fill={liked ? "var(--ib-accent)" : "none"} strokeWidth={2} />
            <span aria-hidden="true">{likeCount}</span>
          </button>

          <button
            type="button"
            onClick={handleBookmark}
            disabled={isPending}
            className="ib-card-action"
            aria-pressed={bookmarked}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: "none",
              cursor: isPending ? "default" : "pointer",
              opacity: isPending ? 0.5 : 1,
              padding: "8px 10px",
              borderRadius: 10,
              color: bookmarked ? "var(--ib-bookmark)" : "var(--ib-text-secondary)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              transition: "color 200ms, background 200ms, opacity 200ms",
            }}
          >
            <Bookmark size={20} fill={bookmarked ? "var(--ib-bookmark)" : "none"} strokeWidth={2} />
            <span className="ib-action-label">{bookmarked ? "Saved" : "Save"}</span>
          </button>

          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ib-card-action"
            aria-label="Discuss on Discord (opens in new tab)"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              color: "var(--ib-text-secondary)",
              border: "1px solid rgba(138,126,116,0.3)",
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: 999,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              transition: "border-color 200ms, color 200ms, background 200ms",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.031.053a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 13.99 13.99 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            <span className="ib-action-label">Discuss</span>
          </a>

          <div style={{ flex: 1 }} />

          <button
            type="button"
            onClick={handleWant}
            disabled={isPending}
            className="ib-want-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--ib-accent)",
              color: "#FFFFFF",
              border: "none",
              cursor: isPending ? "wait" : "pointer",
              padding: "10px 16px",
              borderRadius: 999,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.02em",
              boxShadow: "0 4px 12px rgba(196,104,109,0.3)",
              transition: "transform 200ms, box-shadow 200ms",
            }}
          >
            <ShoppingBag size={15} />
            <span className="ib-action-label">Want it</span>
          </button>
        </div>
      </div>
    </article>
  );
}
