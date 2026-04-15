import { getAllExcerpts, getBooks } from "@/lib/data";

export default async function AdminOverviewPage() {
  const [books, excerpts] = await Promise.all([getBooks(), getAllExcerpts()]);

  const totalViews = excerpts.reduce((sum, e) => sum + e.stats.views, 0);
  const totalLikes = excerpts.reduce((sum, e) => sum + e.stats.likes, 0);
  const totalWants = excerpts.reduce((sum, e) => sum + e.stats.want_clicks, 0);

  const cards = [
    { label: "Books", value: books.length },
    { label: "Excerpts", value: excerpts.length },
    { label: "Total views", value: totalViews },
    { label: "Total likes", value: totalLikes },
    { label: "Want clicks", value: totalWants },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 14,
      }}
    >
      {cards.map((c) => (
        <div
          key={c.label}
          style={{
            background: "var(--ib-bg-card)",
            border: "1px solid rgba(138,126,116,0.12)",
            borderRadius: 14,
            padding: 18,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div style={{ color: "var(--ib-text-secondary)", fontSize: 12, fontWeight: 600 }}>
            {c.label}
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: "'Playfair Display', serif",
              fontSize: 30,
              fontWeight: 900,
              color: "var(--ib-text-primary)",
            }}
          >
            {c.value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
