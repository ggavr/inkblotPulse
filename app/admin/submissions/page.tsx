import { getPendingSubmissions } from "@/lib/data";
import { SubmissionReview } from "@/components/admin/submission-review";

export default async function SubmissionsPage() {
  const submissions = await getPendingSubmissions();

  return (
    <div>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 22,
          fontWeight: 700,
          color: "var(--ib-text-primary)",
          margin: "0 0 14px",
        }}
      >
        Pending submissions
        {submissions.length > 0 && (
          <span
            style={{
              marginLeft: 8,
              background: "var(--ib-accent)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 999,
              fontFamily: "'DM Sans', sans-serif",
              verticalAlign: "middle",
            }}
          >
            {submissions.length}
          </span>
        )}
      </h2>
      <SubmissionReview submissions={submissions} />
    </div>
  );
}
