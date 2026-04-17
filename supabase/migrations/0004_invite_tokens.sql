-- Invite tokens for author submission links
-- Authors receive a personal URL with a token, can submit books/excerpts without auth.
-- Submitted books go through admin moderation (status = 'pending' → 'published' | 'rejected').

-- 1. invite_tokens table
create table if not exists invite_tokens (
  id         uuid primary key default gen_random_uuid(),
  token      text not null unique default encode(gen_random_bytes(32), 'hex'),
  label      text not null default '' check (char_length(label) <= 200),
  max_books  integer check (max_books is null or max_books > 0),
  expires_at timestamptz,
  revoked    boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. New columns on books
alter table books
  add column if not exists status text not null default 'published'
    check (status in ('pending', 'published', 'rejected'));

alter table books
  add column if not exists invite_token_id uuid references invite_tokens(id) on delete set null;

create index if not exists books_invite_token_idx on books (invite_token_id);

-- 3. RLS for invite_tokens (admin only)
alter table invite_tokens enable row level security;

create policy invite_tokens_admin_all on invite_tokens
  for all using (is_admin()) with check (is_admin());

-- 4. Update books SELECT policy: public sees only published; admin sees all
drop policy if exists books_select_all on books;
create policy books_select_all on books
  for select using (status = 'published' or is_admin());

-- 5. Validate invite token (used by server actions)
create or replace function validate_invite_token(p_token text)
returns table (
  id uuid,
  label text,
  max_books integer,
  book_count bigint,
  is_valid boolean
) language sql stable security definer set search_path = public as $$
  select
    it.id,
    it.label,
    it.max_books,
    (select count(*) from books b where b.invite_token_id = it.id) as book_count,
    (not it.revoked and (it.expires_at is null or it.expires_at > now())) as is_valid
  from invite_tokens it
  where it.token = p_token;
$$;
