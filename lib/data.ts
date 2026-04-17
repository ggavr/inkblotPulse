import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Book, Excerpt, ExcerptWithStats, InviteToken } from "@/lib/types";

export async function getBooks(): Promise<Book[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getBookById(id: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("books").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

type ExcerptJoin = Excerpt & {
  excerpt_stats:
    | { views: number; likes: number; want_clicks: number }
    | { views: number; likes: number; want_clicks: number }[]
    | null;
};

function joinStats(row: ExcerptJoin): ExcerptWithStats {
  const stats = Array.isArray(row.excerpt_stats)
    ? row.excerpt_stats[0]
    : row.excerpt_stats;
  return {
    id: row.id,
    book_id: row.book_id,
    order: row.order,
    text: row.text,
    created_at: row.created_at,
    stats: {
      views: stats?.views ?? 0,
      likes: stats?.likes ?? 0,
      want_clicks: stats?.want_clicks ?? 0,
    },
  };
}

export async function getExcerpts(opts?: {
  limit?: number;
  offset?: number;
  tags?: string[];
  search?: string;
}): Promise<ExcerptWithStats[]> {
  const supabase = await createClient();
  let query = supabase
    .from("excerpts")
    .select("*, excerpt_stats(views, likes, want_clicks), books!inner(id, tags, title, author, status)")
    .eq("books.status", "published")
    .order("created_at", { ascending: true });

  if (opts?.tags && opts.tags.length > 0) {
    query = query.overlaps("books.tags", opts.tags);
  }
  if (opts?.search && opts.search.trim().length > 0) {
    const escaped = opts.search.trim().replace(/[,%_()]/g, " ");
    query = query.or(`title.ilike.%${escaped}%,author.ilike.%${escaped}%`, {
      referencedTable: "books",
    });
  }
  if (typeof opts?.offset === "number" && typeof opts?.limit === "number") {
    query = query.range(opts.offset, opts.offset + opts.limit - 1);
  } else if (typeof opts?.limit === "number") {
    query = query.limit(opts.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return ((data as unknown) as ExcerptJoin[] | null ?? []).map(joinStats);
}

export async function getExcerptsForBook(bookId: string): Promise<ExcerptWithStats[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("excerpts")
    .select("*, excerpt_stats(views, likes, want_clicks)")
    .eq("book_id", bookId)
    .order("order", { ascending: true });
  if (error) throw error;
  return ((data as unknown) as ExcerptJoin[] | null ?? []).map(joinStats);
}

export async function getAllExcerpts(): Promise<ExcerptWithStats[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("excerpts")
    .select("*, excerpt_stats(views, likes, want_clicks)")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return ((data as unknown) as ExcerptJoin[] | null ?? []).map(joinStats);
}

export async function getUserLikes(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data, error } = await supabase.from("likes").select("excerpt_id").eq("user_id", user.id);
  if (error) return new Set();
  return new Set((data ?? []).map((r) => r.excerpt_id));
}

export async function getUserBookmarks(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data, error } = await supabase.from("bookmarks").select("excerpt_id").eq("user_id", user.id);
  if (error) return new Set();
  return new Set((data ?? []).map((r) => r.excerpt_id));
}

export async function getBookmarkedExcerpts(): Promise<ExcerptWithStats[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("bookmarks")
    .select(
      "excerpt_id, excerpts(*, excerpt_stats(views, likes, want_clicks))"
    )
    .order("created_at", { ascending: false });
  if (error) return [];
  type Row = {
    excerpts:
      | (ExcerptJoin | null)
      | (ExcerptJoin | null)[]
      | null;
  };
  const out: ExcerptWithStats[] = [];
  for (const row of (data as unknown as Row[]) ?? []) {
    const e = Array.isArray(row.excerpts) ? row.excerpts[0] : row.excerpts;
    if (e) out.push(joinStats(e));
  }
  return out;
}

// ── Invite token helpers (service-role client, bypasses RLS) ──

export async function getInviteByToken(token: string) {
  const sb = createServiceClient();
  const { data, error } = await sb.rpc("validate_invite_token", {
    p_token: token,
  });
  if (error || !data || data.length === 0) return null;
  return data[0];
}

export async function getBooksForToken(tokenId: string): Promise<Book[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("books")
    .select("*")
    .eq("invite_token_id", tokenId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getExcerptsForTokenBook(
  tokenId: string,
  bookId: string
): Promise<ExcerptWithStats[]> {
  const sb = createServiceClient();
  // Verify book belongs to this token
  const { data: book } = await sb
    .from("books")
    .select("id")
    .eq("id", bookId)
    .eq("invite_token_id", tokenId)
    .maybeSingle();
  if (!book) return [];

  const { data, error } = await sb
    .from("excerpts")
    .select("*, excerpt_stats(views, likes, want_clicks)")
    .eq("book_id", bookId)
    .order("order", { ascending: true });
  if (error) throw error;
  return ((data as unknown) as ExcerptJoin[] | null ?? []).map(joinStats);
}

export async function getAllInvites(): Promise<
  (InviteToken & { book_count: number })[]
> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("invite_tokens")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  // Count books per token
  const tokens = data ?? [];
  if (tokens.length === 0) return [];

  const { data: counts } = await sb
    .from("books")
    .select("invite_token_id")
    .in(
      "invite_token_id",
      tokens.map((t) => t.id)
    );

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    if (row.invite_token_id) {
      countMap.set(
        row.invite_token_id,
        (countMap.get(row.invite_token_id) ?? 0) + 1
      );
    }
  }

  return tokens.map((t) => ({ ...t, book_count: countMap.get(t.id) ?? 0 }));
}

export async function getPendingSubmissions(): Promise<
  (Book & { invite_label: string; excerpt_count: number })[]
> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("books")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const books = (data ?? []) as Book[];
  if (books.length === 0) return [];

  // Get invite labels
  const tokenIds = [
    ...new Set(books.map((b) => b.invite_token_id).filter(Boolean)),
  ] as string[];
  const labelMap = new Map<string, string>();
  if (tokenIds.length > 0) {
    const { data: tokens } = await sb
      .from("invite_tokens")
      .select("id, label")
      .in("id", tokenIds);
    for (const t of tokens ?? []) labelMap.set(t.id, t.label);
  }

  // Get excerpt counts
  const bookIds = books.map((b) => b.id);
  const { data: excerpts } = await sb
    .from("excerpts")
    .select("book_id")
    .in("book_id", bookIds);

  const excerptCountMap = new Map<string, number>();
  for (const e of excerpts ?? []) {
    excerptCountMap.set(e.book_id, (excerptCountMap.get(e.book_id) ?? 0) + 1);
  }

  return books.map((b) => ({
    ...b,
    invite_label: b.invite_token_id
      ? labelMap.get(b.invite_token_id) ?? ""
      : "",
    excerpt_count: excerptCountMap.get(b.id) ?? 0,
  }));
}
