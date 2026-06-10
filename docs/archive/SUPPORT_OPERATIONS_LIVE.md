# TradeWind Marketplace -- Support Operations Manual

**Platform:** https://tradewind-marketplace.vercel.app
**Support Email:** don@lifeofmorr.com
**Status:** Live Operations Runbook

---

## Response Time Targets

| Category | Target Response Time | Notes |
|---|---|---|
| General inquiries | 1 business day | Feature questions, how-to, general info |
| Account / payment issues | 4 hours | Business hours only |
| Suspicious listing reports | 4 hours | Business hours only |
| Security incidents | 1 hour | All hours, immediate priority |
| Data deletion requests | Acknowledged within 48 hours, completed within 30 days | Per privacy policy |

---

## Issue Categories

### 1. Account
Login issues, signup problems, profile updates, role changes (buyer/seller/dealer/broker), password reset, email verification failures.

### 2. Listings
Create, edit, remove listings. Moderation status questions. Photo upload failures. Listing visibility and search indexing.

### 3. Payments / Billing
Subscription management, unexpected charges, refund requests, failed payments, Stripe billing portal access, invoice requests.

### 4. Suspicious Activity
Fake listings, scam attempts, impersonation, price manipulation, duplicate accounts, phishing messages.

### 5. Data / Privacy
Account deletion requests, data export requests, privacy policy questions, consent management.

### 6. Bug Reports
UI rendering issues, broken features, error messages, performance problems, mobile responsiveness.

### 7. Feature Requests
Enhancement suggestions, integration requests, new category requests, workflow improvements.

### 8. Partnership / Onboarding
Dealer applications, service provider applications, broker inquiries, bulk listing arrangements, API access requests.

### 9. Aircraft-Specific
Compliance questions, N-number verification, airworthiness disclaimers, logbook inquiries, regulatory references.

---

## Escalation Path

### Level 1 -- Initial Triage
**Owner:** don@lifeofmorr.com
- Receives all incoming support via email and /feedback form
- Categorizes and prioritizes issues
- Resolves straightforward requests directly

