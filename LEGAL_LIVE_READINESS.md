# TradeWind Marketplace — Legal Live Readiness

**Platform:** https://tradewind-marketplace.vercel.app  
**Document created:** 2026-06-03  
**Status:** Pre-launch legal compliance review  

---

## Existing Legal Pages Status

| Page | URL | Status | Coverage |
|------|-----|--------|----------|
| Terms of Service | `/terms` | LIVE | Marketplace role (not a broker), account responsibilities, listing standards, payments, disclaimers, contact info |
| Privacy Policy | `/privacy` | LIVE | Data collection, usage, user choices, cookies (essential only, no ad trackers) |
| Trust Center | `/trust` | LIVE | Security posture, platform integrity, trust signals |
| Data Deletion | `/delete-my-data` | LIVE | GDPR-style data deletion request form |

All four pages are linked in the site footer under the Legal section.

---

## Required Disclaimers Inventory

### 1. Demo Inventory Disclaimer

**Status:** IMPLEMENTED  
**Priority:** Critical for beta  

TradeWind displays demo/sample aircraft listings for platform demonstration purposes. These are clearly marked and distinguished from real inventory.

- `demoDisclaimer.ts` renders a visible notice on all demo listings.
- Listings carry an `is_demo` flag in the database schema.
- Demo data is populated via seed SQL and uses Unsplash stock photography.
- Real listings require admin approval before publication.

**No further action required.**

---

### 2. AI Estimates Disclaimer

**Status:** IMPLEMENTED  
**Priority:** Critical for beta  

All AI-generated outputs — pricing estimates, deal scores, listing suggestions, and ownership cost projections — carry explicit disclaimer language.

- AI functions in `ai.ts` return a `disclaimer` field with every response.
- Disclaimer text states that AI outputs are estimates only, not appraisals or guarantees of value.
- Terms of Service Section 5 covers AI-generated content and its limitations.

**No further action required.**

---

### 3. Ownership Cost Estimates

**Status:** IMPLEMENTED  
**Priority:** Critical for beta  

The ownership cost calculator provides approximate projections for fuel, maintenance, insurance, hangar, and other recurring costs.

- `ownershipCost.ts` includes disclaimer language stating all figures are approximate.
- Disclaimer explicitly states estimates do not constitute financial advice.
- Users are directed to consult aviation professionals and financial advisors for actual cost planning.

**No further action required.**

---

### 4. Airworthiness / Title / Logbook Verification

**Status:** NEEDS ADDITION  
**Priority:** Critical for beta  

TradeWind does not verify airworthiness status, title chain, lien history, or logbook accuracy for any aircraft listed on the platform. This must be stated explicitly and prominently.

**Required disclaimer language:**

> TradeWind does not inspect, verify, or guarantee the airworthiness, title status, lien history, or logbook accuracy of any aircraft listed on this platform. All aircraft are listed by sellers and have not been independently verified by TradeWind. Buyers are solely responsible for conducting their own due diligence, including but not limited to: pre-purchase inspections by qualified A&P mechanics or FAA Inspection Authorization (IA) holders, title searches through FAA records or an aircraft title company, and independent logbook review. TradeWind makes no representation or warranty regarding the condition, legality, or fitness for any purpose of any listed aircraft.

**Action items:**

- [ ] Add airworthiness/title disclaimer to individual aircraft listing pages (below listing details or in a dedicated "Buyer Notice" section)
- [ ] Add corresponding language to Terms of Service (new subsection or expand Section 5)
- [ ] Reference this disclaimer in the Trust Center under a "What TradeWind Does Not Verify" heading

---

### 5. Financing / Insurance / Escrow Services

**Status:** NEEDS ADDITION  
**Priority:** Critical for beta  

TradeWind offers service request forms at `/financing`, `/insurance`, and related routes. These collect intake information and are designed to route to third-party partners. No live partner APIs are currently connected. This must be stated clearly.

**Required disclaimer language:**

> Financing, insurance, and escrow services referenced on TradeWind are provided by independent third-party partners. TradeWind is not a lender, insurer, escrow agent, or financial institution. TradeWind does not underwrite loans, bind insurance policies, or hold funds in escrow. Service request forms on this platform collect preliminary information only and do not constitute an application, binding agreement, or guarantee of service. Approval, terms, and availability of any third-party service are determined solely by the respective provider. TradeWind receives no commission or referral fee from partner services unless separately disclosed.

**Action items:**

- [ ] Add disclaimer text to each service request form page (`/financing`, `/insurance`, `/escrow` or equivalent routes)
- [ ] Add corresponding language to Terms of Service
- [ ] If partner relationships are formalized, disclose any referral compensation in both Terms and on the relevant form pages

---

### 6. No Guaranteed Buyers / Sales Volume

**Status:** NEEDS ADDITION  
**Priority:** Should add before full launch (acceptable for beta with Terms coverage)  

Sellers and dealers listing aircraft on TradeWind should not expect guaranteed buyer traffic, inquiries, or completed transactions.

**Required disclaimer language:**

