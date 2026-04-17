"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import {
  approveSubmissionAction,
  rejectSubmissionAction,
} from "@/app/actions/admin";
import { BookCover } from "@/components/book-cover";
import { toast } from "@/components/toaster";
import { primaryBtn, ghostBtn } from "@/lib/admin-styles";
import type { Book } from "@/lib/types";

type Submission = Book & { invite_label: string; excerpt_count: number };

export function SubmissionReview({
  submissions,
}: {
  submissions: Submission[];
}) {
  const [isPending, startTransition] = useTransition();

  const approve = (bookId: string, title: string) => {
    startTransition(async () => {
      const res = await approveSubmissionAction({ bookId });
      if (!res.ok) {
        toast(res.error ?? "Could not approve.", "error");
        return;
      }
      toast(`"${title}" published!`, "success");
    });
  };

  const reject = (bookId: string, title: string) => {
    if (!confirm(`Reject "${title}"? The author will see "Changes requested".`))
      return;
    startTransition(async () => {
      const res = await rejectSubmissionAction({ bookId });
      if (!res.ok) {
        toast(res.error ?? "Could not reject.", "error");
        return;
      }
      toast(`"${title}" rejected.`, "success");
    });
  };

  if (submissions.length === 0) {
    return (
      <div style={empty}>No pending submissions. All caught up!</div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {submissions.map((s) => (
        <div
          key={s.id}
          style={{
            background: "var(--ib-bg-card)",
            border: "1px solid rgba(138,126,116,0.12)",
            borderRadius: 14,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
            }}
          >
            <BookCover book={s} size="md" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--ib-text-primary)",
                }}
              >
                {s.title}
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: "var(--ib-text-secondary)",
                  marginTop: 2,
                }}
              >
                by {s.author}
              </div>
              {s.synopsis && (
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: "var(--ib-text-secondary)",
                    marginTop: 8,
                    lineHeight: 1.5,
                    maxHeight: 60,
                    overflow: "hidden",
                  }}
                >
                  {s.synopsis}
                </div>
              )}
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: "var(--ib-text-secondary)",
                  marginTop: 8,
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <span>
                  {s.excerpt_count} excerpt{s.excerpt_count !== 1 ? "s" : ""}
                </span>
                <span>
                  {s.tags.length} tag{s.tags.length !== 1 ? "s" : ""}
                </span>
                {s.invite_label && (
                  <span>From: {s.invite_label}</span>
                )}
                <span>
                  Submitted{" "}
                  {new Date(s.created_at).toLocaleDateString()}
                </span>
              </div>
              {s.tags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap",
                    marginTop: 8,
                  }}
                >
                  {s.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: "var(--ib-tag-bg)",
                        color: "var(--ib-tag-text)",
                        padding: "3px 8px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 14,
            }}
          >
            <button
              type="button"
              onClick={() => reject(s.id, s.title)}
              disabled={isPending}
              style={ghostBtn}
            >
              <X size={14} style={{ marginRight: 4 }} />
              Reject
            </button>
            <button
              type="button"
              onClick={() => approve(s.id, s.title)}
              disabled={isPending}
              style={primaryBtn}
            >
              <Check size={14} style={{ marginRight: 4 }} />
              Approve
            </button>
          </div>
        </div>
      ))}
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
