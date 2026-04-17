"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { submitBookInputSchema, submitExcerptInputSchema } from "@/lib/validation";
import type { ActionResult } from "./admin";

async function requireValidToken(token: string) {
  const sb = createServiceClient();
  const { data, error } = await sb.rpc("validate_invite_token", {
    p_token: token,
  });
  if (error || !data || data.length === 0 || !data[0].is_valid) {
    throw new Error("invalid_token");
  }
  return {
    tokenId: data[0].id as string,
    maxBooks: data[0].max_books as number | null,
    bookCount: Number(data[0].book_count),
  };
}

export async function submitBookAction(
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = submitBookInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_input",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let tokenInfo: Awaited<ReturnType<typeof requireValidToken>>;
  try {
    tokenInfo = await requireValidToken(parsed.data.token);
  } catch {
    return { ok: false, error: "invalid_token" };
  }

  const sb = createServiceClient();
  const input = parsed.data;

  // Update existing book
  if (input.id) {
    // Verify ownership
    const { data: existing } = await sb
      .from("books")
      .select("invite_token_id, status")
      .eq("id", input.id)
      .maybeSingle();
    if (!existing || existing.invite_token_id !== tokenInfo.tokenId) {
      return { ok: false, error: "forbidden" };
    }

    const { error } = await sb
      .from("books")
      .update({
        title: input.title,
        author: input.author,
        synopsis: input.synopsis,
        buy_link: input.buy_link,
        cover_bg: input.cover_bg,
        cover_text: input.cover_text,
        tags: input.tags,
        // Re-submit for review if it was rejected
        ...(existing.status === "rejected" ? { status: "pending" } : {}),
      })
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(`/submit/${input.token}`);
    return { ok: true, data: { id: input.id } };
  }

  // Create new book — check limit
  if (
    tokenInfo.maxBooks !== null &&
    tokenInfo.bookCount >= tokenInfo.maxBooks
  ) {
    return { ok: false, error: "max_books_reached" };
  }

  const { data, error } = await sb
    .from("books")
    .insert({
      title: input.title,
      author: input.author,
      synopsis: input.synopsis,
      buy_link: input.buy_link,
      cover_bg: input.cover_bg,
      cover_text: input.cover_text,
      tags: input.tags,
      status: "pending",
      invite_token_id: tokenInfo.tokenId,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/submit/${input.token}`);
  return { ok: true, data: { id: data.id } };
}

export async function deleteSubmittedBookAction(input: {
  token: string;
  bookId: string;
}): Promise<ActionResult> {
  const parsed = z
    .object({ token: z.string().min(1), bookId: z.string().uuid() })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  let tokenInfo: Awaited<ReturnType<typeof requireValidToken>>;
  try {
    tokenInfo = await requireValidToken(parsed.data.token);
  } catch {
    return { ok: false, error: "invalid_token" };
  }

  const sb = createServiceClient();

  // Verify ownership and status
  const { data: book } = await sb
    .from("books")
    .select("invite_token_id, status")
    .eq("id", parsed.data.bookId)
    .maybeSingle();
  if (!book || book.invite_token_id !== tokenInfo.tokenId) {
    return { ok: false, error: "forbidden" };
  }
  if (book.status === "published") {
    return { ok: false, error: "cannot_delete_published" };
  }

  const { error } = await sb
    .from("books")
    .delete()
    .eq("id", parsed.data.bookId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/submit/${parsed.data.token}`);
  return { ok: true };
}

export async function submitExcerptAction(
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = submitExcerptInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_input",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let tokenInfo: Awaited<ReturnType<typeof requireValidToken>>;
  try {
    tokenInfo = await requireValidToken(parsed.data.token);
  } catch {
    return { ok: false, error: "invalid_token" };
  }

  const sb = createServiceClient();
  const input = parsed.data;

  // Verify book ownership
  const { data: book } = await sb
    .from("books")
    .select("invite_token_id")
    .eq("id", input.book_id)
    .maybeSingle();
  if (!book || book.invite_token_id !== tokenInfo.tokenId) {
    return { ok: false, error: "forbidden" };
  }

  // Update
  if (input.id) {
    // Verify excerpt belongs to this book
    const { data: existing } = await sb
      .from("excerpts")
      .select("book_id")
      .eq("id", input.id)
      .maybeSingle();
    if (!existing || existing.book_id !== input.book_id) {
      return { ok: false, error: "forbidden" };
    }

    const { error } = await sb
      .from("excerpts")
      .update({ text: input.text })
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(`/submit/${input.token}`);
    return { ok: true, data: { id: input.id } };
  }

  // Create
  const { data: maxRow } = await sb
    .from("excerpts")
    .select("order")
    .eq("book_id", input.book_id)
    .order("order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxRow?.order ?? 0) + 1;

  const { data, error } = await sb
    .from("excerpts")
    .insert({ book_id: input.book_id, text: input.text, order: nextOrder })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/submit/${input.token}`);
  return { ok: true, data: { id: data.id } };
}

export async function deleteSubmittedExcerptAction(input: {
  token: string;
  excerptId: string;
}): Promise<ActionResult> {
  const parsed = z
    .object({ token: z.string().min(1), excerptId: z.string().uuid() })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  let tokenInfo: Awaited<ReturnType<typeof requireValidToken>>;
  try {
    tokenInfo = await requireValidToken(parsed.data.token);
  } catch {
    return { ok: false, error: "invalid_token" };
  }

  const sb = createServiceClient();

  // Verify ownership chain: excerpt → book → token
  const { data: excerpt } = await sb
    .from("excerpts")
    .select("book_id")
    .eq("id", parsed.data.excerptId)
    .maybeSingle();
  if (!excerpt) return { ok: false, error: "not_found" };

  const { data: book } = await sb
    .from("books")
    .select("invite_token_id")
    .eq("id", excerpt.book_id)
    .maybeSingle();
  if (!book || book.invite_token_id !== tokenInfo.tokenId) {
    return { ok: false, error: "forbidden" };
  }

  const { error } = await sb
    .from("excerpts")
    .delete()
    .eq("id", parsed.data.excerptId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/submit/${parsed.data.token}`);
  return { ok: true };
}

export async function moveSubmittedExcerptAction(input: {
  token: string;
  excerptId: string;
  direction: number;
}): Promise<ActionResult> {
  const parsed = z
    .object({
      token: z.string().min(1),
      excerptId: z.string().uuid(),
      direction: z.number().int().refine((n) => n === 1 || n === -1),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  let tokenInfo: Awaited<ReturnType<typeof requireValidToken>>;
  try {
    tokenInfo = await requireValidToken(parsed.data.token);
  } catch {
    return { ok: false, error: "invalid_token" };
  }

  const sb = createServiceClient();

  // Verify ownership chain
  const { data: excerpt } = await sb
    .from("excerpts")
    .select("book_id, order")
    .eq("id", parsed.data.excerptId)
    .maybeSingle();
  if (!excerpt) return { ok: false, error: "not_found" };

  const { data: book } = await sb
    .from("books")
    .select("invite_token_id")
    .eq("id", excerpt.book_id)
    .maybeSingle();
  if (!book || book.invite_token_id !== tokenInfo.tokenId) {
    return { ok: false, error: "forbidden" };
  }

  // Find neighbor
  const dir = parsed.data.direction;
  let neighborQuery = sb
    .from("excerpts")
    .select("id, order")
    .eq("book_id", excerpt.book_id);

  if (dir > 0) {
    neighborQuery = neighborQuery
      .gt("order", excerpt.order)
      .order("order", { ascending: true })
      .limit(1);
  } else {
    neighborQuery = neighborQuery
      .lt("order", excerpt.order)
      .order("order", { ascending: false })
      .limit(1);
  }

  const { data: neighbors } = await neighborQuery;
  const neighbor = neighbors?.[0];
  if (!neighbor) return { ok: true }; // already at edge

  // Swap orders
  await sb.from("excerpts").update({ order: -1 }).eq("id", parsed.data.excerptId);
  await sb.from("excerpts").update({ order: excerpt.order }).eq("id", neighbor.id);
  await sb.from("excerpts").update({ order: neighbor.order }).eq("id", parsed.data.excerptId);

  revalidatePath(`/submit/${parsed.data.token}`);
  return { ok: true };
}
