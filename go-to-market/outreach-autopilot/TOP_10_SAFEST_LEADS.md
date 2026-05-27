# TradeWind 100 — Top 10 Safest Leads (Send-Ready Priority Queue)

**Prepared:** 2026-05-27
**Source:** `NEW_LEADS_VERIFICATION_REPORT.md` §7, post-audit
**Cleanup SQL:** `supabase/outreach-lead-cleanup.sql` (status='send_ready')
**Voice rules:** `HUMAN_VOICE_RULES.md`
**Compliance:** `COMPLIANCE_AND_OPT_OUT_RULES.md` (opt-out line is verbatim)
**From:** `Don Morrison <don@lifeofmorr.com>` (reply-to: same)

These 10 leads have the highest send confidence:
- Email published on the company's own live website (or directly confirmed via
  multi-source brand press / RocketReach for the three called-out leads).
- Named decision-maker confirmed via LinkedIn / press.
- Score 5/5, Priority 5/5.

**Send rules — current:** Outreach is paused until the May 29 follow-ups land.
Then 3/day from this list (May 30, June 1, June 2). Cap is enforced by
`AdminOutreach.tsx` daily cap indicator. No email sends without manual
approval on `/admin/outreach`.

---

## Schedule

| # | Send date | Company | Contact | Email |
|---|---|---|---|---|
| 1 | 2026-05-30 | Premier Aircraft Sales | Travis Peffer | sales@flypas.com |
| 2 | 2026-05-30 | Mente Group, LLC | Brian Proctor | brian@mentegroup.com |
| 3 | 2026-05-30 | Prestige Imports Miami | Brett David | bdavid@prestigeimports.com |
| 4 | 2026-06-01 | Van Bortel Aircraft, Inc. | Aircraft Sales Team | acsales@vanbortel.com |
| 5 | 2026-06-01 | Pollard Aircraft Sales, Inc. | Tim Pollard | sales@pollardaircraft.com |
| 6 | 2026-06-01 | Cutter Aviation Aircraft Sales | Annie Ritter (Sales Admin) | aircraftsales@cutteraviation.com |
| 7 | 2026-06-02 | Muncie Aviation Company | TBM Sales Team | sales@muncieaviation.com |
| 8 | 2026-06-02 | Burkard Yacht Sales | Chris Burkard | sales@burkardyachts.com |
| 9 | 2026-06-02 | Miami International Yacht Sales | Robert "Bob" Lama | bob@miamiys.com |
| 10 | 2026-06-03 | Streetside Classics - Charlotte | Bob Mueller | info@streetsideclassics.com |

(Also approved for May 30: rows 4-10 if Brett/Travis/Brian land cleanly and
the bounce window stays under 5%.)

---

## 1. Premier Aircraft Sales — Travis Peffer — 2026-05-30

- **Vertical:** aircraft_broker
- **Verification source:** company_website (flypas.com) + Diamond Aircraft press 2026-05-27
- **Caveat:** `@flypas.com` is brand-vs-website-domain mismatch (intentional)
- **Personalization angle:** Largest US Diamond dealer with 2,200+ sales, plus Cirrus / Cessna / Piper / Mooney / Beech / TBM / Pilatus / King Air across FL, TX, and MA
- **Subject:** routed buyers for the multi-make Diamond fleet
- **Backup channel:** RocketReach for direct Travis address; phone (954) 771-0411

```
Subject: routed buyers for the multi-make Diamond fleet

Hey Travis —

Largest US Diamond dealer with 2,200+ sales, plus Cirrus / Cessna / Piper / Mooney / Beech / TBM / Pilatus / King Air across FL, TX, and MA — that multi-make, multi-region depth is exactly the kind of broker I want on early.

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. For specialty brokers, the value is a curated buyer feed scoped to the type and avionics package you actually represent — not a flattened Controller / Trade-A-Plane listing.

Private beta. Free for 60 days. No fee until you see real lead flow.

Open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

---

## 2. Mente Group, LLC — Brian Proctor — 2026-05-30

- **Vertical:** aircraft_broker
- **Verification source:** company_website + 3p (LinkedIn, Bloomberg, Crunchbase, Aviation Week) 2026-05-27
- **Caveat:** `brian@mentegroup.com` is pattern-inferred from the main office domain — confirmed via multi-source LinkedIn/Bloomberg/Crunchbase/Aviation Week
- **Personalization angle:** $500M+/yr in business jets across Citation, Phenom, Challenger, Gulfstream — top-tier brokerage
- **Subject:** quick aircraft broker question
- **Backup channel:** LinkedIn /in/brian-proctor-b605393/; main office Dallas

```
Subject: quick aircraft broker question

