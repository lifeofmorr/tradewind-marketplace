# TradeWind Private Beta — Pre-Launch Checklist

Run through this checklist before sending the first beta invitation. Mark each item before flipping the switch on a new tester cohort.

## Build & Deploy
- [ ] All open PRs merged to `main`
- [ ] Vercel has deployed the latest `main` build (check the deployment timestamp matches `git log -1 --format=%ct main`)
- [ ] No build errors or warnings in the latest deploy log
- [ ] Production URL loads in under 3 seconds on a cold visit

## Database
- [ ] Supabase migrations applied through the latest timestamp
  - `offer_drafts` table exists (Offer Builder)
  - `listings.advantage_*` columns present (Deal Score / True Cost)
  - `priority2` migration (`supabase/migrations/20260101000500_priority2.sql`) applied
- [ ] Row Level Security (RLS) policies enabled on every user-facing table
- [ ] At least 50 demo listings active and visible on `/listings`
- [ ] Demo listings flagged with `is_demo = true` so they can be filtered out later

## Accounts
- [ ] Admin account `donmondemorrison@gmail.com` can log in and reach `/admin`
- [ ] Admin role is set in `profiles.role = 'admin'`
- [ ] One test account exists per role: buyer, seller, dealer, service_provider (5 total including admin)
- [ ] Password reset email tested for at least one account

## Payments
- [ ] Stripe is in **test mode** (live keys must NOT be set)
- [ ] All 7 products created in Stripe and visible on `/pricing`
- [ ] Stripe webhook secret configured in Supabase secrets
- [ ] Test card `4242 4242 4242 4242` completes a checkout end-to-end
- [ ] Subscription status syncs back to `profiles.subscription_tier`

## Edge Functions
- [ ] All 12 edge functions deployed (`supabase functions list`)
- [ ] `ALLOWED_ORIGINS` secret set to the production domain
- [ ] Each function returns `200` on its OPTIONS preflight
- [ ] Functions log to Supabase log explorer without unhandled errors

## Signup & Routing
- [ ] Signup completes for all 4 user roles via `?role=` query parameter
- [ ] Email confirmation links resolve to the correct role dashboard
- [ ] Role-gated routes redirect non-matching users to `/`
- [ ] Profile completeness check fires on first login

## Listings
- [ ] Demo listings clearly labeled with the "Demo Listing" badge
- [ ] Image fallback placeholder renders when a listing has no photos
- [ ] Pricing amounts display formatted (`$24,500` not `24500`)
- [ ] Boats, Cars, and Trucks category pages each show at least 5 results

## Trust & Compliance
- [ ] Trust Center accessible at `/trust` and links work in the footer
- [ ] Privacy Policy, Terms, and Refund Policy pages render
- [ ] Cookie / tracking notice visible on first visit (if applicable)

## UX Sanity
- [ ] Pricing page shows real amounts (not `$0` or `TBD`)
- [ ] Mobile layout functional at 375px width on the homepage, listings grid, and listing detail
- [ ] No console errors on `/`, `/listings`, `/listings/:id`, `/pricing`, `/trust`
- [ ] All footer links resolve (no 404s)

## API Keys
- [ ] **Anthropic** — note status (set / missing). AI listing generator and AI follow-up disabled if missing.
- [ ] **OpenAI** — note status (set / missing). Embeddings / similarity ranking disabled if missing.
- [ ] **Resend** — note status (set / missing). Inquiry & onboarding emails disabled if missing.

> If any of the above are missing, document the limitation in the beta invite so testers know what to expect.

## Domain & DNS
- [ ] Custom domain `gotradewind.com` — **not yet configured** as of this checklist
- [ ] Vercel preview URL is acceptable for the private beta
- [ ] When the domain is wired, update Stripe redirect URLs and Supabase Site URL

## Final Smoke Test
- [ ] Run `npm run typecheck` — must pass
- [ ] Run `npm run build` — must succeed
- [ ] Run `npm test -- --run` — smoke tests must pass
- [ ] Visit production URL incognito and complete the buyer flow end-to-end

When every item is checked, you are clear to send the first invitation batch.
