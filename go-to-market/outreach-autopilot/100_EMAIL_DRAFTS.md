# TradeWind 100 — Personalized Email Drafts

100 cold-email drafts for the TradeWind 100 campaign, plus LinkedIn DM
and website-contact-form variants for every lead where the email is
unverified. All drafts follow `HUMAN_VOICE_RULES.md` and pass the
`checkMessageQuality()` AI-risk thresholds.

Owner: Don Morrison · From: `Don Morrison <don@lifeofmorr.com>` · Reply-to: same.
Status: **drafts only — nothing sends without manual approval on /admin/outreach.**
Prepared: 2026-05-26.

---

## 0. Voice rules recap

- Short sentences. Plain English.
- One specific observation per message (drawn from `personalization_angle`).
- Honest beta language: "I am building", "private beta".
- One small ask: the default CTA.
- Opt-out line, verbatim:
  > If this is not relevant, no worries — just tell me and I will not follow up.
- Sign-off: `— Don\nTradeWind` (email); `— Don` (LinkedIn / IG).

Default CTA (used unless vertical template overrides):
> Would you be open to a quick 10-minute look and giving honest feedback?

---

## 1. Vertical templates

Each vertical has **two to three** body-template variants. The 100
specific emails in §2 each cite which template variant they use, plus the
interpolated personalization angle.

### 1.1 boat_dealer

**Variant A — "took a look at your inventory"**

```
Subject: your inventory at {company_lc}

Hey {first_name} —

{personalization_angle}

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. Dealers get a clean profile, AI-built listing descriptions from your photos and notes, and a feed of buyer requests filtered to your inventory.

Private beta. Free for 60 days. No fee until you see real lead flow.

Would you be open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

**Variant B — "lake / waterbody"**

```
Subject: a feed for {waterbody} buyers

Hey {first_name} —

{personalization_angle}

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. Dealers like yours get a verified profile, AI-built listing copy from existing photos, and a feed of buyer requests scoped to the lake / waterbody you actually serve.

Private beta. Free for 60 days. No fee until you see real lead flow.

Would you be open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

### 1.2 yacht_broker

**Variant A — "quick note"**

```
Subject: quick note for {company_lc}

Hey {first_name} —

{personalization_angle}

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. Brokers get a verified profile, AI-built listing copy, and inbound buyer requests routed to the kind of boats you actually carry.

Private beta. Free for 60 days. No fee until you see real lead flow.

Would you be open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

**Variant B — "boutique brokerage"**

```
Subject: a routed feed for your listings

Hey {first_name} —

{personalization_angle}

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. Boutique brokerages get a verified profile, AI listing copy from existing photos and notes, and a feed of buyer requests filtered to the kind of vessels you actually represent.

Private beta. Free for 60 days. No fee until you see real lead flow.

Would you be open to a quick 10-minute look?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

**Variant C — "superyacht / large vessel"**

```
Subject: routed buyers for the larger boats

Hey {first_name} —

{personalization_angle}

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. For brokers working the larger vessels, a curated buyer-request channel gets you in front of in-market buyers without the noise of generic aggregators.

Private beta. Free for 60 days. No fee until you see real lead flow.

Open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

### 1.3 exotic_dealer

**Variant A — "your exotic inventory"**

```
Subject: your exotic inventory

Hey {first_name} —

{personalization_angle}

I am Don, building TradeWind, a marketplace for boats, exotic and classic cars, and aircraft. Dealers get a verified profile, AI-built listing copy, and serious buyer inquiries routed to their actual stock.

Private beta. Free for 60 days. No fee until you see real lead flow.

Would you be open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

**Variant B — "founder-led showroom"**

```
Subject: routed buyers for the showroom

Hey {first_name} —

{personalization_angle}

I am Don, building TradeWind, a marketplace for boats, exotic and classic cars, and aircraft. Founder-led showrooms get a verified profile, AI listing copy from your existing photos and notes, and inbound buyer requests routed to your actual stock.

Private beta. Free for 60 days. No fee until you see real lead flow.

Would you be open to a quick 10-minute look?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

### 1.4 classic_dealer

**Variant A — "your classic inventory"**

```
Subject: your classic inventory

Hey {first_name} —

{personalization_angle}

I am Don, building TradeWind, a marketplace for boats, classic and exotic cars, and aircraft. Dealers get a verified profile, AI-built listing copy from your existing photos and notes, and inbound buyer requests routed to your inventory.

Private beta. Free for 60 days. No fee until you see real lead flow.

Would you be open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

**Variant B — "multi-location chain"**

```
Subject: a routed buyer feed across your showrooms

Hey {first_name} —

{personalization_angle}

I am Don, building TradeWind, a marketplace for boats, classic and exotic cars, and aircraft. Multi-location classic dealers get a single verified profile across showrooms, AI-built listing copy, and inbound buyer requests routed to the location that fits best.

Private beta. Free for 60 days. No fee until you see real lead flow.

Would you be open to a quick 10-minute look?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

### 1.5 aircraft_broker

**Variant A — "quick aircraft broker question"**

```
Subject: quick aircraft broker question

Hey {first_name} —

{personalization_angle}

I am Don, building TradeWind, a marketplace that now includes aircraft (jets, helicopters, turbines). Brokers get a verified profile, AI-built listing copy, and inbound buyer requests routed to the kinds of aircraft you actually sell.

