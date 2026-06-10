# Real Listing Approval SOP

TradeWind Marketplace — https://tradewind-marketplace.vercel.app
Support: don@lifeofmorr.com

---

## When a Real Listing is Submitted

1. Seller creates listing via /seller/listings/new
2. Listing saved as draft
3. Seller submits for review -- status changes to `pending_review`
4. Admin notification generated

---

## Admin Review Checklist

- [ ] Photos show actual asset (not stock/demo photos)
- [ ] Description is accurate and complete
- [ ] Price is reasonable for category/condition
- [ ] HIN/VIN/N-number provided (if applicable)
- [ ] Seller account is verified (email confirmed)
- [ ] AI fraud check score is acceptable
- [ ] No prohibited content
- [ ] Category correctly assigned
- [ ] Location is valid

---

## Approve

1. Admin clicks Approve in /admin/listings
2. Status changes to `active`
3. Listing appears in browse/search results
4. Seller notified via dashboard

---

## Reject

1. Admin clicks Reject with reason
2. Status changes to `rejected` (or back to `draft`)
3. Seller notified with reason and option to edit and resubmit

---

## Escalation

- **Fraud suspected:** Move to /admin/fraud for deeper investigation
- **Legal concern:** Flag and consult before taking action
- **Aviation compliance question:** Add disclaimer, do not verify airworthiness

---

## First Real Listing Launch Protocol

1. Admin personally reviews all details
2. Verify seller identity (email, phone if possible)
3. Verify asset ownership claim
4. Approve and monitor for first 48 hours
5. Collect seller feedback on the process
