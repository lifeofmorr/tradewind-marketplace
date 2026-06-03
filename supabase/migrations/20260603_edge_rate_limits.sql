-- Edge-function rate limiting.
--
-- Backs the rate-limit middleware in supabase/functions/_shared/rate-limit.ts,
-- which protects the AI + outreach edge functions from abuse / runaway cost.
--
-- Design: one fixed-window counter per bucket key. A bucket key is
--   "<function>:<scope>:<identifier>"  e.g.  "ai-pricing-estimate:public:203.0.113.5"
-- The window resets lazily on the first hit after it expires, so no cron/sweeper
-- is required. A periodic prune of stale rows is provided but optional.

create table if not exists public.edge_rate_limits (
  bucket_key   text primary key,
  window_start timestamptz not null default now(),
  count        integer     not null default 0,
  updated_at   timestamptz not null default now()
);

-- RLS on with NO policies => no anon/authenticated access at all. Only the
-- service_role key (used by edge functions) can touch this table, and it
-- bypasses RLS. This table holds IP addresses / user ids, so it must never be
-- client-readable.
alter table public.edge_rate_limits enable row level security;

-- Atomic check-and-increment. Returns whether the caller is allowed, how many
-- requests remain in the window, and (when blocked) how many seconds until the
-- window resets. SECURITY DEFINER so it can write regardless of caller role,
-- but execution is restricted to service_role below.
create or replace function public.edge_rate_limit_hit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, remaining integer, retry_after integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now     timestamptz := now();
  v_count   integer;
  v_start   timestamptz;
  v_expired boolean;
begin
  insert into public.edge_rate_limits as e (bucket_key, window_start, count, updated_at)
    values (p_key, v_now, 1, v_now)
  on conflict (bucket_key) do update
    set count = case
          when e.window_start < v_now - make_interval(secs => p_window_seconds) then 1
          else e.count + 1
        end,
        window_start = case
          when e.window_start < v_now - make_interval(secs => p_window_seconds) then v_now
          else e.window_start
        end,
        updated_at = v_now
  returning e.count, e.window_start into v_count, v_start;

  allowed     := v_count <= p_limit;
  remaining   := greatest(0, p_limit - v_count);
  retry_after := case
    when v_count <= p_limit then 0
    else ceil(extract(epoch from (v_start + make_interval(secs => p_window_seconds) - v_now)))::integer
  end;
  return next;
end;
$$;

-- Optional housekeeping: drop counters whose window ended over a day ago.
create or replace function public.prune_edge_rate_limits()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.edge_rate_limits
    where updated_at < now() - interval '1 day';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- Lock down execution to service_role only.
revoke all on function public.edge_rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.edge_rate_limit_hit(text, integer, integer) to service_role;

revoke all on function public.prune_edge_rate_limits() from public, anon, authenticated;
grant execute on function public.prune_edge_rate_limits() to service_role;
