import { ImageResponse } from "next/og";
import { getPublishedExcerptById } from "@/lib/data";
import { COVER_PRESETS } from "@/lib/constants";

export const alt = "Book excerpt on Inkblot Pulse";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`;
    const css = await fetch(cssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    }).then((r) => r.text());
    const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
    if (!match) return null;
    const res = await fetch(match[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

function truncate(s: string, limit: number) {
  const n = s.replace(/\s+/g, " ").trim();
  if (n.length <= limit) return n;
  return n.slice(0, limit).replace(/\s+\S*$/, "") + "…";
}

export default async function OgImage({ params }: { params: { id: string } }) {
  const result = await getPublishedExcerptById(params.id);

  const [serif, sans] = await Promise.all([
    loadGoogleFont("Playfair Display", 700),
    loadGoogleFont("DM Sans", 600),
  ]);
  const fonts: {
    name: string;
    data: ArrayBuffer;
    weight: 400 | 600 | 700;
    style: "normal";
  }[] = [];
  if (serif) fonts.push({ name: "Playfair Display", data: serif, weight: 700, style: "normal" });
  if (sans) fonts.push({ name: "DM Sans", data: sans, weight: 600, style: "normal" });

  if (!result) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: COVER_PRESETS[0].bg,
            color: COVER_PRESETS[0].text,
            fontFamily: "DM Sans, sans-serif",
            fontSize: 56,
            fontWeight: 600,
          }}
        >
          Inkblot Pulse
        </div>
      ),
      { ...size, fonts }
    );
  }

  const { excerpt, book } = result;
  const bg = /^(linear|radial)-gradient/.test(book.cover_bg)
    ? book.cover_bg
    : COVER_PRESETS[0].bg;
  const textColor = /^#[0-9a-fA-F]{3,8}$/.test(book.cover_text)
    ? book.cover_text
    : COVER_PRESETS[0].text;

  const quote = truncate(excerpt.text, 240);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: bg,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 100%)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: textColor,
            fontFamily: "DM Sans, sans-serif",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "0.02em",
            zIndex: 1,
          }}
        >
          inkblotpulse
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            padding: "40px 48px",
            borderRadius: 28,
            background: "rgba(0,0,0,0.32)",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 1.25,
              color: textColor,
              display: "flex",
            }}
          >
            “{quote}”
          </div>
          <div
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 26,
              fontWeight: 600,
              color: textColor,
              opacity: 0.9,
              letterSpacing: "0.02em",
              display: "flex",
            }}
          >
            — {book.title} · {book.author}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
