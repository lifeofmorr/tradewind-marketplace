# Lead Research Engine

How to source, qualify, and load the right leads into the TradeWind outreach CRM. The goal is **150–300 high-quality leads** in the system, not 5,000 garbage rows.

---

## Verticals we target

1. **Boat dealers** — independent and small/mid multi-store
2. **Yacht brokers** — IYBA members, regional brokerages, sportfish specialists
3. **Auto dealers** — independent mainstream used-car dealers
4. **Exotic / classic auto dealers** — Ferrari, Lambo, Porsche, classic American, classic European
5. **Aircraft brokers** — jet, turboprop, piston, helicopter
6. **Aviation services** — A&P/IA shops, MROs, avionics shops, paint/interior, pre-buy inspectors
7. **Marine surveyors**
8. **Marine mechanics / engine specialists**
9. **Transport** — boat haulers, enclosed auto transport, aircraft ferry pilots
10. **Lenders** — marine, RV/auto specialty, aircraft finance
11. **Insurance** — marine, exotic auto, aviation
12. **Escrow / title** — aircraft title companies, vessel documentation services
13. **Buyer-side advisors / concierge buyers**

---

## Lead sources by vertical

### Boat dealers & yacht brokers
- **Google Maps**: "boat dealer near [city]", "yacht broker [region]"
- **IYBA member directory** (International Yacht Brokers Association)
- **YachtWorld** seller pages → who's listing the boats
- **BoatTrader** dealer directory
- **LinkedIn**: search "yacht broker", "boat sales", filter by region
- **Instagram**: hashtag scan #yachtbroker #boatsforsale #yachtsforsale
- **Marina tenant lists** (public, on marina websites)
- **National Marine Lenders Association** partner directories
- **Boat show exhibitor lists** (FLIBS, Miami, Annapolis, Newport)

### Auto dealers (mainstream used)
- **Google Maps**: "used car dealer [city]"
- **Independent Auto Dealers Association** (NIADA) member directories
- **Cars.com** / **AutoTrader** dealer pages
- **State DMV dealer license lookup** (public)

### Exotic / classic dealers
- **DuPont Registry** dealer directory
- **Hagerty marketplace** sellers and partners
- **Bring a Trailer** seller history (who consigns frequently)
- **Hemmings** dealer directory
- **Classic.com** dealer pages
- **RM Sotheby's / Gooding & Co / Mecum** consigner lists (public auction catalogs)
- **Instagram**: #classiccarsforsale #exoticcarsforsale + tag the dealer

### Aircraft brokers
- **Controller.com** seller directory
- **Trade-A-Plane** dealer directory
- **AvBuyer** broker pages
- **AC-U-KWIK / Aircraft Bluebook** (industry references)
- **NBAA Member Directory** (National Business Aviation Association)
- **NARA** (National Aircraft Resale Association)
- **LinkedIn**: "aircraft broker", "jet sales", "aircraft sales"

### Aviation services (A&P, IA, MRO, avionics)
- **FAA Part 145 Repair Station list** (public, searchable)
- **Type-club forums**: Cirrus Owners, Cessna Pilots, Mooney, Bonanza Society — members recommend shops
- **AOPA Pilot Pass approved facilities**
- **Local airport tenant lists** (KBED, KPDK, KAPA, KVNY, KHPN — public)
- **AirNav.com** for FBO + shop directories
- **Garmin / Avidyne / Genesys** dealer locators
- **Google Maps**: "aircraft maintenance [city]", "avionics shop near [airport ID]"

### Marine surveyors
- **SAMS** (Society of Accredited Marine Surveyors) member directory
- **NAMS** (National Association of Marine Surveyors) directory
- Google Maps: "marine surveyor [city]"

### Marine mechanics / engine specialists
- **ABYC** (American Boat & Yacht Council) certified technicians
- **Mercury / Yamaha / Volvo Penta dealer locators** (authorized service)
- Marina tenant lists

### Transport
- **uShip** vetted carriers
- **Boat US** transport partners
- **iATG / NAATAC** auto transport associations
- **Ferry pilot directories** (e.g., Globe Aero, Orient Air)

### Lenders
- **National Marine Lenders Association** member directory
- **AOPA Aviation Finance** + competitor lenders (Stratos, AirFleet, US Bank Aviation)
- **NEFA** (National Equipment Finance Association)

