import Link from "next/link";
import { AuthorBookForm } from "@/components/submit/author-book-form";

export default async function NewBookPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div>
      <Link
        href={`/submit/${token}`}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: "var(--ib-text-secondary)",
          textDecoration: "none",
          marginBottom: 14,
          display: "inline-block",
        }}
      >
        &larr; Back to dashboard
      </Link>

      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 22,
          fontWeight: 700,
          color: "var(--ib-text-primary)",
          margin: "0 0 16px",
        }}
      >
        Add a new book
      </h2>

      <AuthorBookForm token={token} />
    </div>
  );
}
