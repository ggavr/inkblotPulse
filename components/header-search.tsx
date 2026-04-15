"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function HeaderSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [open, setOpen] = useState(initial.length > 0);
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const handle = setTimeout(() => {
      const current = new URLSearchParams(params.toString());
      if (value.trim()) current.set("q", value.trim());
      else current.delete("q");
      const qs = current.toString();
      router.replace(qs ? `/?${qs}` : `/`);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        background: "var(--ib-bg-primary)",
        zIndex: 40,
        padding: "14px 20px 10px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderBottom: "1px solid rgba(138,126,116,0.08)",
      }}
    >
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 24,
          fontWeight: 700,
          color: "var(--ib-text-primary)",
          letterSpacing: "-0.01em",
          flex: open ? 0 : 1,
          margin: 0,
        }}
      >
        Inkblot Pulse
      </h1>

      {open ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            background: "var(--ib-bg-card)",
            borderRadius: 999,
            padding: "6px 12px",
            border: "1px solid rgba(138,126,116,0.2)",
          }}
        >
          <Search size={16} color="var(--ib-text-secondary)" aria-hidden="true" />
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search title or author"
            aria-label="Search title or author"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              padding: "4px 10px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: "var(--ib-text-primary)",
              minWidth: 0,
            }}
          />
          <button
            type="button"
            onClick={() => {
              setValue("");
              setOpen(false);
            }}
            aria-label="Close search"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 2,
              color: "var(--ib-text-secondary)",
            }}
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open search"
          style={{
            background: "var(--ib-bg-card)",
            border: "1px solid rgba(138,126,116,0.18)",
            borderRadius: "50%",
            width: 38,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--ib-text-primary)",
          }}
        >
          <Search size={18} />
        </button>
      )}
    </header>
  );
}
