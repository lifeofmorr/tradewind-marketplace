# Release Checklist — TradeWind

**Last reviewed:** 2026-05-26
**Cadence:** continuous deployment to staging; gated promotion to production.

A "release" = merging code to `main` + Vercel auto-deploy. There is no manual production cut today, so this checklist runs **before merging the PR**, not after.

## Pre-merge — engineer

- [ ] Branch is up to date with `main`.
- [ ] `npm run typecheck` — clean.
- [ ] `npm run build` — clean.
- [ ] `npx vitest run` — all tests pass.
- [ ] No `console.log` debug litter (keep `console.warn/error` where intentional).
- [ ] No `.env.local` secrets committed.
- [ ] No new `--no-verify` hook bypasses.
- [ ] Diff reviewed: smallest change that achieves the goal.
- [ ] Migration files (if any) reviewed manually and idempotent.
- [ ] New surfaces wired through `<L>` ErrorBoundary + Suspense (`src/App.tsx`).
- [ ] New edge functions verify JWT (or document why they don't).
- [ ] RLS verified for any new table / column.
- [ ] If touching payment / Stripe code: tested on Stripe **TEST** mode.
- [ ] If touching AI fn: token usage logged to `ai_logs`.
- [ ] If touching user-facing copy: legal/disclaimer language reviewed.
- [ ] If touching listing data: respect `is_demo` flag on UI.

## Pre-merge — admin / product

- [ ] PR description names the user-visible change.
- [ ] If shipping a new feature, `ENTERPRISE_FEATURE_MATRIX.md` updated.
- [ ] Doc updates committed alongside the code (this file family).

## Staging soak

- [ ] Vercel preview deploy URL works.
- [ ] Smoke test on preview: home loads, login works, one dashboard route works.
- [ ] If migration shipped: applied to staging Supabase first, smoke tested.
- [ ] If new edge function: deployed to staging (`supabase functions deploy <name> --linked --project-ref <staging>`).
- [ ] Soak ≥ 30 min for P1/P2 changes; can skip for trivial P3 docs-only PRs.

## Merge → production

- [ ] Squash-merge with a clear summary message.
- [ ] Watch Vercel build complete.
- [ ] If migration shipped: apply to production (`supabase db push --linked --project-ref qwaotydaazymgnvnfuuj`).
- [ ] If new edge function: deploy to prod (`supabase functions deploy <name> --linked --project-ref qwaotydaazymgnvnfuuj`).
- [ ] If new env var: set in Vercel **Production** scope + Supabase **prod** secrets.

## Post-deploy verification

- [ ] Live URL loads: https://tradewind-marketplace.vercel.app.
- [ ] Auth: sign in with a known test admin → reach `/admin`.
- [ ] One public route smoke: `/`, `/browse`, `/listings/:slug`.
- [ ] If touching payments: trigger a TEST-mode checkout end-to-end.
- [ ] Sentry (when wired) shows no new error class.
- [ ] Supabase fn logs clean for 10 min.

## Versioning

We don't ship versioned releases publicly yet. Internal tags:

```bash
git tag -a v$(date +%Y.%m.%d) -m "release: <one-line summary>"
git push origin v$(date +%Y.%m.%d)
```

Tag every Friday EOD as a snapshot for easy rollback reference.

## Rollback

If post-deploy verification fails → follow `ROLLBACK_PLAN.md`. Default: revert the merge commit, push to `main`, Vercel auto-redeploys the previous bundle.

## Communication

- **Internal:** every merged PR auto-posts to the founder's notes.
- **External (private beta testers):** outage / feature notes via email on a weekly cadence.
- **Public (post-launch):** changelog at `/blog` and / or a dedicated `/changelog` route.

## Emergency hotfix

Sometimes you need to ship in < 30 min:

1. Branch `hotfix/<slug>` from `main`.
2. Make the smallest possible change.
3. Run `npm run typecheck && npm run build && npx vitest run`.
4. Push, get preview deploy URL, smoke test.
5. Merge directly (founder approval recorded in chat).
6. Post-deploy verify (mandatory even in hotfix).
7. Post-mortem within 5 business days per `BUG_TRIAGE_PROCESS.md`.

Hotfixes **still go through staging** unless data loss is actively occurring (P0 only).
