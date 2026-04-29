-- ============================================================================
-- TradeWind · Demo listing score backfill
-- ============================================================================
-- Populates deal_score / deal_score_label / quality_score / quality_label
-- on every listing with is_demo = true. The buyer-facing detail page reads
-- these columns to render the Deal Score badge, the True Cost-to-Own card,
-- and the Buy-Ready checklist; without them, the right rail looks empty.
--
-- Apply with:
--   psql "$SUPABASE_DB_URL" -f supabase/demo_score_patch.sql
-- or paste into the Supabase SQL editor.
--
-- Idempotent: re-running produces the same result. Safe on production —
-- it only touches rows where is_demo = true.
-- ============================================================================

-- 1. Ensure columns exist (no-op if the advantage migration already ran).
alter table public.listings
  add column if not exists is_demo          boolean not null default false,
  add column if not exists deal_score       int,
  add column if not exists deal_score_label text,
  add column if not exists quality_score    int,
  add column if not exists quality_label    text;

-- 2. Compute a deterministic but varied score per demo listing, then derive
--    labels from the score. Using a CTE keeps the math in one place.
with scored as (
  select
    id,
    -- Boats run a slightly tighter band than autos: marine ownership costs
    -- and condition variance pull the average a few points lower.
    least(95, greatest(55,
      62
      -- Recency: newer = better deal confidence
      + case
          when year is null            then  0
          when year >= 2024            then 16
          when year >= 2022            then 11
          when year >= 2019            then  6
          when year >= 2015            then  2
          else                              -2
        end
      -- Price band relative to category averages (lower = better deal)
      + case
          when price_cents is null         then  0
          when price_cents <  5000000      then 12
          when price_cents < 15000000      then  8
          when price_cents < 35000000      then  4
          when price_cents < 80000000      then  0
          when price_cents <150000000      then -3
          else                                  -6
        end
      -- Trust + marketing flags
      + case when is_featured       then 5 else 0 end
      + case when is_verified       then 3 else 0 end
      + case when is_finance_partner then 2 else 0 end
      -- Boats run a touch harder than autos
      + case
          when category in ('boat','performance_boat','yacht','center_console') then -2
          when category in ('car','truck')                                       then  2
          else                                                                        0
        end
      -- Slug-derived jitter so 50 listings don't cluster on the same number.
      -- abs(hashtext(...)) is stable per slug.
      + ((abs(hashtext(coalesce(slug, id::text))) % 9) - 4)
    ))::int as new_deal_score,
    least(100, greatest(60,
      72
      + case
          when year is null            then  0
          when year >= 2024            then 14
          when year >= 2022            then 10
          when year >= 2019            then  6
          when year >= 2015            then  2
          else                              -2
        end
      + case when is_featured  then 5 else 0 end
      + case when is_verified  then 4 else 0 end
      + case when is_premium   then 4 else 0 end
      + case
          when condition is null                                  then  0
          when lower(condition) in ('new','excellent','restored') then  4
          when lower(condition) in ('used','good')                then  1
          else                                                          -2
        end
      + case
          when category = 'yacht'   then  3
          when category = 'exotic'  then  3
          when category = 'classic' then  2
          else                            0
        end
      + ((abs(hashtext(coalesce(slug, id::text) || ':q')) % 7) - 3)
    ))::int as new_quality_score
  from public.listings
  where is_demo = true
)
update public.listings l
   set deal_score       = s.new_deal_score,
       deal_score_label = case
         when s.new_deal_score >= 82 then 'Great Deal'
         when s.new_deal_score >= 68 then 'Fair Deal'
         when s.new_deal_score >= 58 then 'High Price'
         else                              'Needs Review'
       end,
       quality_score    = s.new_quality_score,
       quality_label    = case
         when s.new_quality_score >= 90 then 'Premium'
         when s.new_quality_score >= 78 then 'Strong'
         else                                 'Good'
       end,
       updated_at = now()
  from scored s
 where l.id = s.id;

-- 3. Sanity check: surface how many demo listings now have scores. Output
--    appears in psql / SQL editor as a NOTICE.
do $$
declare
  total_demo  int;
  with_scores int;
begin
  select count(*) into total_demo  from public.listings where is_demo = true;
  select count(*) into with_scores from public.listings
    where is_demo = true and deal_score is not null and quality_score is not null;
  raise notice 'demo_score_patch: % of % demo listings now have scores', with_scores, total_demo;
end $$;
