import type { Book } from "@/lib/types";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const DIMS: Record<Size, { w: number; fontTitle: number; fontAuthor: number; pad: number; radius: number }> = {
  xs: { w: 36, fontTitle: 8, fontAuthor: 6, pad: 4, radius: 4 },
  sm: { w: 56, fontTitle: 10, fontAuthor: 7, pad: 5, radius: 5 },
  md: { w: 88, fontTitle: 13, fontAuthor: 9, pad: 8, radius: 7 },
  lg: { w: 160, fontTitle: 20, fontAuthor: 12, pad: 14, radius: 10 },
  xl: { w: 200, fontTitle: 24, fontAuthor: 14, pad: 16, radius: 12 },
};

export function BookCover({
  book,
  size = "md",
}: {
  book: Pick<Book, "title" | "author" | "cover_bg" | "cover_text">;
  size?: Size;
}) {
  const d = DIMS[size];
  return (
    <div
      style={{
        width: d.w,
        aspectRatio: "2 / 3",
        background: book.cover_bg,
        color: book.cover_text,
        borderRadius: d.radius,
        padding: d.pad,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        boxShadow: "0 6px 18px rgba(45, 42, 38, 0.18)",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}
      role="img"
      aria-label={`${book.title} by ${book.author}`}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.35) 100%)",
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: "relative",
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: d.fontTitle,
          lineHeight: 1.15,
          letterSpacing: "0.01em",
        }}
      >
        {book.title}
      </div>
      <div
        style={{
          position: "relative",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: d.fontAuthor,
          opacity: 0.88,
          marginTop: 3,
          letterSpacing: "0.02em",
        }}
      >
        {book.author}
      </div>
    </div>
  );
}
