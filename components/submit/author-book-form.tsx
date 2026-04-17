"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitBookAction, deleteSubmittedBookAction } from "@/app/actions/submit";
import { BookCover } from "@/components/book-cover";
import { ALL_TROPES, COVER_PRESETS } from "@/lib/constants";
import { toast } from "@/components/toaster";
import { inputStyle, primaryBtn, ghostBtn } from "@/lib/admin-styles";
import type { Book } from "@/lib/types";

type Draft = {
  id?: string;
  title: string;
  author: string;
  synopsis: string;
  buy_link: string;
  cover_bg: string;
  cover_text: string;
  tags: string[];
};

function emptyDraft(): Draft {
  return {
    title: "",
    author: "",
    synopsis: "",
    buy_link: "",
    cover_bg: COVER_PRESETS[0].bg,
    cover_text: COVER_PRESETS[0].text,
    tags: [],
  };
}

function bookToDraft(b: Book): Draft {
  return {
    id: b.id,
    title: b.title,
    author: b.author,
    synopsis: b.synopsis,
    buy_link: b.buy_link ?? "",
    cover_bg: b.cover_bg,
    cover_text: b.cover_text,
    tags: [...b.tags],
  };
}

export function AuthorBookForm({
  token,
  book,
}: {
  token: string;
  book?: Book;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(book ? bookToDraft(book) : emptyDraft());
  const [isPending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      const res = await submitBookAction({
        ...draft,
        buy_link: draft.buy_link.trim(),
        token,
      });
      if (!res.ok) {
        if (res.error === "max_books_reached") {
          toast("You have reached the maximum number of books for this link.", "error");
          return;
        }
        const field = res.fieldErrors
          ? Object.values(res.fieldErrors).flat()[0]
          : null;
        toast(field ?? res.error ?? "Could not save book.", "error");
        return;
      }
      toast(draft.id ? "Book updated." : "Book submitted for review!", "success");
      if (!draft.id && res.data?.id) {
        router.push(`/submit/${token}/book/${res.data.id}`);
      }
    });
  };

  const remove = () => {
    if (!book) return;
    if (!confirm(`Delete "${book.title}"? This also removes its excerpts.`)) return;
    startTransition(async () => {
      const res = await deleteSubmittedBookAction({ token, bookId: book.id });
      if (!res.ok) {
        toast(res.error ?? "Could not delete book.", "error");
        return;
      }
      toast("Book deleted.", "success");
      router.push(`/submit/${token}`);
    });
  };

  return (
    <div
      style={{
        background: "var(--ib-bg-card)",
        border: "1px solid rgba(138,126,116,0.12)",
        borderRadius: 18,
        padding: 22,
      }}
    >
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <BookCover
          book={{
            title: draft.title || "Title",
            author: draft.author || "Author",
            cover_bg: draft.cover_bg,
            cover_text: draft.cover_text,
          }}
          size="lg"
        />
        <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Title">
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              style={inputStyle}
              placeholder="Your book title"
            />
          </Field>
          <Field label="Author">
            <input
              value={draft.author}
              onChange={(e) => setDraft({ ...draft, author: e.target.value })}
              style={inputStyle}
              placeholder="Author name"
            />
          </Field>
          <Field label="Synopsis (optional)">
            <textarea
              value={draft.synopsis}
              onChange={(e) => setDraft({ ...draft, synopsis: e.target.value })}
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="Brief synopsis of your book"
            />
          </Field>
          <Field label="Buy link (https://)">
            <input
              value={draft.buy_link}
              onChange={(e) => setDraft({ ...draft, buy_link: e.target.value })}
              placeholder="https://example.com/your-book"
              style={inputStyle}
            />
          </Field>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <Field label="Cover style">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {COVER_PRESETS.map((p, i) => {
              const active = draft.cover_bg === p.bg;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDraft({ ...draft, cover_bg: p.bg, cover_text: p.text })}
                  aria-pressed={active}
                  style={{
                    width: 42,
                    height: 52,
                    borderRadius: 6,
                    background: p.bg,
                    border: active
                      ? "2px solid var(--ib-text-primary)"
                      : "2px solid transparent",
                    cursor: "pointer",
                  }}
                />
              );
            })}
          </div>
        </Field>
      </div>

      <div style={{ marginTop: 14 }}>
        <Field label="Tags (pick at least one)">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ALL_TROPES.map((t) => {
              const active = draft.tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      tags: active
                        ? draft.tags.filter((x) => x !== t)
                        : [...draft.tags, t],
                    })
                  }
                  aria-pressed={active}
                  style={{
                    background: active ? "var(--ib-accent)" : "var(--ib-tag-bg)",
                    color: active ? "#fff" : "var(--ib-tag-text)",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 999,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      <div
        style={{
          marginTop: 22,
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          flexWrap: "wrap",
        }}
      >
        {book && book.status !== "published" && (
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            style={{ ...ghostBtn, color: "var(--ib-accent)" }}
          >
            Delete book
          </button>
        )}
        <button type="button" onClick={save} disabled={isPending} style={primaryBtn}>
          {isPending ? "Saving…" : draft.id ? "Save changes" : "Submit book"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--ib-text-secondary)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
