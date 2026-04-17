// Strict URL sanitizer: only https:// URLs with a real host are allowed.
// Returns the canonical URL string on success, or null if the input is unsafe.
// Used for buy_link and any user-supplied URL that will be rendered in href/window.open.

export function sanitizeHttpsUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") return null;
  if (!parsed.hostname || parsed.hostname === "localhost") return null;

  return parsed.toString();
}

export function isSafeHttpsUrl(raw: unknown): boolean {
  return sanitizeHttpsUrl(raw) !== null;
}

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  const base = siteUrl();
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
