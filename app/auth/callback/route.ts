import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_REDIRECTS = ["/", "/bookmarks", "/admin", "/book"];

function isSafeRedirect(path: string): boolean {
  return ALLOWED_REDIRECTS.some(
    (prefix) => path === prefix || path.startsWith(prefix + "/")
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const raw = url.searchParams.get("next") ?? "/";
  const next = isSafeRedirect(raw) ? raw : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/auth/sign-in?error=callback", url.origin));
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
