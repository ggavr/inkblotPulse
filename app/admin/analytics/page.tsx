import { getAllExcerpts, getBooks } from "@/lib/data";
import type { Book } from "@/lib/types";

export default async function AdminAnalyticsPage() {
  const [books, excerpts] = await Promise.all([getBooks(), getAllExcerpts()]);
  const booksById = new Map<string, Book>(books.map((b) => [b.id, b]));

  const rows = excerpts
    .map((e) => {
      const book = booksById.get(e.book_id);
      return {
        id: e.id,
        title: book?.title ?? "Unknown",
        author: book?.author ?? "",
        order: e.order,
        views: e.stats.views,
        likes: e.stats.likes,
        wants: e.stats.want_clicks,
        preview: e.text.slice(0, 80),
      };
    })
    .sort((a, b) => b.views - a.views);

  return (
    <div
      style={{
        background: "var(--ib-bg-card)",
        borderRadius: 14,
        border: "1px solid rgba(138,126,116,0.12)",
        overflowX: "auto",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          minWidth: 720,
        }}
      >
        <thead>
          <tr
            style={{
              textAlign: "left",
              color: "var(--ib-text-secondary)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            <th style={th}>Book</th>
            <th style={th}>#</th>
            <th style={th}>Preview</th>
            <th style={{ ...th, textAlign: "right" }}>Views</th>
            <th style={{ ...th, textAlign: "right" }}>Likes</th>
            <th style={{ ...th, textAlign: "right" }}>Wants</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid rgba(138,126,116,0.1)" }}>
              <td style={td}>
                <div style={{ fontWeight: 700, color: "var(--ib-text-primary)" }}>{r.title}</div>
                <div style={{ color: "var(--ib-text-secondary)", fontSize: 11 }}>{r.author}</div>
              </td>
              <td style={td}>{r.order}</td>
              <td style={{ ...td, color: "var(--ib-text-secondary)", maxWidth: 320 }}>
                {r.preview}…
              </td>
              <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{r.views}</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{r.likes}</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{r.wants}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = { padding: "14px 14px", fontWeight: 700 };
const td: React.CSSProperties = { padding: "14px 14px", verticalAlign: "top" };
