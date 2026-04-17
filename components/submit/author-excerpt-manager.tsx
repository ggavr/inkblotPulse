"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  submitExcerptAction,
  deleteSubmittedExcerptAction,
  moveSubmittedExcerptAction,
} from "@/app/actions/submit";
import { toast } from "@/components/toaster";
import {
  primaryBtn,
  ghostBtn,
  iconBtn,
  modalOverlay,
  modalPanel,
} from "@/lib/admin-styles";
import type { ExcerptWithStats } from "@/lib/types";

type Draft = {
  id?: string;
  book_id: string;
  text: string;
};

export function AuthorExcerptManager({
  token,
  bookId,
  excerpts,
}: {
  token: string;
  bookId: string;
  excerpts: ExcerptWithStats[];
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!draft) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDraft(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [draft]);

  const beginCreate = () => setDraft({ book_id: bookId, text: "" });
  const beginEdit = (e: ExcerptWithStats) =>
    setDraft({ id: e.id, book_id: e.book_id, text: e.text });

  const save = () => {
    if (!draft) return;
    startTransition(async () => {
      const res = await submitExcerptAction({ ...draft, token });
      if (!res.ok) {
        const field = res.fieldErrors
          ? Object.values(res.fieldErrors).flat()[0]
          : null;
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
      const res = await deleteSubmittedExcerptAction({
        token,
        excerptId: e.id,
      });
      if (!res.ok) {
        toast(res.error ?? "Could not delete excerpt.", "error");
        return;
      }
      toast("Excerpt deleted.", "success");
    });
  };

  const move = (e: ExcerptWithStats, direction: 1 | -1) => {
    startTransition(async () => {
      const res = await moveSubmittedExcerptAction({
        token,
        excerptId: e.id,
        direction,
      });
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
          marginBottom: 14,
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--ib-text-primary)",
            margin: 0,
          }}
        >
          Excerpts
        </h2>
        <button type="button" onClick={beginCreate} style={primaryBtn}>
          <Plus size={16} />
          Add excerpt
        </button>
      </div>

      {excerpts.length === 0 ? (
        <div style={empty}>
          No excerpts yet. Add at least one excerpt from your book.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {excerpts.map((e, idx) => (
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
                  Excerpt #{e.order}
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
                    disabled={isPending || idx === excerpts.length - 1}
                    style={iconBtn}
                    aria-label="Move down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => beginEdit(e)}
                    style={iconBtn}
                    aria-label="Edit"
                  >
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
        <div
          role="dialog"
          aria-modal="true"
          style={modalOverlay}
          onClick={() => setDraft(null)}
        >
          <div style={modalPanel} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
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
              <button
                type="button"
                onClick={() => setDraft(null)}
                style={iconBtn}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <label style={{ display: "block", marginTop: 14 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ib-text-secondary)",
                }}
              >
                Text (50–10,000 characters)
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
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: "var(--ib-text-secondary)",
              }}
            >
              {draft.text.trim().length} characters
            </div>
            <div
              style={{
                marginTop: 18,
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setDraft(null)}
                style={ghostBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={isPending}
                style={primaryBtn}
              >
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
