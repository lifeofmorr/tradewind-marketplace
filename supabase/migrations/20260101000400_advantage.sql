-- TradeWind Advantage: optional persisted scoring columns.
-- Scores are computed client-side too, so these columns are write-on-demand
-- (e.g. by an edge function or batch job) rather than required.

alter table public.listings
  add column if not exists deal_score int,
  add column if not exists deal_score_label text,
  add column if not exists quality_score int,
  add column if not exists quality_label text;

alter table public.inquiries
  add column if not exists lead_quality_score int,
  add column if not exists lead_quality_label text;

-- Helpful indexes for filtering / sorting in admin/dealer dashboards
create index if not exists listings_deal_score_idx
  on public.listings (deal_score desc nulls last);

create index if not exists listings_quality_score_idx
  on public.listings (quality_score desc nulls last);

create index if not exists inquiries_lead_quality_idx
  on public.inquiries (lead_quality_score desc nulls last);
