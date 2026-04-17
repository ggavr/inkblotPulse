"use client";

import { useEffect, useState, useTransition } from "react";
import { Copy, Plus, X, Ban } from "lucide-react";
import { createInviteAction, revokeInviteAction } from "@/app/actions/admin";
import { toast } from "@/components/toaster";
import {
  inputStyle,
  primaryBtn,
  ghostBtn,
  iconBtn,
  modalOverlay,
  modalPanel,
} from "@/lib/admin-styles";
import type { InviteToken } from "@/lib/types";

type InviteWithCount = InviteToken & { book_count: number };

function getStatus(t: InviteToken): { label: string; color: string } {
  if (t.revoked) return { label: "Revoked", color: "#C62828" };
  if (t.expires_at && new Date(t.expires_at) < new Date())
    return { label: "Expired", color: "#E65100" };
  return { label: "Active", color: "#2E7D32" };
}

export function InviteManager({ invites }: { invites: InviteWithCount[] }) {
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [maxBooks, setMaxBooks] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!showForm) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowForm(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [showForm]);

  const create = () => {
    startTransition(async () => {
      const res = await createInviteAction({
        label: label.trim(),
        max_books: maxBooks ? parseInt(maxBooks, 10) : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      if (!res.ok) {
        const field = res.fieldErrors
          ? Object.values(res.fieldErrors).flat()[0]
          : null;
        toast(field ?? res.error ?? "Could not create invite.", "error");
        return;
      }
      const url = `${window.location.origin}/submit/${res.data!.token}`;
      await navigator.clipboard.writeText(url);
      toast("Invite created! Link copied to clipboard.", "success");
      setShowForm(false);
      setLabel("");
      setMaxBooks("");
      setExpiresAt("");
    });
  };

  const revoke = (t: InviteWithCount) => {
    if (!confirm(`Revoke invite "${t.label}"? The author will no longer be able to use this link.`))
      return;
    startTransition(async () => {
      const res = await revokeInviteAction({ tokenId: t.id });
      if (!res.ok) {
        toast(res.error ?? "Could not revoke invite.", "error");
        return;
      }
      toast("Invite revoked.", "success");
    });
  };

  const copyLink = async (token: string) => {
    const url = `${window.location.origin}/submit/${token}`;
    await navigator.clipboard.writeText(url);
    toast("Link copied!", "success");
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
            fontSize: 22,
            fontWeight: 700,
            color: "var(--ib-text-primary)",
            margin: 0,
          }}
        >
          Invite links
        </h2>
        <button type="button" onClick={() => setShowForm(true)} style={primaryBtn}>
          <Plus size={16} />
          Generate invite
        </button>
      </div>

      {invites.length === 0 ? (
        <div style={empty}>
          No invites yet. Generate one to share with an author.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {invites.map((t) => {
            const s = getStatus(t);
            return (
              <div
                key={t.id}
                style={{
                  background: "var(--ib-bg-card)",
                  border: "1px solid rgba(138,126,116,0.12)",
                  borderRadius: 14,
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--ib-text-primary)",
                    }}
                  >
                    {t.label || "Untitled"}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                      color: "var(--ib-text-secondary)",
                      marginTop: 4,
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ color: s.color, fontWeight: 600 }}>
                      {s.label}
                    </span>
                    <span>
                      {t.book_count} book{t.book_count !== 1 ? "s" : ""}
                      {t.max_books !== null ? ` / ${t.max_books} max` : ""}
                    </span>
                    {t.expires_at && (
                      <span>
                        Expires{" "}
                        {new Date(t.expires_at).toLocaleDateString()}
                      </span>
                    )}
                    <span>
                      Created{" "}
                      {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyLink(t.token)}
                  style={iconBtn}
                  aria-label="Copy link"
                  title="Copy link"
                >
                  <Copy size={16} />
                </button>
                {!t.revoked && (
                  <button
                    type="button"
                    onClick={() => revoke(t)}
                    disabled={isPending}
                    style={{ ...iconBtn, color: "var(--ib-accent)" }}
                    aria-label="Revoke"
                    title="Revoke"
                  >
                    <Ban size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Generate invite"
          style={modalOverlay}
          onClick={() => setShowForm(false)}
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
                Generate invite
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={iconBtn}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginTop: 14,
              }}
            >
              <Field label="Label (who is this for?)">
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g. Mira Ashwood — DM April 2026"
                />
              </Field>
              <Field label="Max books (optional)">
                <input
                  value={maxBooks}
                  onChange={(e) => setMaxBooks(e.target.value.replace(/\D/g, ""))}
                  style={inputStyle}
                  placeholder="Leave empty for unlimited"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Expires at (optional)">
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  style={inputStyle}
                />
              </Field>
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
                onClick={() => setShowForm(false)}
                style={ghostBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={create}
                disabled={isPending || !label.trim()}
                style={primaryBtn}
              >
                {isPending ? "Creating…" : "Create & copy link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--ib-text-secondary)",
        }}
      >
        {label}
      </span>
      {children}
    </label>
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