Private beta. Free for 60 days. No fee until you see real lead flow.

Would you be open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

**Variant B — "specialty / single-make"**

```
Subject: routed buyers for {specialty}

Hey {first_name} —

{personalization_angle}

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. For specialty brokers, the value is a curated buyer feed scoped to the type and avionics package you actually represent — not a flattened Controller / Trade-A-Plane listing.

Private beta. Free for 60 days. No fee until you see real lead flow.

Open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

### 1.6 marine_surveyor

**Variant A — "buyers asking who to trust"**

```
Subject: buyers asking who to trust for surveys

Hey {first_name} —

{personalization_angle}

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. Right now buyers find us through search, then they immediately ask "who can I trust to survey this." I want surveyors like you on the network so I can route those requests instead of telling people to search around.

Free profile during beta, free routed leads, no fee until you see real volume.

Would you be open to a quick 10-minute call to walk through how this would look?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

### 1.7 transport

**Variant A — "buyers asking about transport"**

```
Subject: buyers asking about transport

Hey {first_name} —

{personalization_angle}

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. Buyers and sellers on the platform constantly need transport, and right now I have nobody honest to route them to. I would rather have a small bench of good partners than a directory.

Free partner profile during beta, free routed leads, no fee until real volume.

Would you be open to a quick 10-minute call to walk through how this would look?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

### 1.8 lender

**Variant A — "marketplace buyers needing financing"**

```
Subject: marketplace buyers needing financing

Hey {first_name} —

{personalization_angle}

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. Buyers on the platform routinely ask "who finances this" and right now I just hand them a Google result. I would rather route them to a partner I trust.

Free partner profile during beta, no fee until real deal flow.

Open to a quick 10-minute call to see if a partner setup makes sense?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

### 1.9 insurance

**Variant A — "marketplace buyers asking about coverage"**

```
Subject: marketplace buyers asking about coverage

Hey {first_name} —

{personalization_angle}

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. Every closed deal triggers a "who do I use for coverage" question, and right now I do not have a real answer. I want a small set of partners I trust.

Free partner profile during beta, free routed leads, no fee until real volume.

Open to a quick 10-minute call to see if this makes sense for you?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

### 1.10 escrow_title

**Variant A — "deals needing escrow and title"**

```
Subject: marketplace deals needing escrow and title

Hey {first_name} —

{personalization_angle}

I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. Buyers close on big-ticket assets and immediately need escrow and clean title handling. I do not want to wing that part. I want a partner on the platform.

Free partner profile during beta, no fee until real deal flow.

Open to a quick 10-minute call to see if this makes sense?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

### 1.11 ap_mechanic

**Variant A — "aircraft owners looking for shops"**

