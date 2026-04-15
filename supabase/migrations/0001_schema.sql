-- InkblotPulse schema
-- Tables: profiles, books, excerpts, excerpt_stats, likes, bookmarks, view_sessions

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  author text not null check (char_length(author) between 1 and 100),
  synopsis text not null default '' check (char_length(synopsis) <= 2000),
  buy_link text check (buy_link is null or buy_link ~ '^https://'),
  cover_bg text not null,
  cover_text text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists books_tags_idx on books using gin (tags);
create index if not exists books_created_idx on books (created_at desc);

create table if not exists excerpts (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  "order" integer not null default 1,
  text text not null check (char_length(text) between 50 and 10000),
  created_at timestamptz not null default now()
);

create index if not exists excerpts_book_idx on excerpts (book_id, "order");
create index if not exists excerpts_created_idx on excerpts (created_at desc);

create table if not exists excerpt_stats (
  excerpt_id uuid primary key references excerpts(id) on delete cascade,
  views integer not null default 0 check (views >= 0),
  likes integer not null default 0 check (likes >= 0),
  want_clicks integer not null default 0 check (want_clicks >= 0)
);

create table if not exists likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  excerpt_id uuid not null references excerpts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, excerpt_id)
);

create index if not exists likes_excerpt_idx on likes (excerpt_id);

create table if not exists bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  excerpt_id uuid not null references excerpts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, excerpt_id)
);

create index if not exists bookmarks_user_idx on bookmarks (user_id);

create table if not exists view_sessions (
  user_id uuid not null references auth.users(id) on delete cascade,
  excerpt_id uuid not null references excerpts(id) on delete cascade,
  last_viewed_at timestamptz not null default now(),
  primary key (user_id, excerpt_id)
);

-- Auto-create excerpt_stats row when excerpt is inserted
create or replace function ensure_excerpt_stats()
returns trigger language plpgsql as $$
begin
  insert into excerpt_stats (excerpt_id) values (new.id)
  on conflict (excerpt_id) do nothing;
  return new;
end;
$$;

drop trigger if exists excerpts_ensure_stats on excerpts;
create trigger excerpts_ensure_stats
  after insert on excerpts
  for each row execute function ensure_excerpt_stats();

-- Auto-create profile row when auth user is created
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, is_admin) values (new.id, false)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helper: is current user admin?
create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select is_admin from profiles where id = auth.uid()),
    false
  );
$$;

-- Atomic action RPCs (bypass RLS via SECURITY DEFINER, called from server actions)

create or replace function register_view(p_excerpt_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    return;
  end if;

  insert into view_sessions (user_id, excerpt_id, last_viewed_at)
  values (v_user, p_excerpt_id, now())
  on conflict (user_id, excerpt_id) do update
    set last_viewed_at = excluded.last_viewed_at
  where view_sessions.last_viewed_at < now() - interval '30 minutes';

  if found then
    update excerpt_stats
      set views = views + 1
      where excerpt_id = p_excerpt_id;
  end if;
end;
$$;

create or replace function toggle_like(p_excerpt_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_liked boolean;
begin
  if v_user is null then
    raise exception 'unauthenticated';
  end if;

  select exists(select 1 from likes where user_id = v_user and excerpt_id = p_excerpt_id)
    into v_liked;

  if v_liked then
    delete from likes where user_id = v_user and excerpt_id = p_excerpt_id;
    update excerpt_stats
      set likes = greatest(0, likes - 1)
      where excerpt_id = p_excerpt_id;
    return false;
  else
    insert into likes (user_id, excerpt_id) values (v_user, p_excerpt_id);
    update excerpt_stats
      set likes = likes + 1
      where excerpt_id = p_excerpt_id;
    return true;
  end if;
end;
$$;

create or replace function toggle_bookmark(p_excerpt_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_saved boolean;
begin
  if v_user is null then
    raise exception 'unauthenticated';
  end if;

  select exists(select 1 from bookmarks where user_id = v_user and excerpt_id = p_excerpt_id)
    into v_saved;

  if v_saved then
    delete from bookmarks where user_id = v_user and excerpt_id = p_excerpt_id;
    return false;
  else
    insert into bookmarks (user_id, excerpt_id) values (v_user, p_excerpt_id);
    return true;
  end if;
end;
$$;

create or replace function register_want(p_excerpt_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update excerpt_stats
    set want_clicks = want_clicks + 1
    where excerpt_id = p_excerpt_id;
end;
$$;

-- Admin: reorder excerpt (swap order with neighbor)
create or replace function move_excerpt(p_excerpt_id uuid, p_direction integer)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_target record;
  v_neighbor record;
begin
  if not is_admin() then
    raise exception 'forbidden';
  end if;

  select * into v_target from excerpts where id = p_excerpt_id;
  if v_target is null then
    raise exception 'not found';
  end if;

  select * into v_neighbor
  from excerpts
  where book_id = v_target.book_id
    and (
      (p_direction > 0 and "order" > v_target."order")
      or (p_direction < 0 and "order" < v_target."order")
    )
  order by
    case when p_direction > 0 then "order" end asc,
    case when p_direction < 0 then "order" end desc
  limit 1;

  if v_neighbor is null then
    return;
  end if;

  update excerpts set "order" = -1 where id = v_target.id;
  update excerpts set "order" = v_target."order" where id = v_neighbor.id;
  update excerpts set "order" = v_neighbor."order" where id = v_target.id;
end;
$$;
