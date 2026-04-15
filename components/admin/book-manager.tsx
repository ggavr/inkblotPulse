"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { deleteBookAction, saveBookAction } from "@/app/actions/admin";
import { BookCover } from "@/components/book-cover";
import { ALL_TROPES, COVER_PRESETS } from "@/lib/constants";
import { toast } from "@/components/toaster";
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

export function BookManager({ books }: { books: Book[] }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isPending, startTransition] = useTransition();

  const beginCreate = () => setDraft(emptyDraft());
  const beginEdit = (b: Book) =>
    setDraft({
      id: b.id,
      title: b.title,
      author: b.author,
      synopsis: b.synopsis,
      buy_link: b.buy_link ?? "",
      cover_bg: b.cover_bg,
      cover_text: b.cover_text,
      tags: [...b.tags],
    });

  const save = () => {
    if (!draft) return;
    startTransition(async () => {
      const res = await saveBookAction({
        ...draft,
        buy_link: draft.buy_link.trim(),
      });
      if (!res.ok) {
        const field = res.fieldErrors ? Object.values(res.fieldErrors).flat()[0] : null;
        toast(field ?? res.error ?? "Could not save book.", "error");
        return;
      }
      toast(draft.id ? "Book updated." : "Book created.", "success");
      setDraft(null);
    });
  };

  const remove = (book: Book) => {
    if (!confirm(`Delete "${book.title}"? This also removes its excerpts.`)) return;
    startTransition(async () => {
      const res = await deleteBookAction({ bookId: book.id });
      if (!res.ok) {
        toast(res.error ?? "Could not delete book.", "error");
        return;
      }
      toast("Book deleted.", "success");
    });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--ib-text-primary)",
            margin: 0,
          }}
        >
          Books
        </h2>
        <button
          type="button"
          onClick={beginCreate}
          style={primaryBtn}
        >
          <Plus size={16} />
          New book
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {books.map((b) => (
          <div
            key={b.id}
            style={{
              display: "flex",
              gap: 14,
              padding: 14,
              background: "var(--ib-bg-card)",
              border: "1px solid rgba(138,126,116,0.12)",
              borderRadius: 14,
              alignItems: "center",
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
                }}
              >
                {b.author}
              </div>
            </div>
            <button type="button" onClick={() => beginEdit(b)} style={iconBtn} aria-label={`Edit ${b.title}`}>
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={() => remove(b)}
              style={{ ...iconBtn, color: "var(--ib-accent)" }}
              aria-label={`Delete ${b.title}`}
              disabled={isPending}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {draft && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={draft.id ? "Edit book" : "New book"}
          style={modalOverlay}
          onClick={() => setDraft(null)}
        >
          <div
            style={modalPanel}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 22,
                  fontWeight: 700,
                  margin: 0,
                  color: "var(--ib-text-primary)",
                }}
              >
                {draft.id ? "Edit book" : "New book"}
              </h3>
              <button type="button" onClick={() => setDraft(null)} style={iconBtn} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
              <Field label="Title">
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  style={inputStyle}
                />
              </Field>
              <Field label="Author">
                <input
                  value={draft.author}
                  onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                  style={inputStyle}
                />
              </Field>
              <Field label="Synopsis">
                <textarea
                  value={draft.synopsis}
                  onChange={(e) => setDraft({ ...draft, synopsis: e.target.value })}
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </Field>
              <Field label="Buy link (https://)">
                <input
                  value={draft.buy_link}
                  onChange={(e) => setDraft({ ...draft, buy_link: e.target.value })}
                  placeholder="https://example.com/book"
                  style={inputStyle}
                />
              </Field>
              <Field label="Cover preset">
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
                          border: active ? "2px solid var(--ib-text-primary)" : "2px solid transparent",
                          cursor: "pointer",
                        }}
                      />
                    );
                  })}
                </div>
              </Field>
              <Field label="Tags">
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
                            tags: active ? draft.tags.filter((x) => x !== t) : [...draft.tags, t],
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

            <div style={{ marginTop: 18, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setDraft(null)} style={ghostBtn}>
                Cancel
              </button>
              <button type="button" onClick={save} disabled={isPending} style={primaryBtn}>
                {isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ib-text-secondary)" }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(138,126,116,0.3)",
  background: "var(--ib-bg-primary)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  color: "var(--ib-text-primary)",
  outline: "none",
};

const primaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  background: "var(--ib-accent)",
  color: "#FFFFFF",
  border: "none",
  padding: "10px 16px",
  borderRadius: 999,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  background: "transparent",
  color: "var(--ib-text-secondary)",
  border: "1px solid rgba(138,126,116,0.3)",
  padding: "10px 16px",
  borderRadius: 999,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const iconBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: 6,
  color: "var(--ib-text-secondary)",
};

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(45,42,38,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  zIndex: 100,
};

const modalPanel: React.CSSProperties = {
  background: "var(--ib-bg-primary)",
  borderRadius: 18,
  padding: 22,
  width: "100%",
  maxWidth: 560,
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 20px 60px rgba(45,42,38,0.25)",
};
