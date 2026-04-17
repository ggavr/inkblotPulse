import type { BookStatus } from "@/lib/types";

const colors: Record<BookStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "#FFF3E0", text: "#E65100", label: "Pending review" },
  published: { bg: "#E8F5E9", text: "#2E7D32", label: "Published" },
  rejected: { bg: "#FFEBEE", text: "#C62828", label: "Changes requested" },
};

export function StatusBadge({ status }: { status: BookStatus }) {
  const c = colors[status];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
        background: c.bg,
        color: c.text,
        letterSpacing: "0.02em",
      }}
    >
      {c.label}
    </span>
  );
}