Hey Brian —

Read through Mente this morning. $500M+/yr in business jets across Citation, Phenom, Challenger, Gulfstream — that kind of top-tier brokerage is what I want on the platform early, partnership-first, not a "list with us" pitch.

I am Don, building TradeWind, a marketplace that now includes aircraft (jets, helicopters, turbines). Brokers get a verified profile, AI-built listing copy, and inbound buyer requests routed to the kinds of aircraft you actually sell.

Private beta. Free for 60 days. No fee until you see real lead flow.

Would you be open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

---

## 3. Prestige Imports Miami — Brett David — 2026-05-30

- **Vertical:** exotic_dealer
- **Verification source:** company_website + 3p_db (RocketReach/ZoomInfo) 2026-05-27
- **Caveat:** `bdavid@` referenced by RocketReach/ZoomInfo but not posted on live contact page — if bounces, fall back to `sales@prestigeimports.com` (which IS published on the company site)
- **Personalization angle:** Took over as CEO at 19 after father Irv passed in 2007. Added Lamborghini, Pagani, Lotus, Karma Miami franchises. Founder-led, IG @brett_david.
- **Subject:** routed buyers for the showroom
- **Backup channel:** LinkedIn /in/brett-david-347b251b/; sales@prestigeimports.com; main 305-947-1000

```
Subject: routed buyers for the showroom

Hey Brett —

Brett, you took over as CEO at 19 after Irv passed in 2007 and added Lamborghini Miami, Pagani Miami, Lotus Miami and Karma Miami. That kind of multi-franchise founder-led operation is what I want on the platform early.

I am Don, building TradeWind, a marketplace for boats, exotic and classic cars, and aircraft. Founder-led showrooms get a verified profile, AI listing copy from your existing photos and notes, and inbound buyer requests routed to your actual stock.

Private beta. Free for 60 days. No fee until you see real lead flow.

Would you be open to a quick 10-minute look?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

---

## 4. Van Bortel Aircraft, Inc. — Aircraft Sales Team — 2026-06-01

- **Vertical:** aircraft_broker
- **Verification source:** company_website confirmed 2026-05-27 (vanbortel.com homepage)
- **Personalization angle:** Pre-owned Cessna single-engine focus with a 100% money-back guarantee
- **Subject:** routed buyers for your specialty
- **Backup channel:** Phone 585-396-4900 (Wayne Van Bortel, owner)

```
Subject: routed buyers for your specialty

Hey Van Bortel team —

Read through Van Bortel this morning. Pre-owned Cessna single-engine focus with a 100% money-back guarantee is the kind of buyer-trust signal I want on the platform early.

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. For specialty brokers, the value is a curated buyer feed scoped to the type and avionics package you actually represent — not a flattened Controller / Trade-A-Plane listing.

Private beta. Free for 60 days. No fee until you see real lead flow.

Open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

---

## 5. Pollard Aircraft Sales, Inc. — Tim Pollard — 2026-06-01

- **Vertical:** aircraft_broker
- **Verification source:** company_website confirmed 2026-05-26 (pollardaircraft.com)
- **Personalization angle:** King Air and Citation specialist since 1992 with 900+ transactions and the 888-KING-AIR line
- **Subject:** routed buyers for King Air / Citation
- **Backup channel:** Phone 1-888-KING-AIR

```
Subject: routed buyers for King Air / Citation

Hey Tim —

King Air and Citation specialist since 1992 with 900+ transactions and the 888-KING-AIR line — that kind of single-segment authority is what I want on the platform early.

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. For specialty brokers, the value is a curated buyer feed scoped to the type and avionics package you actually represent — not a flattened Controller / Trade-A-Plane listing.

Private beta. Free for 60 days. No fee until you see real lead flow.

Open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

---

## 6. Cutter Aviation Aircraft Sales — Annie Ritter (Sales Admin) — 2026-06-01

- **Vertical:** aircraft_broker
- **Verification source:** company_website confirmed 2026-05-26 (cutteraviation.com aircraft sales page)
- **Personalization angle:** Authorized Pilatus PC-12 / PC-24 and Piper M-class dealer for the Southwest, plus offices in TX, CO, NM
- **Subject:** routed buyers for Pilatus + Piper M-class
- **Backup channel:** Main 602-273-1237 (PHX HQ)

```
Subject: routed buyers for Pilatus + Piper M-class

Hey Cutter sales team —

