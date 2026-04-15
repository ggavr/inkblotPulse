-- Row Level Security policies

alter table profiles enable row level security;
alter table books enable row level security;
alter table excerpts enable row level security;
alter table excerpt_stats enable row level security;
alter table likes enable row level security;
alter table bookmarks enable row level security;
alter table view_sessions enable row level security;

-- profiles: user can read their own profile; admin can read all
drop policy if exists profiles_select_own on profiles;
create policy profiles_select_own on profiles
  for select using (id = auth.uid() or is_admin());

drop policy if exists profiles_update_admin on profiles;
create policy profiles_update_admin on profiles
  for update using (is_admin()) with check (is_admin());

-- books: everyone can read; only admin can write
drop policy if exists books_select_all on books;
create policy books_select_all on books
  for select using (true);

drop policy if exists books_insert_admin on books;
create policy books_insert_admin on books
  for insert with check (is_admin());

drop policy if exists books_update_admin on books;
create policy books_update_admin on books
  for update using (is_admin()) with check (is_admin());

drop policy if exists books_delete_admin on books;
create policy books_delete_admin on books
  for delete using (is_admin());

-- excerpts: everyone can read; only admin can write
drop policy if exists excerpts_select_all on excerpts;
create policy excerpts_select_all on excerpts
  for select using (true);

drop policy if exists excerpts_insert_admin on excerpts;
create policy excerpts_insert_admin on excerpts
  for insert with check (is_admin());

drop policy if exists excerpts_update_admin on excerpts;
create policy excerpts_update_admin on excerpts
  for update using (is_admin()) with check (is_admin());

drop policy if exists excerpts_delete_admin on excerpts;
create policy excerpts_delete_admin on excerpts
  for delete using (is_admin());

-- excerpt_stats: public read; no direct writes (only through RPCs)
drop policy if exists excerpt_stats_select_all on excerpt_stats;
create policy excerpt_stats_select_all on excerpt_stats
  for select using (true);

-- likes: user sees/modifies their own
drop policy if exists likes_select_own on likes;
create policy likes_select_own on likes
  for select using (user_id = auth.uid());

-- (writes only via toggle_like RPC)

-- bookmarks: user sees/modifies their own
drop policy if exists bookmarks_select_own on bookmarks;
create policy bookmarks_select_own on bookmarks
  for select using (user_id = auth.uid());

-- (writes only via toggle_bookmark RPC)

-- view_sessions: user sees their own
drop policy if exists view_sessions_select_own on view_sessions;
create policy view_sessions_select_own on view_sessions
  for select using (user_id = auth.uid());
