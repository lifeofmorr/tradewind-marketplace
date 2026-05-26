-- ─────────────────────────────────────────────────────────────────────────────
-- Email Verification Gate — 2026-05-27
--
-- Adds an explicit verification state to every lead so the daily queue can
-- only pick from contacts whose address has been at least loosely confirmed.
-- After today's 33% bounce rate (6 sent, 2 bounced), the queue must refuse
-- to draft messages for un-verified addresses by default.
--
-- States:
--   verified       — confirmed live (got a real reply, or third-party
--                    verification service returned OK).
--   likely_valid   — published on the company's own website / contact page.
--                    The current gold-standard source for most cold leads.
--   unverified     — sourced from a third-party aggregator / guess pattern.
--                    Cannot be queued by the daily build.
--   bounced        — hard-bounced. Address blacklisted at the row level.
--   invalid        — known-invalid (syntax error, parked domain, role address
--                    that we cannot ethically send to, etc.).
--   do_not_email   — opted out, legal hold, or any other reason to never
--                    send to this contact again.
--
-- The address itself stays in the `email` column for audit. When a row
-- bounces, the bounced address is *also* copied into
-- `invalid_email_address` so downstream code has an explicit "this string
-- is poison" field to check.
--
-- Idempotent: safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- ── 1. Columns ──────────────────────────────────────────────────────────────

alter table public.outreach_leads
  add column if not exists email_verification_status text not null default 'unverified';

-- If the column existed already but without the CHECK, install it now.
-- (DO block makes the CHECK install idempotent.)
do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conname = 'outreach_leads_email_verification_status_check'
       and conrelid = 'public.outreach_leads'::regclass
  ) then
    alter table public.outreach_leads
      add constraint outreach_leads_email_verification_status_check
      check (email_verification_status in (
        'verified', 'likely_valid', 'unverified',
        'bounced', 'invalid', 'do_not_email'
      ));
  end if;
end$$;

alter table public.outreach_leads
  add column if not exists email_verification_source text;

alter table public.outreach_leads
  add column if not exists email_verified_at timestamptz;

alter table public.outreach_leads
  add column if not exists bounce_reason text;

alter table public.outreach_leads
  add column if not exists invalid_email_address text;

-- ── 2. Indexes ──────────────────────────────────────────────────────────────

create index if not exists outreach_leads_email_verification_status_idx
  on public.outreach_leads (email_verification_status);

-- Composite that the daily-queue picker uses (verified/likely_valid only,
-- skipping DNC, ordered by priority).
create index if not exists outreach_leads_queue_picker_idx
  on public.outreach_leads (priority desc, lead_score desc, updated_at desc)
  where do_not_contact = false
    and email_verification_status in ('verified', 'likely_valid');

-- ── 3. Backfill ─────────────────────────────────────────────────────────────

-- 3a. The 2 bounced addresses from 2026-05-26.
update public.outreach_leads
   set email_verification_status = 'bounced',
       invalid_email_address     = email,
       bounce_reason             = coalesce(bounce_reason,
                                            'Hard bounce on 2026-05-26 (info@ inbox).'),
       email_verification_source = coalesce(email_verification_source,
                                            'send_attempt'),
       email_verified_at         = coalesce(email_verified_at, now())
 where lower(email) in (
   lower('info@usaaircraft.com'),
   lower('info@smokymountaintraders.com')
 );

-- 3b. The 4 delivered addresses — promote to likely_valid.
--     Delivery is not the same as verified (a reply would be), but a
--     non-bouncing inbox sourced from the company's own contact page is
--     about as good as it gets without a paid verification service.
update public.outreach_leads
   set email_verification_status = 'likely_valid',
       email_verification_source = coalesce(email_verification_source,
                                            'company_website_and_delivered_2026_05_26'),
       email_verified_at         = coalesce(email_verified_at, now())
 where (lower(email) in (
          lower('info@nashvilleyachtbrokers.com'),
          lower('info@pslyachtbrokers.com'),
          lower('steve@flagshipmarinesurvey.com')
        ) or company ilike 'Carolina Aircraft%')
   and email_verification_status not in ('bounced', 'invalid', 'do_not_email');

-- 3c. Everyone else stays 'unverified' (the column default already gave
--     them this state). No statement needed — included as a comment so the
--     next maintainer doesn't wonder where the rest went.

commit;
