# Custom Domain Launch Plan: gotradewind.com

**Current live URL:** https://tradewind-marketplace.vercel.app
**Target domain:** gotradewind.com
**Hosting:** Vercel
**Date created:** 2026-06-03

---

## 1. Domain Setup — Connect gotradewind.com to Vercel

### Steps

1. **Add domain in Vercel Dashboard**
   - Go to Project Settings > Domains
   - Add `gotradewind.com` and `www.gotradewind.com`
   - Vercel will provide the required DNS records

2. **Update DNS records at your registrar**
   - For apex domain (`gotradewind.com`): Add an **A record** pointing to `76.76.21.21`
   - For `www` subdomain: Add a **CNAME record** pointing to `cname.vercel-dns.com`
   - Set TTL to 300 (5 minutes) during migration, increase to 3600+ once verified

3. **Verify propagation**
   - Use `dig gotradewind.com` or https://dnschecker.org to confirm records have propagated
   - Vercel dashboard will show a green checkmark once verified
   - Propagation typically takes 5-30 minutes, can take up to 48 hours

### Already Done

- [x] `vercel.json` is clean with security headers and SPA rewrites configured
- [x] Domain name selected (`gotradewind.com` per `brand.ts`)

### Needs Manual Setup

- [ ] Add domain in Vercel Dashboard
- [ ] Configure DNS records at registrar
- [ ] Verify propagation
- [ ] Set redirect preference (www vs non-www) in Vercel Dashboard

---

## 2. SSL / HTTPS

Vercel auto-provisions SSL certificates via Let's Encrypt. No manual action is needed beyond completing domain verification in step 1.

### Already Done

- [x] HSTS header configured: `max-age=63072000; includeSubDomains; preload`
- [x] SSL will be auto-provisioned once domain is verified

### Needs Manual Setup