### Insurance
- **BoatUS, Markel, Travelers** marine specialists
- **Hagerty, Grundy** classic/exotic auto
- **Avemco, Global Aerospace, Starr** aviation
- Brokers listed on type-club forums

### Escrow / title
- **Aircraft title companies in Oklahoma City** (industry hub) — AIC Title, Insured Aircraft Title
- **Boat documentation services** — search "USCG documentation service"

### Buyer-side advisors / concierge buyers
- **Aircraft acquisition consultants** (Jet Advisors, Avjet, Mente Group)
- **Boat buyer's brokers** on IYBA directory
- **Personal shopper / collector advisor** Instagram and LinkedIn

---

## What to collect per lead (the CRM row)

For every lead, populate these CRM fields (see `OUTREACH_CRM_TEMPLATE.csv`):

| Field | Notes |
|---|---|
| **Company** | Legal/trade name as shown publicly |
| **Contact** | Specific human (owner, sales manager, GM) — never "info@" |
| **Role** | Owner / Broker / Sales Manager / Chief Inspector / President |
| **Vertical** | One of the 13 listed above |
| **Email** | Public business email only (website footer, "contact us" page) |
| **Phone** | Office number, never personal |
| **Website** | Primary domain |
| **LinkedIn** | Contact's personal profile if public, else company page |
| **Instagram** | If active (post in last 90 days) |
| **Location** | City, State |
| **Lead Source** | Where you found them (e.g., "IYBA directory", "FAA Part 145") |
| **Lead Score** | 1–5 per `LEAD_SCORING_MODEL.md` |
| **Personalization Angle** | One specific observation — see below |
| **Pain Point** | What hurts in their business (best guess from research) |
| **Recommended Offer** | Beta listing / free profile / partner / lead-share |
| **First Message** | Draft text |
| **Follow Up 1** | Draft text |
| **Follow Up 2** | Draft text |
| **Status** | New → Drafted → Sent → Replied → Demo → Beta → Paying / DNC |
| **Date Contacted** | YYYY-MM-DD |
| **Follow Up Date** | YYYY-MM-DD |
| **Reply** | Pasted text of their reply |
| **Demo Booked?** | Yes/No |
| **Beta Invited?** | Yes/No |
| **Real Listing Candidate?** | Yes/No — do they have inventory to actually list |
| **Partner Candidate?** | Yes/No — service/lender/insurance partnership fit |
| **Interested In Paying?** | Yes/No/Maybe — once they see lead flow |
| **Do Not Contact?** | Yes/No — flip to Yes on any opt-out/negative reply |
| **Notes** | Free-form research notes |
| **Next Action** | The next step in plain English |

---

## Personalization angle — what counts as "specific"

A good angle is something a competitor doing template blasts could not have written. Examples:

- "Their 2019 Sea Ray Sundancer listing has no helm photos."
- "Their Instagram bio mentions they specialize in restoring Porsche 964s."
- "Their FAA 145 cert is for piston engines only, not turbines."
- "Their website still has 2022 inventory on the homepage."
- "Their Google Maps photos look like dealership snapshots from a phone."
- "They list with both IYBA and YachtWorld but their own site only shows 3 boats."

A bad angle (do not use):

- "They are in Florida." — too generic
- "They sell boats." — that's the vertical
- "They are a dealer." — that's the segment

---

## Research checklist per lead (5–7 min/lead)

1. Open the company website. Read the About page.
2. Find the owner / lead contact via LinkedIn or the About page.
3. Glance through their inventory — is it 5 boats or 500?
4. Look at one listing's photos and description — what would TradeWind do better?
5. Check Instagram — post cadence, content quality, follower count.
6. Note one specific observation in the **Personalization Angle** field.
7. Score 1–5 per `LEAD_SCORING_MODEL.md`.
8. Save and move on. Don't perfect — research is 80/20.

---

## How many leads we need

- **Week 1**: 30 leads researched and queued
- **Week 2**: 60 cumulative
- **Week 3**: 100 cumulative
- **Week 4**: 150 cumulative
- **Plateau**: maintain 150 active + 50 nurture + ongoing weekly adds

We're not building a list of 10,000. We're building a list of 200 people who would actually use TradeWind, and treating each one like they matter.
