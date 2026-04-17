-- Excerpt share counter
-- Adds `shares` column to excerpt_stats and a public `register_share` RPC
-- callable by anon + authenticated for analytics on shareable excerpt URLs.

alter table excerpt_stats
  add column if not exists shares integer not null default 0 check (shares >= 0);

create or replace function register_share(p_excerpt_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update excerpt_stats
    set shares = shares + 1
    where excerpt_id = p_excerpt_id;
end;
$$;

grant execute on function register_share(uuid) to anon, authenticated;
