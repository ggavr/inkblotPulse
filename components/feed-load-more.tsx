"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { FEED_BATCH_SIZE } from "@/lib/constants";

type Props = {
  currentCount: number;
  hasMore: boolean;
};

export function FeedLoadMore({ currentCount, hasMore }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (!hasMore) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "24px 0 40px",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: "var(--ib-text-secondary)",
        }}
      >
        You&apos;ve reached the end.
      </div>
    );
  }

  const handleClick = () => {
    const next = new URLSearchParams(params.toString());
    next.set("limit", String(currentCount + FEED_BATCH_SIZE));
    startTransition(() => {
      router.replace(`/?${next.toString()}`, { scroll: false });
    });
  };

  return (
    <div style={{ textAlign: "center", padding: "14px 0 40px" }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="ib-want-btn"
        style={{
          background: "var(--ib-accent)",
          color: "#FFFFFF",
          border: "none",
          cursor: isPending ? "wait" : "pointer",
          padding: "12px 24px",
          borderRadius: 999,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.02em",
          boxShadow: "0 4px 12px rgba(196,104,109,0.3)",
          transition: "transform 200ms, box-shadow 200ms",
        }}
      >
        {isPending ? "Loading…" : "Load more"}
      </button>
    </div>
  );
}
