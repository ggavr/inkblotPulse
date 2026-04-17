"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const idSchema = z.object({ excerptId: z.string().uuid() });

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function toggleLikeAction(
  input: { excerptId: string }
): Promise<ActionResult<{ liked: boolean }>> {
  const parsed = idSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthenticated" };

  const { data, error } = await supabase.rpc("toggle_like", {
    p_excerpt_id: parsed.data.excerptId,
  });
  if (error) { console.error("toggle_like failed:", error); return { ok: false, error: "like_failed" }; }

  revalidatePath("/");
  return { ok: true, data: { liked: Boolean(data) } };
}

export async function toggleBookmarkAction(
  input: { excerptId: string }
): Promise<ActionResult<{ saved: boolean }>> {
  const parsed = idSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthenticated" };

  const { data, error } = await supabase.rpc("toggle_bookmark", {
    p_excerpt_id: parsed.data.excerptId,
  });
  if (error) { console.error("toggle_bookmark failed:", error); return { ok: false, error: "bookmark_failed" }; }

  revalidatePath("/bookmarks");
  revalidatePath("/");
  return { ok: true, data: { saved: Boolean(data) } };
}

export async function registerViewAction(
  input: { excerptId: string }
): Promise<ActionResult> {
  const parsed = idSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: true };

  const { error } = await supabase.rpc("register_view", {
    p_excerpt_id: parsed.data.excerptId,
  });
  if (error) { console.error("register_view failed:", error); return { ok: false, error: "view_failed" }; }
  return { ok: true };
}

export async function registerWantAction(
  input: { excerptId: string | null }
): Promise<ActionResult> {
  if (!input.excerptId) return { ok: true };
  const parsed = idSchema.safeParse({ excerptId: input.excerptId });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("register_want", {
    p_excerpt_id: parsed.data.excerptId,
  });
  if (error) { console.error("register_want failed:", error); return { ok: false, error: "want_failed" }; }
  return { ok: true };
}

export async function registerShareAction(
  input: { excerptId: string }
): Promise<ActionResult> {
  const parsed = idSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("register_share", {
    p_excerpt_id: parsed.data.excerptId,
  });
  if (error) { console.error("register_share failed:", error); return { ok: false, error: "share_failed" }; }
  return { ok: true };
}