### Level 2 -- Admin Dashboard Review
**Tools:** Admin pages at /admin/*
- Review user data at /admin/users
- Review listing data at /admin/listings
- Review payment data at /admin/payments
- Review beta inbox at /admin/beta-inbox
- Check fraud signals at /admin/fraud

### Level 3 -- Direct Infrastructure Intervention
**Tools:** Supabase dashboard, Stripe dashboard
- Direct database queries and record modifications in Supabase
- Payment adjustments, refunds, and subscription changes in Stripe
- Row-level security policy review in Supabase

### Emergency -- Platform Incident
**Actions:**
1. Freeze Vercel deployment (pause automatic deployments)
2. Review Supabase RLS policies for unauthorized access
3. Audit recent database changes
4. Roll back deployment if necessary
5. Notify affected users once resolved

---

## Workflows

### Bug Intake

**Trigger:** User emails don@lifeofmorr.com or submits via /feedback form.

1. **Receive report.** Check email inbox and /admin/beta-inbox daily.
2. **Reproduce the issue.** Attempt to replicate on the live site. Note browser, device, and steps to reproduce.
3. **Triage severity.**
   - **P0 Critical:** Platform down, data loss, security breach, payments broken. Response: immediate.
   - **P1 High:** Major feature broken for multiple users, login failures, listing creation blocked. Response: same day.
   - **P2 Medium:** Minor feature broken, UI glitch affecting usability, intermittent errors. Response: 1-2 business days.
   - **P3 Low:** Cosmetic issues, minor text errors, nice-to-have improvements. Response: next sprint.
4. **Fix or document.** Create a fix for P0/P1 immediately. Document P2/P3 in known issues for scheduled resolution.
5. **Reply to user.** Acknowledge the report, share the severity assessment, and provide an estimated resolution timeline.

---

### User Support

**Trigger:** Any incoming support request.

1. **Identify issue category.** Match to one of the nine categories listed above.
2. **Gather context.** Check the admin dashboard for relevant data:
   - User account status at /admin/users
   - Listing details at /admin/listings
   - Payment history at /admin/payments
3. **Resolve or escalate.**
   - If resolvable at Level 1, take action and document.
   - If admin dashboard action is needed, escalate to Level 2.
   - If Supabase or Stripe intervention is required, escalate to Level 3.
4. **Reply with resolution.** Provide clear explanation of what was done, any next steps the user needs to take, and a point of contact for follow-up.

---

### Refund

**Trigger:** User requests a refund via email.

1. **Receive and log the request.** Note the user email, payment date, amount, and reason.
2. **Verify the payment.** Look up the transaction in /admin/payments and cross-reference in the Stripe dashboard.
3. **Check refund eligibility.**
   - **Subscription:** Pro-rated refund for unused portion of the billing period.
   - **Featured listing:** Full refund if requested within 24 hours of purchase.
   - **Concierge service:** Refund eligible if no match has been sourced yet.
4. **Process the refund.** Issue via the Stripe dashboard. Select the appropriate refund amount (full or partial).
5. **Confirm to the user.** Email confirmation with the refund amount and expected processing time (5-10 business days for card refunds).

---

### Suspicious Listing

**Trigger:** Report received via email, /feedback form, or discovered during admin review.

1. **Log the report.** Record the listing URL, reporter contact (if provided), and nature of the concern.
2. **Review the listing.** Open the listing in /admin/listings. Check for:
   - Unrealistic pricing
   - Stolen or stock photos
   - Incomplete or fabricated aircraft details
   - Duplicate listings across accounts
3. **Check fraud signals.** Review the fraud score and related flags in /admin/fraud. Check the seller account history in /admin/users.
4. **Take action.** Choose the appropriate response:
   - **Flag for review:** Mark the listing for closer monitoring but leave it live.
   - **Reject:** Remove the listing from public view pending seller response.
   - **Remove:** Permanently delete the listing.
   - **Ban user:** Disable the seller account if fraud is confirmed or repeated.
5. **Reply to reporter.** Thank them for the report. Confirm that the listing has been reviewed and appropriate action has been taken. Do not disclose specific actions taken against the seller account.

---

### Aircraft Compliance

**Trigger:** User asks about airworthiness, N-number verification, logbooks, or regulatory compliance.

1. **Identify the question.** Determine whether the user is asking about a specific listing or a general compliance topic.
2. **Respond with the standard disclaimer:**

   > TradeWind Marketplace is a listing platform. We do not verify airworthiness, provide aviation advice, or guarantee regulatory compliance of any aircraft listed on the platform. All buyers should engage a certified A&P mechanic or Inspection Authorization (IA) holder for a thorough pre-buy inspection before any purchase. FAA registration and airworthiness records can be verified through the FAA registry at registry.faa.gov.

3. **Direct the user to /trust** for full platform policies, terms of use, and trust and safety information.
4. **Do not provide specific aviation guidance.** If the user needs regulatory help, suggest they contact their local FSDO (Flight Standards District Office) or an aviation attorney.

---

### Data Deletion

**Trigger:** User submits a request via the /delete-my-data form or emails don@lifeofmorr.com.

1. **Receive and log the request.** Record the user email, date of request, and any specific data the user wants removed.
2. **Acknowledge within 48 hours.** Send a confirmation email that the request has been received and is being processed.
3. **Process the deletion.** Remove the following from Supabase:
   - User profile and account data
   - All listings created by the user
   - Messages sent and received
   - Saved items and watchlists
   - Reviews written by the user
4. **Retain required records.** Keep anonymized transaction records as required by legal and financial obligations. Strip all personally identifiable information from retained records.
5. **Confirm completion.** Email the user within 30 days of the original request to confirm that their data has been deleted. Include a summary of what was removed and what anonymized records were retained.

---

## Quick Reference

| Situation | First Step | Admin Tool |
|---|---|---|
| User cannot log in | Check account status | /admin/users |
| Listing not appearing | Check moderation status | /admin/listings |
| Payment failed | Check Stripe logs | /admin/payments + Stripe dashboard |
| Suspicious listing reported | Review fraud score | /admin/fraud |
| Refund requested | Verify original payment | /admin/payments + Stripe dashboard |
| Bug reported | Reproduce and triage | /admin/beta-inbox |
| Data deletion requested | Acknowledge and queue | Supabase dashboard |
| Security incident | Freeze deployments | Vercel + Supabase |
