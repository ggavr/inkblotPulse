"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ALL_TROPES } from "@/lib/constants";

export function TagFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(false);
  const activeTags = (params.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
    };
    el.addEventListener("scroll", check, { passive: true });
    check();
    return () => el.removeEventListener("scroll", check);
  }, []);

  const setTags = useCallback(
    (next: string[]) => {
      const current = new URLSearchParams(params.toString());
      if (next.length === 0) current.delete("tags");
      else current.set("tags", next.join(","));
      const qs = current.toString();
      router.replace(qs ? `/?${qs}` : "/");
    },
    [params, router]
  );

  const toggleTag = (tag: string) => {
    if (activeTags.includes(tag)) {
      setTags(activeTags.filter((t) => t !== tag));
    } else {
      setTags([...activeTags, tag]);
    }
  };

  return (
    <div className={`ib-tag-scroll${atEnd ? " ib-tag-scroll--end" : ""}`}>
      <div
        ref={scrollRef}
        className="ib-no-scrollbar"
        role="group"
        aria-label="Filter by trope"
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          padding: "10px 20px 14px",
          scrollbarWidth: "none",
        }}
      >
        <button
          type="button"
          onClick={() => setTags([])}
          aria-pressed={activeTags.length === 0}
          style={{
            flexShrink: 0,
            background: activeTags.length === 0 ? "var(--ib-text-primary)" : "transparent",
            color: activeTags.length === 0 ? "#FFF" : "var(--ib-text-primary)",
            border: "1px solid var(--ib-text-primary)",
            padding: "10px 16px",
            borderRadius: 999,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.02em",
          }}
        >
          All
        </button>
        {ALL_TROPES.map((tag) => {
          const active = activeTags.includes(tag);
          return (
            <button
              type="button"
              key={tag}
              onClick={() => toggleTag(tag)}
              className="ib-tag-press"
              aria-pressed={active}
              style={{
                flexShrink: 0,
                background: active ? "var(--ib-accent)" : "var(--ib-tag-bg)",
                color: active ? "#FFF" : "var(--ib-tag-text)",
                border: "none",
                padding: "10px 16px",
                borderRadius: 999,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 200ms, color 200ms",
                letterSpacing: "0.02em",
              }}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
