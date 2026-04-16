"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  deleteExcerptAction,
  moveExcerptAction,
  saveExcerptAction,
} from "@/app/actions/admin";
import { toast } from "@/components/toaster";
import { primaryBtn, ghostBtn, iconBtn, modalOverlay, modalPanel } from "@/lib/admin-styles";
import type { Book, ExcerptWithStats } from "@/lib/types";

type Draft = {
  id?: string;
  book_id: string;
  text: string;
};

type Props = {
  books: Book[];
  excerpts: ExcerptWithStats[];
};

export function ExcerptManager({ books, excerpts }: Props) {
  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id ?? "");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!draft) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setDraft(null); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [draft]);

  const grouped = useMemo(() => {
    const byBook = new Map<string, ExcerptWithStats[]>();
    for (const e of excerpts) {
      const list = byBook.get(e.book_id) ?? [];
      list.push(e);
      byBook.set(e.book_id, list);
    }
    for (const list of byBook.values()) list.sort((a, b) => a.order - b.order);
    return byBook;
  }, [excerpts]);

  const selectedBook = books.find((b) => b.id === selectedBookId);
  const bookExcerpts = selectedBookId ? grouped.get(selectedBookId) ?? [] : [];

  const beginCreate = () => {
    if (!selectedBookId) {
      toast("Pick a book first.", "error");
      return;
    }
    setDraft({ book_id: selectedBookId, text: "" });
  };
  const beginEdit = (e: ExcerptWithStats) =>
    setDraft({ id: e.id, book_id: e.book_id, text: e.text });

  const save = () => {
    if (!draft) return;
    startTransition(async () => {
      const res = await saveExcerptAction(draft);
      if (!res.ok) {
        const field = res.fieldErrors ? Object.values(res.fieldErrors).flat()[0] : null;
        toast(field ?? res.error ?? "Could not save excerpt.", "error");
        return;
      }
      toast(draft.id ? "Excerpt updated." : "Excerpt added.", "success");
      setDraft(null);
    });
  };

  const remove = (e: ExcerptWithStats) => {
    if (!confirm("Delete this excerpt?")) return;
    startTransition(async () => {
      const res = await deleteExcerptAction({ excerptId: e.id });
      if (!res.ok) {
        toast(res.error ?? "Could not delete excerpt.", "error");
        return;
      }
      toast("Excerpt deleted.", "success");
    });
  };

  const move = (e: ExcerptWithStats, direction: 1 | -1) => {
    startTransition(async () => {
      const res = await moveExcerptAction({ excerptId: e.id, direction });
      if (!res.ok) toast(res.error ?? "Could not move excerpt.", "error");
    });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
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
          Excerpts
        </h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            aria-label="Filter by book"
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid rgba(138,126,116,0.3)",
              background: "var(--ib-bg-card)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "var(--ib-text-primary)",
            }}
          >
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
          <button type="button" onClick={beginCreate} style={primaryBtn}>
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      {!selectedBook ? (
        <div style={empty}>No books yet. Create a book first.</div>
      ) : bookExcerpts.length === 0 ? (
        <div style={empty}>No excerpts for {selectedBook.title} yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {bookExcerpts.map((e, idx) => (
            <div
              key={e.id}
              style={{
                background: "var(--ib-bg-card)",
                border: "1px solid rgba(138,126,116,0.12)",
                borderRadius: 14,
                padding: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--ib-text-secondary)",
                  }}
                >
                  #{e.order} · {e.stats.views} views · {e.stats.likes} likes ·{" "}
                  {e.stats.want_clicks} wants
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => move(e, -1)}
                    disabled={isPending || idx === 0}
                    style={iconBtn}
                    aria-label="Move up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(e, 1)}
                    disabled={isPending || idx === bookExcerpts.length - 1}
                    style={iconBtn}
                    aria-label="Move down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button type="button" onClick={() => beginEdit(e)} style={iconBtn} aria-label="Edit">
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(e)}
                    disabled={isPending}
                    style={{ ...iconBtn, color: "var(--ib-accent)" }}
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--ib-text-primary)",
                  whiteSpace: "pre-wrap",
                  maxHeight: 160,
                  overflow: "hidden",
                }}
              >
                {e.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {draft && (
        <div role="dialog" aria-modal="true" style={modalOverlay} onClick={() => setDraft(null)}>
          <div style={modalPanel} onClick={(e) => e.stopPropagation()}>
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
                {draft.id ? "Edit excerpt" : "New excerpt"}
              </h3>
              <button type="button" onClick={() => setDraft(null)} style={iconBtn} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <label style={{ display: "block", marginTop: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ib-text-secondary)" }}>
                Text (50–10,000 chars)
              </span>
              <textarea
                value={draft.text}
                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                rows={12}
                style={{
                  marginTop: 6,
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(138,126,116,0.3)",
                  background: "var(--ib-bg-primary)",
                  fontFamily: "'Lora', serif",
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: "var(--ib-text-primary)",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </label>
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--ib-text-secondary)" }}>
              {draft.text.trim().length} characters
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

const empty: React.CSSProperties = {
  padding: "30px 20px",
  textAlign: "center",
  color: "var(--ib-text-secondary)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  background: "var(--ib-bg-card)",
  borderRadius: 14,
  border: "1px solid rgba(138,126,116,0.12)",
};