```
Subject: aircraft owners looking for shops

Hey {first_name} —

{personalization_angle}

I am Don, building TradeWind, a marketplace for aircraft buyers and owners. Buyers close on a plane and immediately ask "who can I trust to inspect or maintain this." I want shops like yours on the network so I can route those requests instead of telling people to Google.

Free profile during beta, free routed leads, no fee until you see real volume.

Worth a quick call to walk through how this would look?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

---

## 2. Per-lead drafts (100)

Each entry shows: company · contact · template variant. The body is the
template above with `{personalization_angle}` replaced by the
lead-specific observation from `outreach_leads.personalization_angle`.

### 2.1 Exotic / Classic / Performance Auto (15)

**E1. Marshall Goldman Motor Sales — Harlan Goldman — Variant B (founder-led)**
Personalization: *Second-generation family business (founded 1978 by your father, now run by you) — $1B+ in pre-owned exotic sales last decade across Cleveland, Beverly Hills, Newport Beach, and Jessup MD. Multi-location ops are exactly the kind of profile I want on early.*

**E2. Prestige Imports Miami — Brett David — Variant B (founder-led)**
Personalization: *Brett, you took over as CEO at 19 after Irv passed in 2007 and added Lamborghini Miami, Pagani Miami, Lotus Miami and Karma Miami. That kind of multi-franchise founder-led operation is what I want on the platform early.*

**E3. Tactical Fleet — Christopher Barta — Variant A (your exotic inventory)**
Personalization: *Walked your inventory online this morning. 300+ exotics out of the Dallas showroom and the largest pre-owned exotic dealer by stock — that mix is the kind of inventory I want on the platform early.*

**E4. MotorCars of Atlanta — Jorge Galvez — Variant A (your exotic inventory)**
Personalization: *Spent some time on the MotorCars of Atlanta site this morning. The Aston Martin / McLaren / Lamborghini / Lotus / Koenigsegg / Rolls-Royce mix under one Buckhead roof is the kind of inventory I want on the platform early.*

**E5. Fusion Luxury Motors — Yoel Wazana — Variant B (founder-led)**
Personalization: *72,000 sq ft in Chatsworth mixing hypercars, vintage muscle, and the official Eleanor Mustang continuation builds — that cross-segment mix is exactly the kind of dealer I want on early.*

**E6. RK Motors Charlotte — Rob Kauffman — Variant A (classic inventory)**
Personalization: *Read through the inventory at RK Motors Charlotte. 250+ classics and the kind of provenance pages you do for the muscle cars — that is the kind of listing I want on the platform early.*

**E7. Streetside Classics - Charlotte — Bob Mueller — Variant B (multi-location)**
Personalization: *Six showrooms (Charlotte, Atlanta, DFW, Nashville, Phoenix, Tampa) and the #1 US classic dealer by volume — multi-location chains are exactly who benefit from a single verified profile across showrooms.*

**E8. Vanguard Motor Sales — Tom Photsios — Variant A (classic inventory)**
Personalization: *Spent some time on Vanguard. 80,000 sq ft of hand-picked (not consignment) muscle and hot rods in Plymouth — that pure-inventory model is what I want on the platform early.*

**E9. GR Auto Gallery — Chris Hoexum — Variant B (multi-location)**
Personalization: *Four locations (Grand Rapids, metro Detroit, Traverse City, Indianapolis), 1,000+ vehicles/yr, both inventory and consignment — that dual model is exactly the kind of dealer I want on early.*

**E10. Motorcar Studio — Nick Huston — Variant A (classic inventory)**
Personalization: *Read through the "significant cars" pages at Motorcar Studio — vintage sports and vintage 4x4s sold to international buyers, founders personally handling each consignment. That is the kind of listing I want on the platform early.*

**E11. Park Place LTD — David Bingham — Variant B (founder-led)**
Personalization: *Park Place LTD has been family-owned since 1987 and the Aston Martin / Lotus franchises in Bellevue make you the PNW exotic hub. That kind of family-owned franchise is exactly the kind of dealer I want on early.*

**E12. Cars Dawydiak — Walter Dawydiak — Variant B (founder-led)**
Personalization: *Founded 1981, SF Bay Area #1 Porsche specialist, and the renovated Pine Street showroom is impressive. That single-marque founder operation is what I want on the platform early.*

**E13. Canepa — Bruce Canepa — Variant B (founder-led)**
Personalization: *Canepa's work on the 959 (federalizing them for US import, then building the 959 SC upgrade) is the kind of authority I want on the platform — a single Canepa profile says more to my early buyers than 50 generic dealer pages.*

**E14. DriverSource Fine Motorcars — Jose Romero — Variant A (exotic inventory)**
Personalization: *Read through DriverSource and The Vault setup. Classic European collector cars (Porsche emphasis) plus climate-controlled storage is exactly the kind of bundle that fits how my buyers actually think about ownership.*

**E15. Beverly Hills Car Club — Alex Manos — Variant A (exotic inventory)**
Personalization: *140,000 sq ft and 450+ European classics (Porsche / Mercedes SL / Alfa / Jaguar / Ferrari) — that scale of European-classic depth is exactly the kind of inventory I want on the platform early.*

### 2.2 Aircraft Brokers (15)

**A1. Premier Aircraft Sales — Travis Peffer — Variant B (specialty / multi-make)**
Personalization: *Largest US Diamond dealer with 2,200+ sales, plus Cirrus / Cessna / Piper / Mooney / Beech / TBM / Pilatus / King Air across FL, TX, and MA — that multi-make, multi-region depth is exactly the kind of broker I want on early.*

**A2. Aerista — Chris Eichman — Variant B (specialty)**
Personalization: *Read through Aerista this morning. Former Cirrus Sales Director, now spanning Cirrus SR, PC-12, Vision Jet, Phenom, Diamond — that kind of Cirrus-rooted authority is what I want on the platform early.*

**A3. Van Bortel Aircraft — Aircraft Sales — Variant B (specialty)**
Personalization: *Read through Van Bortel this morning. Pre-owned Cessna single-engine focus with a 100% money-back guarantee is the kind of buyer-trust signal I want on the platform early.*

**A4. High Performance Aviation — Brandon Ray — Variant A (general)**
Personalization: *Brandon, 6-time Master CFI plus a multi-make brokerage out of Conroe — that pilot-led broker profile is the kind of voice my buyers ask for when they ask "who do I trust" on a piston buy.*

**A5. NexGA Aircraft — William Byrd — Variant B (specialty)**
Personalization: *Read NexGA this morning. Late-model Cirrus SR / TTx / Corvalis / Cessna focus out of PTI — that next-gen single-engine niche is exactly the kind of broker I want on the platform early.*

**A6. Pollard Aircraft Sales — Tim Pollard — Variant B (specialty)**
Personalization: *King Air and Citation specialist since 1992 with 900+ transactions and the 888-KING-AIR line — that kind of single-segment authority is what I want on the platform early.*

**A7. Cutter Aviation Aircraft Sales — Aircraft Sales — Variant B (specialty)**
Personalization: *Authorized Pilatus PC-12 / PC-24 and Piper M-class dealer for the Southwest, plus offices in TX, CO, NM — that multi-state authorized-dealer footprint is exactly what benefits from a regional buyer-routing layer.*

**A8. Finnoff Aviation — Chris Finnoff — Variant B (specialty)**
Personalization: *Chris, exclusive-listing PC-12 brokerage plus the Blackhawk XP67A upgrade work — that niche-make authority is what I want on the platform early.*

**A9. Muncie Aviation Company — TBM Sales — Variant B (specialty)**
Personalization: *Established 1932, world's oldest Piper dealer, authorized Daher TBM dealer (21 TBMs in 2025), and employee-owned — that kind of long-tenure authorized-dealer profile is exactly what I want on early.*

**A10. TBM Central — David Crockett — Variant B (specialty)**
Personalization: *Authorized Daher TBM 910/960 distributor for the South Central US — that single-make distributor focus is exactly what benefits from a marketplace channel scoped to type rating and transition stage.*

**A11. Mente Group — Brian Proctor — Variant A (general)**
Personalization: *Read through Mente this morning. $500M+/yr in business jets across Citation, Phenom, Challenger, Gulfstream — that kind of top-tier brokerage is what I want on the platform early, partnership-first, not a "list with us" pitch.*

**A12. OGARAJETS — Johnny Foster — Variant A (general)**
Personalization: *IADA-accredited, $8B+ across 50 countries since 1980, and the Citation / Phenom / Pilatus focus puts you squarely in the buyer pool I am bringing on. That kind of IADA-accredited shop is exactly what I want on early.*

**A13. Jeteffect — Charley Lloyd — Variant A (general)**
Personalization: *Decades-long business jet brokerage with the Palm Beach base for the FL / Caribbean owner pool — that geographic fit is exactly what my early buyer cohort asks for.*

**A14. Avpro — Aircraft Sales — Variant A (general)**
Personalization: *One of the world's largest business-jet brokerages with 60-100 transactions a year, commission-only, Annapolis-based — that kind of commission-first profile is exactly what benefits from a partnership routing layer.*

**A15. Banyan Air Service Aircraft Sales — Michael O'Keeffe — Variant A (general)**
Personalization: *Southeast HondaJet authorized sales & service center plus King Air / Citation / Phenom brokerage out of FXE — bundled FBO + sales is exactly the kind of profile I want on the platform early.*

### 2.3 Marine Surveyors (10)

All use **§1.6 Variant A — "buyers asking who to trust for surveys"**.

**S1. Bill Potter Marine Surveys — Bill Potter**
Personalization: *Found you while looking for SAMS surveyors in Miami I would actually route buyers to. 30+ years on center consoles, outboards, and sport fish convertibles matches exactly what my buyers are closing on.*

**S2. Florida Marine Surveyors — Ian Morris**
Personalization: *Found you while looking for SAMS AMS surveyors in Fort Lauderdale I would actually route buyers to.*

**S3. Associated Marine Consultants — Carl McCann**
Personalization: *Found you while looking for SAMS surveyors covering Naples and SW Florida Gulf Coast — exactly the seasonal HNW corridor I am bringing buyers on for.*

**S4. Gladding Marine Survey — Bill Gladding**
Personalization: *Found you while looking for SAMS surveyors covering Brunswick GA down through Daytona Beach — that cross-state coverage is exactly what my SE buyers ask for.*

**S5. CHS Marine Survey — Nick Lombardi**
Personalization: *Found you while looking for NAMS CMS surveyors in Charleston Lowcountry I would actually route buyers to.*

**S6. Wainui Marine Surveying — Tony Fergusson**
Personalization: *Found you while looking for surveyors covering Savannah / Hilton Head / Beaufort / Jacksonville / Charleston with large-yacht expertise — that combination is rare on the SE corridor.*

**S7. Lone Star Marine Surveyors — David Ghidoni**
Personalization: *Found you while looking for surveyors covering Galveston Bay / Clear Lake / Kemah with dual SAMS AMS + NAMS CMS credentials — that combination is rare and exactly what my TX buyers ask for.*

**S8. Port City Marine Surveyors — DJ Smith**
Personalization: *Found you while looking for SAMS surveyors covering Mobile, Orange Beach, and Biloxi — your thermal imaging and ultrasonic hull thickness specialty is exactly what my Gulf Coast buyers are asking for.*

**S9. R.V. Marine Surveying — Reinier Van Der Herp**
Personalization: *Found you while looking for dual-credentialed SAMS AMS + NAMS CMS surveyors covering Barnegat Bay, Atlantic City, and the NY Harbor approach — that NJ coverage is exactly what my NE buyers ask for.*

**S10. Atlantic Marine Survey — Barnaby Blatch**
Personalization: *Found you while looking for dual-credentialed SAMS AMS + NAMS CMS surveyors covering CT, RI, eastern NY, and southern MA — sailboat-heavy New England is exactly the corridor I want covered.*

### 2.4 Aviation A&P / Service (10)

All use **§1.11 Variant A — "aircraft owners looking for shops"**.

**M1. Banyan Air Service (Maintenance) — Danny Santiago**
Personalization: *Found you while looking for shops at FXE I would actually route owners to. Onsite turbine maintenance plus multiple Part 145 capabilities is exactly the depth my buyers ask for after a light / mid jet or turboprop close.*

**M2. Naples Jet Center — Dave Stetson**
Personalization: *Found you while looking for shops at KAPF. Embraer Phenom 100/300 authorized SC, Twin Commander SC, Garmin dealer, Part 145 — that authorized coverage is exactly what my Naples buyers ask for after a close.*

**M3. Cutter Aviation Phoenix — Travis Schleusner**
Personalization: *Saw your appointment as GM of the Phoenix MRO facility. Citation / King Air / TBM authorized across PHX, ADS, SAT, APA, BJC, PRC is the kind of multi-state coverage my early buyers ask for.*

**M4. Cutter Aviation Addison — Christopher Gradisar**
Personalization: *Found you while looking for TBM Authorized Support Centers in DFW. The TBM 700-940 coverage at KADS is exactly what my high-end single-engine turboprop buyers ask for after a close.*

**M5. Stevens Aerospace Denver — MRO Sales**
Personalization: *Found you while looking for Part 145 jet/turboprop MROs at KAPA. The light-to-midsize jet focus plus the Mayo Aviation partnership is exactly the kind of Rocky Mountain coverage my buyers ask for.*

**M6. Haggan Aviation — Geno Haggan**
Personalization: *Geno, owner-operator FAA Part 145 since 1996 in a 40,000 sq ft hangar at KAPA with Citation / Learjet / Falcon focus, plus Garmin and Starlink authorized — that kind of founder-led shop is exactly the kind of partner I want on early.*

**M7. Aero Center Atlanta — Scott Ordway**
Personalization: *Found you while looking for FBO+MRO shops at KPDK. The legacy Epps Aviation operation since 1965 at Atlanta's busiest GA airport is exactly the kind of depth my buyers ask for after a corporate fleet close.*

**M8. James Spearman Aircraft — James Spearman**
Personalization: *Found you while looking for piston A&P / IA shops in East TN. Owner-operator with the MTSU aerospace mgmt background and ANG pilot experience is exactly the kind of pilot-credible shop my buyers ask for.*

**M9. Carolina Aviation Technical Services — Peter Sistare**
Personalization: *Found you while looking for piston / turboprop FAA Part 145 shops in NC. The Cessna / Beechcraft / Dornier focus at KSVH is exactly the kind of coverage my NC buyers ask for.*

**M10. Clear Star Aviation — Service Desk**
Personalization: *Found you while looking for Cirrus authorized service in the DFW. Platinum Partner since 2007 plus Cessna / Beech / Mooney / Piper coverage at KADS is exactly the kind of authorized depth my Cirrus buyers ask for.*

### 2.5 Transport (10)

All use **§1.7 Variant A — "buyers asking about transport"**.

**T1. Reliable Carriers — Tom Abrams**
Personalization: *Tom, largest enclosed auto transporter in North America with the Hagerty partnership and the 3rd-generation family ownership — that kind of founder-credible enclosed hauler is the bench I want for marketplace-closed exotics.*

**T2. Intercity Lines — Dispatch / Sales**
Personalization: *Official transporter for Gooding & Co and Hagerty Marketplace auctions, with the FL / NE / TX lanes — that auction-grade enclosed coverage is exactly what my marketplace-closed exotic / classic deals need.*

**T3. Passport Transport — Sales**
Personalization: *Personalized enclosed since 1970 serving top collectors, auction houses, concours, and classic dealers — that white-glove enclosed profile is exactly the bench I want for marketplace-closed exotic / classic deals.*

**T4. Plycar (Plycon Group) — Customer Service**
Personalization: *Coast-to-coast enclosed multi-car with the luxury / exotic relocation specialty across SE and TX corridors — that lane coverage is exactly the bench I want for marketplace-closed deals.*

**T5. Exotic Car Transport — Dispatch**
Personalization: *FL-based since 1986 with fully enclosed hard-side trailers and hydraulic lift-gates for low-clearance exotics on the FL / TX / SE lanes — that specialty equipment is exactly what marketplace-closed exotics need.*

**T6. Joule Yacht Transport — Sales**
Personalization: *Founded 1954, one of America's largest private yacht trucking carriers, Clearwater HQ — that scale on the SE lane is exactly the bench I want for marketplace-closed yachts.*

**T7. Brownell Boat Transport — Service Team**
Personalization: *Boat transport since 1954 with 50 / 100 / 200-ton hydraulic trailers for vessels to 175 ft / 200 tons — that oversized-load specialty is exactly the bench I want for marketplace-closed yachts.*

**T8. Flagship Boat Transport — Suzan**
Personalization: *28+ yrs, oversized-load specialty including permits, route surveys, pole cars, police escorts out of NC — that escort-grade coverage is exactly the bench I want for marketplace-closed permitted boats.*

**T9. Florida Boat Transport — Greg Hutchens**
Personalization: *Greg, veteran-owned since 1991 with a 40-tractor fleet and specialty racking out of Tampa — that founder-led FL hauling profile is exactly the bench I want for marketplace-closed yachts.*

**T10. Yacht Trucking (Safe Harbor Haulers) — Eric**
Personalization: *Eric, oversize leisure boats and truckable yachts out of Pensacola on the Gulf Coast / TX-FL lanes — that lane coverage is exactly the bench I want for marketplace-closed yachts.*

### 2.6 Lenders (5)

All use **§1.8 Variant A — "marketplace buyers needing financing"**.

**L1. Trident Funding — Joan Burleigh**
Personalization: *Joan, Trident is the largest US marine lender with 40,000+ closed loans and the Alameda West Coast yacht coverage — that bank-network depth is exactly the partner I want routed to my marketplace buyers.*

**L2. Sterling Acceptance — Matt Brown**
Personalization: *Matt, Sterling since 1987, 4 nationwide loan production offices, deep Annapolis / Chesapeake yacht broker network — that long-tenure owner-operated profile is exactly the kind of finance partner I want on early.*

**L3. Shore Premier Finance — Lauren Key**
Personalization: *Lauren, bank-backed (Centennial) marine specialist covering powerboats, sailboats, catamarans, charter programs, USCG and BVI registries since the LH Finance acquisition — that bank-backed depth is exactly what my marketplace buyers ask for.*

**L4. Woodside Credit — Jerry Alspach**
Personalization: *Jerry, leading US collector / exotic / classic car lender with $3B+ in originations and the Barrett-Jackson exclusive — that collector-auto authority is exactly what my marketplace exotic / classic buyers ask for.*

**L5. J.J. Best Banc — John Meldon**
Personalization: *John, the nation's oldest classic and collector car lender, founder-led since 1993, and your own classic-collector background — that founder-to-founder fit is exactly what makes a partnership land.*

### 2.7 Insurance (5)

All use **§1.9 Variant A — "marketplace buyers asking about coverage"**.

**I1. Gowrie Group / IMIS — Mark Gargula**
Personalization: *Mark, the IMIS yacht specialty since 1987 in the heart of Chesapeake yacht country plus the Gowrie marine depth — that combination is exactly the partner my yacht buyers ask for at close.*

**I2. Pantaenius America — Scott Stusek**
Personalization: *Scott, Pantaenius is the brand HNW Euro-style yacht buyers (Hallberg-Rassy, Oyster, Nordhavn) ask for by name — exactly the cohort I am bringing on. Want to talk about how routed inquiries from the marketplace would fit your current US appetite.*

**I3. Maritime Insurance International — Ned Sawyer**
Personalization: *Ned, NE office out of Mystic plus HQ Charleston and Annapolis / Wrightsville Beach — that three-hot-zone coverage maps exactly to where my buyers are closing. Your underwriting background is the kind of credibility my buyers ask for.*

**I4. Wings Insurance — Tom Hauge**
Personalization: *Tom, 20+ yrs aviation, chairing the very-light-jet / owner-flown turbine transition program — that transition focus is exactly what my TBM / PC-12 / VisionJet / entry-Citation buyers ask for at close.*

**I5. Falcon Insurance (Acrisure Aerospace) — John Allen**
Personalization: *John, one of the country's largest aviation-only agencies since 1979 with the 9-office national footprint — that geographic coverage maps exactly to where my aircraft buyers live. Curious if a partnership-level conversation makes sense.*

### 2.8 Escrow / Title (5)

All use **§1.10 Variant A — "deals needing escrow and title"**.

**X1. Maritime Documentation Center — Customer Service**
Personalization: *Found you while looking for USCG vessel documentation specialists I would actually route closings to. Long Beach base on the West Coast luxury yacht corridor is exactly where my close volume is going to land.*

**X2. Dona Jenkins Maritime Document Service — Dona Jenkins**
Personalization: *Dona, San Diego, 25+ years, full-stack USCG documentation plus the partnered escrow via Paul S. Trusso — that bundled documentation + escrow is exactly what marketplace yacht closings need.*

**X3. Anacortes Marine Documentation — Sonya**
Personalization: *Sonya, 30+ years PNW vessel title with the cross-border (US / Canada / Mexico + international registry) specialty — that cross-border depth is exactly what my Salish Sea / Caribbean buyers ask for.*

**X4. AIC Title Service — Customer Service**
Personalization: *Found you while looking for FAA Aircraft Registry escrow partners. OKC base, co-located with the FAA Registry plus the International Registry (Cape Town) coverage — that same-day filing capability is exactly what my aircraft closings need.*

**X5. Insured Aircraft Title Service — Kirk Woford**
Personalization: *Kirk, IATS since 1987 in OKC, bonded / insured aircraft closings with senior staff carrying 40+ years each — that depth at the principal level is exactly what my high-AOV aircraft closings need.*

### 2.9 Boat / Yacht Dealers & Brokers (25)

**B1. Massey Yacht Sales & Service — Ed Massey — Variant A (boutique)**
Personalization: *40+ years of continuous Tampa Bay sales and outfitting with a 25-broker team — that kind of long-tenure Bay-area depth is the kind of brokerage I want on the platform early.*

**B2. Aspire Yacht Sales — John Booysen — Variant B (boutique)**
Personalization: *John, boutique Fort Lauderdale brokerage with the luxury / worldwide focus — that kind of principal-led shop is exactly the kind of broker I want on the platform early.*

**B3. Reel Deal Yachts — Marcos Morjain — Variant A (yacht broker)**
Personalization: *40+ year Miami yachtsman with ownership in Bahia Mar and Waterways Marina — that kind of marina-affiliated principal-led brokerage is what I want on the platform early.*

**B4. Miami International Yacht Sales — Robert Lama — Variant C (superyacht)**
Personalization: *Bob, the commercial-real-estate approach applied to the 100-250 ft superyacht class is exactly the kind of professional-discipline broker my early HNW buyers ask for.*

**B5. Naples Yacht Brokerage — Pete Peterson — Variant B (boutique)**
Personalization: *Pete, the oldest independent brokerage in Naples since 1988 — that kind of long-tenure HNW market position is exactly the kind of brokerage I want on the platform early.*

**B6. Burkard Yacht Sales — Chris Burkard — Variant C (superyacht)**
Personalization: *Chris, 25+ years marine + CPYB + 100 ft+ vessel focus is exactly the credentialed-large-vessel profile my early buyers ask for.*

**B7. Southwest Florida Yachts — Barb Hansen — Variant A (yacht broker)**
Personalization: *Barb, 40+ years Cape Coral / SW FL family-owned operation since 1984 — that kind of family-owned long-tail brokerage is what I want on the platform early.*

**B8. Voller Boat Broker — Gary Voller — Variant B (boutique)**
Personalization: *Gary, independent solo coverage of Fort Pierce / Vero Beach / Sebastian with the personalized model — that kind of solo broker is exactly the kind of partner I want on the platform early.*

**B9. Hansen Yachts Sales — Mike Webster — Variant B (boutique)**
Personalization: *Mike, sole proprietor at Lambs Marina since 2019 with 30+ years experience — that kind of marina-attached personal-model brokerage is exactly the kind of broker I want on the platform early.*

**B10. Mark Zeigler Yacht Sales — Mark Zeigler — Variant A (yacht broker)**
Personalization: *Mark, owner-operator partnered with Lambs Yacht Center and Port 32 marinas in Jacksonville — that kind of marina-partnered indie is exactly the kind of broker I want on early.*

**B11. Center Hill Marine Brokerage — Mark O'Neill — Variant B (lake)**
Waterbody: Center Hill / Dale Hollow / Old Hickory / Percy Priest / Tims Ford.
Personalization: *Mark, multi-lake coverage out of Nashville (Center Hill, Dale Hollow, Old Hickory, Percy Priest, Tims Ford plus the Cumberland and Tennessee Rivers) — that lake-by-lake depth is what I want on the platform early.*

**B12. Erwin Marine Sales — Kayo Erwin — Variant A (boat dealer)**
Personalization: *Kayo, family-owned since 1978 operating Chickamauga Marina, Gold Point Yacht Harbor, Pine Harbor, and Sunrise Marina across the TN River — that kind of multi-marina footprint is exactly the kind of dealer I want on the platform early.*

**B13. Intracoastal Yacht Sales — Bobby Gregory — Variant A (yacht broker)**
Personalization: *Bobby, Charleston native, USCG Captain since 1998, College of Charleston grad serving Charleston City Marina — that local-credibility profile is exactly the kind of broker my Charleston buyers ask for.*

**B14. Jeff Brown Yachts (Charleston) — Jeff Brown — Variant A (yacht broker)**
Personalization: *Jeff, exclusive Mid-Atlantic Axopar / BRABUS Marine dealer expanding into Charleston — that authorized-brand depth is exactly the kind of broker I want on the platform early.*

**B15. Donnelly Yachts — Shawn Donnelly — Variant A (yacht broker)**
Personalization: *Shawn, family firm out of Hilton Head covering Savannah / Charleston / Jacksonville with Chris Donnelly's 45-year marine career — that kind of multi-region family operation is what I want on early.*

**B16. Atlantic Marine — David Floyd — Variant A (boat dealer)**
Personalization: *David, world's largest Grady-White dealer, 3rd-generation family leadership since 1976 — that kind of single-brand depth is exactly the dealer I want on the platform early.*

**B17. Lake Hartwell Marine — Jason Thomas — Variant B (lake)**
Waterbody: Lake Hartwell.
Personalization: *Jason, founded Oct 2011 and partnered with Jeremy Dawkins (Lincolnton Marine) to expand new-boat sales on Lake Hartwell — that kind of lake-focused founder profile is what I want on the platform early.*

**B18. Atlanta Boat Broker — Zane Stevenson — Variant B (lake)**
Waterbody: Lake Lanier.
Personalization: *Zane, independent broker on Lake Lanier (Atlanta metro's largest recreational lake) — that kind of owner-direct lake-broker profile is what I want on the platform early.*

**B19. Sea Lake Yachts — Doug Hughes — Variant A (yacht broker)**
Personalization: *Doug, husband-wife team since 1989 with the authorized X-Yachts dealership on Galveston Bay — that kind of single-brand husband-wife partnership is exactly the kind of broker I want on early.*

**B20. Little Yacht Sales — Kent Little — Variant A (yacht broker)**
Personalization: *Kent, 40+ years personally plus 150+ combined years on the team, Catalina / Jeanneau / Beneteau dealer in Kemah and Key West — that kind of multi-brand long-tenure profile is exactly what I want on early.*

**B21. Pier-1 Marine — Joe D'Amico — Variant A (yacht broker)**
Personalization: *Joe, 28-broker team out of Punta Gorda covering SW FL boating destinations and the full-service marine center — that kind of multi-broker SW FL footprint is exactly the broker I want on early.*

**B22. Gilman Yachts of Ft. Lauderdale — Sales Team — Variant B (boutique)**
Personalization: *Family-owned since 1968 at 1510 SE 17th Street in the heart of Ft Lauderdale yachting row — that kind of generational yachting-row brokerage is exactly the kind of broker I want on the platform early.*

**B23. Ghost Yachts — Sales Team — Variant A (yacht broker)**
Personalization: *Miami Beach Marina (300 Alton Rd) is prime location for the South Beach luxury cohort — that kind of marina presence is exactly what my early Miami buyers ask for.*

**B24. Terraglio Yacht Group — Greg Terraglio — Variant B (boutique)**
Personalization: *Greg, Stuart family-led brokerage with the sales / financing / yacht-management trifecta — that bundled-services model is exactly what makes a marketplace partnership land cleanly.*

**B25. Smith Mountain Marine Service & Sales — Peyton Canary — Variant A (boat dealer)**
Personalization: *Peyton, started at Smith Mountain Yacht Club as a technician in 1997 and now own the business plus master Mercury cert — that kind of owner-tech founder profile is exactly the kind of dealer I want on the platform early.*

---

## 3. Non-email channel variants

For every lead whose `email_verification_status = 'unverified'` (or
verified but the inbox does not reply), Don should fall back to a
LinkedIn DM or website contact-form message. These are the canonical
short-form variants of the same draft.

### 3.1 LinkedIn DM template (≤ 150 words)

Use for any unverified-email lead with a LinkedIn URL in `notes`.

```
Hey {first_name} —