Authorized Pilatus PC-12 / PC-24 and Piper M-class dealer for the Southwest, plus offices in TX, CO, NM — that multi-state authorized-dealer footprint is exactly what benefits from a regional buyer-routing layer.

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. For specialty brokers, the value is a curated buyer feed scoped to the type and avionics package you actually represent — not a flattened Controller / Trade-A-Plane listing.

Private beta. Free for 60 days. No fee until you see real lead flow.

Open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

---

## 7. Muncie Aviation Company — TBM Sales Team — 2026-06-02

- **Vertical:** aircraft_broker
- **Verification source:** company_website confirmed 2026-05-26 (muncieaviation.com)
- **Personalization angle:** Established 1932, world's oldest Piper dealer, authorized Daher TBM dealer (21 TBMs in 2025), employee-owned
- **Subject:** routed buyers for TBM / Piper
- **Backup channel:** Phone 765-289-7141

```
Subject: routed buyers for TBM / Piper

Hey Muncie TBM sales team —

Established 1932, world's oldest Piper dealer, authorized Daher TBM dealer (21 TBMs in 2025), and employee-owned — that kind of long-tenure authorized-dealer profile is exactly what I want on early.

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. For specialty brokers, the value is a curated buyer feed scoped to the type and avionics package you actually represent — not a flattened Controller / Trade-A-Plane listing.

Private beta. Free for 60 days. No fee until you see real lead flow.

Open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

---

## 8. Burkard Yacht Sales — Chris Burkard — 2026-06-02

- **Vertical:** yacht_broker
- **Verification source:** company_website confirmed 2026-05-27 (burkardyachts.com homepage + footer; cburkard@ also published)
- **Personalization angle:** 25+ years marine + CPYB + 100 ft+ vessel focus
- **Subject:** routed buyers for the larger boats
- **Backup channel:** cburkard@burkardyachts.com (direct on site footer)

```
Subject: routed buyers for the larger boats

Hey Chris —

Chris, 25+ years marine + CPYB + 100 ft+ vessel focus is exactly the credentialed-large-vessel profile my early buyers ask for.

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. For brokers working the larger vessels, a curated buyer-request channel gets you in front of in-market buyers without the noise of generic aggregators.

Private beta. Free for 60 days. No fee until you see real lead flow.

Open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

---

## 9. Miami International Yacht Sales — Robert "Bob" Lama — 2026-06-02

- **Vertical:** yacht_broker
- **Verification source:** company_website confirmed 2026-05-27 (miamiinternationalyachtsales.com homepage)
- **Personalization angle:** Commercial-real-estate approach applied to the 100-250 ft superyacht class
- **Subject:** routed buyers for the larger boats

```
Subject: routed buyers for the larger boats

Hey Bob —

Bob, the commercial-real-estate approach applied to the 100-250 ft superyacht class is exactly the kind of professional-discipline broker my early HNW buyers ask for.

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. For brokers working the larger vessels, a curated buyer-request channel gets you in front of in-market buyers without the noise of generic aggregators.

Private beta. Free for 60 days. No fee until you see real lead flow.

Open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

---

## 10. Streetside Classics - Charlotte — Bob Mueller — 2026-06-03

- **Vertical:** classic_dealer
- **Verification source:** company_website 2026-05-26 (streetsideclassics.com)
- **Personalization angle:** Six showrooms (Charlotte, Atlanta, DFW, Nashville, Phoenix, Tampa), #1 US classic dealer by volume
- **Subject:** a routed feed for streetside classics

```
Subject: a routed feed for streetside classics

Hey Bob —

Six showrooms (Charlotte, Atlanta, DFW, Nashville, Phoenix, Tampa) and the #1 US classic dealer by volume — multi-location chains are exactly who benefit from a single verified profile across showrooms.

I am Don, building TradeWind, a marketplace for boats, classic and exotic cars, and aircraft. Multi-location dealers get one verified profile that spans showrooms, AI listing copy from your existing photos, and inbound buyer requests routed to the showroom that holds the inventory.

Private beta. Free for 60 days. No fee until you see real lead flow.

Would you be open to a quick 10-minute look?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

---

## Send-day checklist (per email)

1. Confirm verification status is `likely_valid` on `/admin/outreach`.
2. Confirm row's `do_not_contact = false`.
3. Confirm today's sent count is below the campaign daily cap.
4. Open Gmail compose as `Don Morrison <don@lifeofmorr.com>`.
5. Paste subject + body from this file exactly.
6. Hit Send.
7. On the dashboard: click "Mark sent" → schedule FU1 for +3 days.
8. If bounce: row auto-flips to `bounced`; switch to fallback channel above.