- [ ] Confirm certificate is active after domain verification (check browser padlock)
- [ ] Consider submitting to the [HSTS Preload List](https://hstspreload.org/) after launch

---

## 3. Canonical URL

Prevent duplicate indexing between `tradewind-marketplace.vercel.app` and `gotradewind.com`.

### Action Items

- [ ] Add canonical meta tag to `index.html` or via `src/lib/seo.ts`:
  ```html
  <link rel="canonical" href="https://gotradewind.com/" />
  ```
- [ ] Update `src/lib/seo.ts` `setMeta()` to dynamically set canonical URLs using `gotradewind.com` as the base
- [ ] Ensure every page generates a correct canonical URL (not just the homepage)
- [ ] In Vercel Dashboard, set `tradewind-marketplace.vercel.app` to redirect (308) to `gotradewind.com`

---

## 4. Sitemap

### Already Done

- [x] `vercel.json` rewrites `/sitemap.xml` to Supabase Edge Function

### Needs Manual Setup

- [ ] Update the Supabase Edge Function to return `gotradewind.com` as the domain in all `<loc>` URLs
- [ ] Verify sitemap is accessible at `https://gotradewind.com/sitemap.xml` after domain switch
- [ ] Validate sitemap format at https://www.xml-sitemaps.com/validate-xml-sitemap.html
- [ ] Submit sitemap to Google Search Console

---

## 5. robots.txt

Currently no `robots.txt` exists in the project.

### Action Items

- [ ] Create `public/robots.txt` with the following content:

```
User-agent: *
Allow: /

Sitemap: https://gotradewind.com/sitemap.xml
```

- [ ] Verify it is accessible at `https://gotradewind.com/robots.txt` after deployment
- [ ] If staging/preview environments exist, block them separately (Vercel automatically adds `X-Robots-Tag: noindex` to preview deployments)

---

## 6. OG Image

Open Graph image for social sharing previews (LinkedIn, Twitter/X, Facebook, iMessage, Slack, etc.).

### Action Items

- [ ] Create a branded OG image at `public/og-image.png`
  - Dimensions: **1200 x 630 px** (standard OG image size)
  - Include TradeWind logo, tagline, and brand colors
  - Keep text large and readable at small preview sizes
  - File size: aim for under 300 KB
- [ ] Add meta tag in `index.html` or via `src/lib/seo.ts`:
  ```html
  <meta property="og:image" content="https://gotradewind.com/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="TradeWind Marketplace" />
  ```
- [ ] Also add Twitter-specific image tag:
  ```html
  <meta name="twitter:image" content="https://gotradewind.com/og-image.png" />
  ```
- [ ] Test previews using:
  - https://developers.facebook.com/tools/debug/
  - https://cards-dev.twitter.com/validator
  - https://www.opengraph.xyz/

---

## 7. Favicon

Verify a complete favicon set exists in the `public/` directory.

### Required Files

- [ ] `public/favicon.ico` — Standard favicon (16x16 and 32x32 embedded)
- [ ] `public/favicon-16x16.png` — 16x16 PNG
- [ ] `public/favicon-32x32.png` — 32x32 PNG
- [ ] `public/apple-touch-icon.png` — 180x180 PNG for iOS home screen
- [ ] `public/android-chrome-192x192.png` — 192x192 PNG for Android (optional)
- [ ] `public/android-chrome-512x512.png` — 512x512 PNG for Android splash (optional)
- [ ] `public/site.webmanifest` — Web app manifest referencing icons (optional)

### Action Items

- [ ] Generate favicon set from the TradeWind logo using https://realfavicongenerator.net/
- [ ] Add link tags to `index.html`:
  ```html
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  ```

---

## 8. SEO Meta Tags

The project uses `src/lib/seo.ts` with `setMeta()` for managing meta tags.

### Verify These Default Tags Are Set

- [ ] `<title>` — Descriptive, under 60 characters
- [ ] `<meta name="description">` — Compelling summary, 150-160 characters
- [ ] `<meta property="og:type" content="website" />`
- [ ] `<meta property="og:site_name" content="TradeWind Marketplace" />`
- [ ] `<meta property="og:title">` — Matches or complements page title
- [ ] `<meta property="og:description">` — Matches or complements meta description
- [ ] `<meta property="og:url">` — Full canonical URL of the page
- [ ] `<meta name="twitter:card" content="summary_large_image" />`
- [ ] `<meta name="twitter:title">` — Page title
- [ ] `<meta name="twitter:description">` — Page description

### Action Items

- [ ] Audit `src/lib/seo.ts` to confirm all tags above are present
- [ ] Update any hardcoded `tradewind-marketplace.vercel.app` URLs to `gotradewind.com`
- [ ] Ensure dynamic pages (listings, profiles) generate unique title/description tags
- [ ] Add structured data (JSON-LD) for rich search results if not already present

---

## 9. Email Domain

Set up professional email on `gotradewind.com` to replace interim addresses.

### Current State

- Interim support email: `don@lifeofmorr.com`

### Target Addresses

- `support@gotradewind.com` — Customer support
- `hello@gotradewind.com` — General inquiries

### DNS Records to Add

- [ ] **SPF** — TXT record:
  ```
  v=spf1 include:<email-provider-spf> ~all
  ```
  (Replace `<email-provider-spf>` with your provider's SPF domain, e.g., `_spf.google.com` for Google Workspace)

- [ ] **DKIM** — TXT record provided by your email provider (provider-specific)

- [ ] **DMARC** — TXT record at `_dmarc.gotradewind.com`:
  ```
  v=DMARC1; p=quarantine; rua=mailto:dmarc@gotradewind.com; pct=100
  ```

### Action Items

- [ ] Choose email provider (Google Workspace, Fastmail, Zoho, etc.)
- [ ] Configure mailboxes for `support@` and `hello@`
- [ ] Add SPF, DKIM, and DMARC DNS records
- [ ] Update support email references in the codebase (search for `don@lifeofmorr.com`)
- [ ] Set up email forwarding during transition period
- [ ] Update any third-party services (Supabase, Vercel, etc.) to use new email

---

## Pre-Launch Checklist

Complete these before pointing DNS to Vercel:

- [ ] OG image created and placed at `public/og-image.png`
- [ ] Favicon set generated and placed in `public/`
- [ ] `robots.txt` created in `public/`
- [ ] Canonical URL logic added to `src/lib/seo.ts`
- [ ] All SEO meta tags verified in `src/lib/seo.ts`
- [ ] Sitemap edge function updated with `gotradewind.com` domain
- [ ] All hardcoded `tradewind-marketplace.vercel.app` URLs replaced with `gotradewind.com`
- [ ] Search codebase for any other hardcoded URLs that need updating
- [ ] Deploy all code changes to production
- [ ] Verify everything works on `tradewind-marketplace.vercel.app` before DNS switch

---

## Post-Launch Checklist

Complete these after DNS is live and SSL is active:

- [ ] Verify `https://gotradewind.com` loads correctly
- [ ] Verify `https://www.gotradewind.com` redirects to `https://gotradewind.com` (or vice versa)
- [ ] Verify `tradewind-marketplace.vercel.app` redirects to `gotradewind.com`
- [ ] Verify SSL certificate is active (browser padlock icon)
- [ ] Verify `https://gotradewind.com/sitemap.xml` returns correct content
- [ ] Verify `https://gotradewind.com/robots.txt` is accessible
- [ ] Test social sharing preview on Facebook, Twitter/X, LinkedIn
- [ ] Set up Google Search Console for `gotradewind.com`
- [ ] Submit sitemap in Google Search Console
- [ ] Set up Google Analytics / Plausible / preferred analytics for the new domain
- [ ] Verify all outreach and marketing links still work (or update them)
- [ ] Update any external listings, directories, or profiles with the new URL
- [ ] Update email signatures, social media bios, and marketing materials
- [ ] Verify email deliverability with SPF/DKIM/DMARC (use https://mxtoolbox.com/)
- [ ] Monitor 404 errors and set up redirects for any broken paths
- [ ] Increase DNS TTL to 3600+ once everything is confirmed stable
- [ ] Submit domain to HSTS Preload List after confirming stability

---

## Timeline Estimate

| Phase | Tasks | Duration |
|-------|-------|----------|
| **Prep** | OG image, favicons, robots.txt, code updates | 1-2 days |
| **DNS** | Add domain in Vercel, configure DNS records | 30 minutes + propagation |
| **Verify** | SSL, redirects, sitemap, social previews | 1-2 hours |
| **Email** | Provider setup, DNS records, mailbox config | 1-2 hours |
| **Monitor** | Watch for issues, fix broken links, analytics | 1 week |