{one_sentence_observation_from_personalization_angle}

I am Don, building TradeWind (marketplace for boats, autos, and aircraft). We are in private beta and bringing on a few {vertical_label}s with real inventory. Free profile during beta, no fee until you see real flow.

Worth a 10-minute look on your own time? I will send the link if it is.

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
```

### 3.2 Website contact form template (≤ 100 words — many forms cap)

Use for any unverified-email lead where the only public channel is a
contact form. Most company forms enforce a Name / Email / Phone /
Message structure — fill these as Don's personal details so the reply
lands in his inbox.

```
Name:    Don Morrison
Email:   don@lifeofmorr.com
Phone:   (optional — Don can add)
Subject: quick note for {company} — TradeWind

Message:
Hi {first_name_or_team} —

{one_sentence_observation_from_personalization_angle}

I am Don, building TradeWind — a marketplace for boats, autos, and aircraft. I am hand-picking a few {vertical_label}s for our private beta. Free profile, no fee until real flow.

Worth a 10-minute look? Just reply to this and I will send the link.

— Don
```

### 3.3 Per-lead non-email fallbacks

Only listed for leads where `email_verification_status = 'unverified'`
(20 leads). For each, the action and channel are listed.

| Code | Company                                | First channel | Fallback action                    |
|------|----------------------------------------|---------------|------------------------------------|
| E1   | Marshall Goldman Motor Sales           | Contact form  | LinkedIn DM Harlan Goldman         |
| E3   | Tactical Fleet                         | Contact form  | LinkedIn DM Christopher Barta      |
| E5   | Fusion Luxury Motors                   | Contact form  | LinkedIn DM Yoel Wazana            |
| E6   | RK Motors Charlotte                    | Contact form  | LinkedIn DM Rob Kauffman           |
| E12  | Cars Dawydiak                          | Contact form  | LinkedIn DM Walter Dawydiak        |
| E15  | Beverly Hills Car Club                 | Contact form  | LinkedIn DM Alex Manos             |
| A4   | High Performance Aviation              | info@ generic | LinkedIn DM Brandon Ray            |
| M1   | Banyan Air Service (Maintenance)       | Switchboard   | LinkedIn DM Danny Santiago         |
| M3   | Cutter Aviation (Phoenix MRO)          | Main MRO line | LinkedIn DM Travis Schleusner      |
| M4   | Cutter Aviation (Addison TBM)          | Direct phone  | LinkedIn DM Christopher Gradisar   |
| M9   | Carolina Aviation Technical Services   | Contact form  | Main line ask for Peter Sistare    |
| T1   | Reliable Carriers                      | Web form      | LinkedIn DM Tom Abrams / Bob Sellers |
| T5   | Exotic Car Transport                   | Quote form    | Phone 888-230-9877                 |
| L1   | Trident Funding                        | Pattern email | LinkedIn DM Joan Burleigh          |
| L3   | Shore Premier Finance                  | Pattern email | LinkedIn DM Lauren Key             |
| L4   | Woodside Credit                        | Pattern email | LinkedIn DM Jerry Alspach          |
| L5   | J.J. Best Banc                         | cs@ generic   | Phone 1-800-872-1965               |
| I2   | Pantaenius America                     | Pattern email | LinkedIn DM Scott Stusek           |
| I3   | Maritime Insurance International       | Pattern email | Main line ask for Ned Sawyer       |
| I5   | Falcon Insurance (Acrisure Aerospace)  | Pattern email | Regional producer first-touch      |
| B1   | Massey Yacht Sales                     | Contact form  | Phone 941-725-2350                 |
| B2   | Aspire Yacht Sales                     | Phone         | LinkedIn DM John Booysen           |
| B3   | Reel Deal Yachts                       | Contact form  | LinkedIn DM Marcos Morjain         |
| B5   | Naples Yacht Brokerage                 | Contact form  | Phone 239-262-6500                 |
| B11  | Center Hill Marine Brokerage           | LinkedIn DM   | Phone 615-948-7443                 |
| B16  | Atlantic Marine                        | Phone         | LinkedIn DM David Floyd            |

Other unverified leads (S5 / S7 / T1 / T5) use the same pattern — see
the lead's `notes` field for the exact backup channel.

---

## 4. How to actually send these

1. Pick the next-up draft from /admin/outreach Queue tab.
2. Confirm verification status is `verified` or `likely_valid`.
3. Click "Approve" (or "Approve Selected" for batch).
4. Copy email → paste into your Gmail compose pane.
5. Confirm From line is `Don Morrison <don@lifeofmorr.com>`.
6. Hit Send.
7. Click "Mark sent" on the dashboard.

The dashboard logs `sent_at`, schedules FU1 for +3 days, and updates
the lead's `date_contacted` and `follow_up_date`. Bulk approve makes
the daily cadence painless when the queue has many drafts.