> TradeWind is a listing venue and marketplace platform. Listing an aircraft on TradeWind does not guarantee any specific level of buyer interest, inquiries, offers, or completed sales. TradeWind makes no representations regarding expected time-to-sale, buyer volume, or transaction outcomes. Sellers are solely responsible for their pricing, listing accuracy, and negotiation with prospective buyers.

**Action items:**

- [ ] Add language to Terms of Service (expand Section 1 or add a new "Seller Expectations" subsection)
- [ ] Consider adding a brief notice on the seller/dealer onboarding flow or listing submission page

---

### 7. No Legal / Financial / Tax / Aviation Advice

**Status:** PARTIALLY IMPLEMENTED  
**Priority:** Should add before full launch  

Terms Section 5 covers AI disclaimers but does not contain a broad professional-advice disclaimer covering the platform as a whole.

**Required disclaimer language:**

> Nothing on TradeWind — including but not limited to AI-generated estimates, listing descriptions, ownership cost projections, market data, editorial content, or any other information — constitutes legal, financial, tax, investment, or aviation advice. All content is provided for informational purposes only. Users should consult licensed attorneys, certified public accountants, registered financial advisors, FAA-certified mechanics, and other qualified professionals before making purchase, sale, financing, insurance, or operational decisions related to aircraft.

**Action items:**

- [ ] Add a general professional-advice disclaimer to Terms of Service as a standalone section
- [ ] Consider adding a brief version to the site footer or Trust Center

---

### 8. Data Deletion Rights

**Status:** IMPLEMENTED  
**Priority:** Critical for beta  

- `/delete-my-data` form is live and functional.
- Privacy Policy covers data deletion rights, data retention, and the deletion request process.
- Compliant with GDPR right-to-erasure principles and CCPA deletion request requirements.

**No further action required.**

---

### 9. Cookies / Tracking

**Status:** IMPLEMENTED  
**Priority:** Critical for beta  

- Privacy Policy explicitly states the platform uses essential cookies only.
- No third-party advertising trackers, no cross-site tracking, no analytics cookies requiring consent.
- Under GDPR and ePrivacy Directive, essential-only cookies do not require a consent banner.

**No further action required.** If non-essential cookies or third-party analytics (e.g., Google Analytics, Hotjar) are added in the future, a cookie consent banner and updated Privacy Policy will be required before deployment.

---

### 10. Marketplace Platform Disclaimer

**Status:** IMPLEMENTED  
**Priority:** Critical for beta  

Terms of Service Section 1 establishes that TradeWind:

- Does not take title to any aircraft
- Does not act as a broker of record
- Does not guarantee the accuracy of any listing
- Facilitates connections between buyers and sellers who transact directly

**No further action required.**

---

## Summary Matrix

| # | Disclaimer | Status | Beta Critical | Action Needed |
|---|-----------|--------|---------------|---------------|
| 1 | Demo Inventory | IMPLEMENTED | Yes | None |
| 2 | AI Estimates | IMPLEMENTED | Yes | None |
| 3 | Ownership Cost Estimates | IMPLEMENTED | Yes | None |
| 4 | Airworthiness / Title / Logbook | NEEDS ADDITION | Yes | Add to listing pages, Terms, Trust Center |
| 5 | Financing / Insurance / Escrow | NEEDS ADDITION | Yes | Add to service forms and Terms |
| 6 | No Guaranteed Buyers | NEEDS ADDITION | No (add before full launch) | Add to Terms and seller onboarding |
| 7 | No Legal / Financial / Aviation Advice | PARTIALLY IMPLEMENTED | No (add before full launch) | Expand Terms with broad disclaimer |
| 8 | Data Deletion | IMPLEMENTED | Yes | None |
| 9 | Cookies / Tracking | IMPLEMENTED | Yes | None (revisit if trackers added) |
| 10 | Marketplace Platform | IMPLEMENTED | Yes | None |

---

## Compliance Notes

- **No absolute guarantees.** All disclaimer language avoids absolute statements. Terms and disclaimers use "as-is," "for informational purposes only," and "no warranty" framing consistent with standard marketplace liability limitations.
- **No implied warranties.** Disclaimers are drafted to disclaim implied warranties of merchantability, fitness for a particular purpose, and accuracy to the extent permitted by applicable law.
- **State and federal compliance.** While this document addresses general U.S. marketplace compliance, TradeWind should obtain review from aviation counsel regarding FAA broker/dealer registration requirements and state-specific consumer protection statutes before full commercial launch.
- **International users.** If TradeWind accepts listings or users from outside the United States, additional compliance review is needed for GDPR (EU), PIPEDA (Canada), and other applicable data protection and consumer protection frameworks.

---

## Recommended Next Steps

1. **Immediate (before beta):** Implement disclaimers #4 (Airworthiness/Title/Logbook) and #5 (Financing/Insurance/Escrow) on relevant pages and in Terms of Service.
2. **Before full launch:** Implement disclaimers #6 (No Guaranteed Buyers) and #7 (No Legal/Financial/Aviation Advice) in Terms of Service.
3. **Ongoing:** Engage aviation-specialized legal counsel for a formal Terms of Service review before scaling beyond beta.
4. **Trigger-based:** If adding third-party analytics, advertising, or non-essential cookies, implement cookie consent banner and update Privacy Policy before deployment.
