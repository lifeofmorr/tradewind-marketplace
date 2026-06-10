# DOMAIN LAUNCH CHECKLIST

**Recommended Domain:** `gotradewind.com`
**Hosting:** Vercel (auto SSL, global CDN)
**Owner:** Don Morrison

---

## 1. DOMAIN ACQUISITION

| Step | Status | Notes |
|---|---|---|
| Confirm `gotradewind.com` available at registrar | TODO | Check Namecheap / Cloudflare / Google Domains |
| Purchase domain (5-year registration recommended) | TODO | Lock in long-term to avoid expiry |
| Enable WHOIS privacy | TODO | Standard hygiene |
| Enable registrar 2FA | TODO | Critical — domain hijack is catastrophic |
| Enable registry lock if available | TODO | Cloudflare offers this free |
| Optional: secure `.io`, `.app`, `.net` defensively | OPTIONAL | Park them to prevent typosquatting |

---

## 2. VERCEL CUSTOM DOMAIN SETUP

| Step | Status | Notes |
|---|---|---|
| Vercel Project → Settings → Domains → Add `gotradewind.com` | TODO | |
| Vercel Project → Add `www.gotradewind.com` | TODO | |
| Set `gotradewind.com` as PRIMARY | TODO | Apex domain canonical |
| Configure `www.gotradewind.com` → 308 redirect → `gotradewind.com` | TODO | Vercel handles this automatically when primary is set |
| Verify Vercel issues SSL cert (Let's Encrypt) | AUTO | Wait ~10 min after DNS propagates |
| Disable default `tradewind-marketplace.vercel.app` indexability | TODO | After cutover, add canonical tag pointing to gotradewind.com |

---

## 3. DNS RECORDS

Add at registrar's DNS panel (or Cloudflare if using as nameserver):

| Type | Name | Value | TTL | Status |
|---|---|---|---|---|
| A | `@` | `76.76.21.21` (Vercel apex IP) | 3600 | TODO |
| CNAME | `www` | `cname.vercel-dns.com` | 3600 | TODO |
| TXT | `@` | Vercel verification token (from Vercel dashboard) | 3600 | TODO |
| CAA | `@` | `0 issue "letsencrypt.org"` | 3600 | TODO — locks cert issuer |
| MX | `@` | TBD (after email setup — section 8) | 3600 | TODO |
| TXT | `@` | SPF record (after email setup) | 3600 | TODO |

**Propagation check:** `dig gotradewind.com` and `dig www.gotradewind.com` — should resolve to Vercel within 1 hour.

---

## 4. SSL / HTTPS

| Item | Status |
|---|---|
| SSL via Vercel (Let's Encrypt, auto-renew) | AUTO |
| Force HTTPS redirect | AUTO (Vercel default) |
| HSTS header | TODO — add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` via `vercel.json` headers |
| Submit to HSTS preload list | OPTIONAL — only after HSTS verified stable for 30+ days |

---

## 5. WWW / NON-WWW REDIRECT POLICY

Decision: **Apex (`gotradewind.com`) is canonical.** All `www` traffic redirects via 308.

| Item | Status |
|---|---|
| Vercel primary = apex | TODO |
| Verify `curl -I https://www.gotradewind.com` returns 308 → apex | TODO post-setup |
| Verify all internal links use apex (no `www.` in code) | TODO — grep codebase before launch |

---

## 6. CANONICAL URLS

Every page must include:

```html
<link rel="canonical" href="https://gotradewind.com/[current-path]" />
```

| Item | Status |
|---|---|
| Verify canonical tag present in `index.html` / route layouts | TODO |
| Verify canonical points to apex (not `www`, not vercel.app) | TODO |
| Update OG tags to use apex URLs | TODO |

---

## 7. SITEMAP, ROBOTS, INDEXING

| Item | Status | Notes |
|---|---|---|
| `/sitemap.xml` served via edge function | LIVE (`sitemap` edge function exists) | Verify it lists active listings, key pages, excludes admin/auth routes |
| `/robots.txt` allows crawl of marketing + listings, blocks `/admin`, `/dashboard`, `/api` | TODO — verify file content | |
| Submit sitemap to Google Search Console | TODO post-domain-live | |
| Submit sitemap to Bing Webmaster Tools | TODO post-domain-live | |
| Add Google Search Console verification meta tag or DNS TXT | TODO | |
| Verify 0 indexability of demo listings if desired (or accept indexability with [DEMO] in title) | DECISION NEEDED | Recommendation: noindex demo listings until real inventory live |

---

## 8. EMAIL DOMAIN SETUP (Transactional)

For sending booking confirmations, beta invites, password resets, lead notifications.

| Item | Status | Recommended |
|---|---|---|
| Choose ESP | TODO | Resend (best DX), Postmark (transactional only), SendGrid |
| Verify domain at ESP | TODO | |
| Add SPF record (`v=spf1 include:_spf.[esp].com ~all`) | TODO | |
| Add DKIM record (provided by ESP) | TODO | |
| Add DMARC record (start with `p=none; rua=mailto:dmarc@gotradewind.com`) | TODO | Tighten to `p=quarantine` after 30 days clean reports |
| Configure `noreply@gotradewind.com`, `support@gotradewind.com`, `hello@gotradewind.com` | TODO | |
| Set up Google Workspace or Fastmail for actual mailboxes | TODO | |
| Update all hardcoded `morrisondon89@gmail.com` references to `support@` and `hello@` post-cutover | TODO — grep codebase | |

---

## 9. OPEN GRAPH & SOCIAL PREVIEWS

| Item | Status | Notes |
|---|---|---|
| OG image (1200x630) for homepage | TODO | Branded TradeWind splash |
| OG image template for listing pages (dynamic via `og-image` edge function) | LIVE | Verify rendering after domain switch |
| Twitter card meta tags (`twitter:card`, `twitter:image`, `twitter:title`) | TODO | |
| Test on `https://www.opengraph.xyz/` | TODO | |
| Test on Twitter Card Validator | TODO | |
| Test on LinkedIn Post Inspector (forces re-cache) | TODO | |
| Test on Facebook Sharing Debugger | TODO | |
| Test on iMessage / WhatsApp (manual paste) | TODO | |

---

## 10. FAVICON & APP ICONS

| Item | Status |
|---|---|
| `/favicon.ico` (multi-resolution) | TODO — verify present and high-quality |
| `/apple-touch-icon.png` (180x180) | TODO |
| `/icon-192.png`, `/icon-512.png` (PWA) | TODO |
| `manifest.json` with brand colors + icons | TODO |
| Verify favicon renders in Chrome, Safari, Firefox tabs | TODO |
| Verify Apple home-screen icon renders correctly | TODO |

---

## 11. SEO META PER PAGE

Minimum coverage:

| Page | Title | Meta Description | OG | Status |
|---|---|---|---|---|
| Home | "TradeWind — AI-Powered Marketplace for Boats, Autos, Aircraft" | 155-char value prop | YES | TODO verify |
| Browse Boats | "Browse Boats for Sale — TradeWind" | | YES | TODO |
| Browse Autos | "Exotic & Classic Autos — TradeWind" | | YES | TODO |
| Browse Aircraft | "Aircraft for Sale — TradeWind Brokerage" | | YES | TODO |
| Listing Detail | Dynamic: "[Year] [Make] [Model] — TradeWind" | Dynamic from listing | Dynamic via edge fn | LIVE |
| Sell / List | "Sell Your Boat / Auto / Aircraft — TradeWind" | | YES | TODO |
| For Dealers | "Dealer Tools — TradeWind" | | YES | TODO |
| For Service Providers | "Grow Your Marine / Auto / Aviation Service Business" | | YES | TODO |
| About | "About TradeWind" | | YES | TODO |
| Pricing | "Pricing — TradeWind" | | YES | TODO |

---

## 12. POST-CUTOVER VERIFICATION

After DNS resolves and SSL is issued, run:

- [ ] `curl -I https://gotradewind.com` → 200, valid cert
- [ ] `curl -I https://www.gotradewind.com` → 308 → apex
- [ ] `curl -I http://gotradewind.com` → 308 → https
- [ ] Lighthouse audit (Performance, SEO, Accessibility, Best Practices) — target 90+
- [ ] Verify Supabase auth still works (no CORS regressions)
- [ ] Verify Stripe checkout still works (return URLs updated to new domain)
- [ ] Verify all OG previews render with new URL
- [ ] Update Stripe webhook URL to new domain
- [ ] Update Supabase auth redirect URLs to include new domain
- [ ] Update all marketing/sales material to reference new domain

---

## 13. DOMAIN LAUNCH GO/NO-GO

Do not cut over until ALL of:

- [ ] All P0/P1 bugs clear (currently CLEAR per `GO_LIVE_CONTROL_CENTER.md`)
- [ ] DNS records added and propagated
- [ ] SSL issued and verified
- [ ] Email domain warmed (at least 7 days of low-volume sends)
- [ ] Stripe + Supabase auth redirects updated to new domain
- [ ] Owner has 24-hour window to monitor post-cutover

**Domain cutover is a one-time event. Schedule it for a low-traffic weekday morning. Owner stays at desk for 4 hours post-cutover to monitor.**
