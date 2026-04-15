"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { bookInputSchema, excerptInputSchema } from "@/lib/validation";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function asError(err: unknown, fallback = "unknown_error"): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

export async function saveBookAction(
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "forbidden" };
  }

  const parsed = bookInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_input",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const input = parsed.data;

  if (input.id) {
    const { error } = await supabase
      .from("books")
      .update({
        title: input.title,
        author: input.author,
        synopsis: input.synopsis,
        buy_link: input.buy_link,
        cover_bg: input.cover_bg,
        cover_text: input.cover_text,
        tags: input.tags,
      })
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/");
    revalidatePath(`/book/${input.id}`);
    revalidatePath("/admin");
    return { ok: true, data: { id: input.id } };
  }

  const { data, error } = await supabase
    .from("books")
    .insert({
      title: input.title,
      author: input.author,
      synopsis: input.synopsis,
      buy_link: input.buy_link,
      cover_bg: input.cover_bg,
      cover_text: input.cover_text,
      tags: input.tags,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true, data: { id: data.id } };
}

export async function deleteBookAction(input: {
  bookId: string;
}): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "forbidden" };
  }
  const parsed = z.object({ bookId: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const supabase = await createClient();
  const { error } = await supabase.from("books").delete().eq("id", parsed.data.bookId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

export async function saveExcerptAction(
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "forbidden" };
  }

  const parsed = excerptInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_input",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const input = parsed.data;

  if (input.id) {
    const { error } = await supabase
      .from("excerpts")
      .update({ text: input.text })
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/");
    revalidatePath(`/book/${input.book_id}`);
    revalidatePath("/admin");
    return { ok: true, data: { id: input.id } };
  }

  const { data: maxRow } = await supabase
    .from("excerpts")
    .select("order")
    .eq("book_id", input.book_id)
    .order("order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxRow?.order ?? 0) + 1;

  const { data, error } = await supabase
    .from("excerpts")
    .insert({ book_id: input.book_id, text: input.text, order: nextOrder })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath(`/book/${input.book_id}`);
  revalidatePath("/admin");
  return { ok: true, data: { id: data.id } };
}

export async function deleteExcerptAction(input: {
  excerptId: string;
}): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "forbidden" };
  }
  const parsed = z.object({ excerptId: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("excerpts")
    .delete()
    .eq("id", parsed.data.excerptId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

export async function moveExcerptAction(input: {
  excerptId: string;
  direction: number;
}): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "forbidden" };
  }
  const parsed = z
    .object({
      excerptId: z.string().uuid(),
      direction: z.number().int().refine((n) => n === 1 || n === -1, "bad direction"),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("move_excerpt", {
    p_excerpt_id: parsed.data.excerptId,
    p_direction: parsed.data.direction,
  });
  if (error) return { ok: false, error: asError(error) };
  revalidatePath("/admin");
  return { ok: true };
}
