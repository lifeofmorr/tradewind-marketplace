# Refund and Payment Support

TradeWind Marketplace — https://tradewind-marketplace.vercel.app
Support: don@lifeofmorr.com

---

## Refund Policy

| Product | Price | Refund Window | Policy |
|---------|-------|---------------|--------|
| Featured Listing | $79/30 days | 24 hours | Refundable if listing not yet promoted. After 24 hours, no refund. |
| Boost Listing | $29/7 days | 24 hours | Refundable within 24 hours. After 24 hours, no refund. |
| Dealer Subscription | Varies | Pro-rated | Pro-rated refund for unused portion of current billing period upon cancellation. |
| Service Provider Subscription | $89/month | Pro-rated | Same as dealer subscriptions. |
| Concierge | $499 | Performance-based | Fully refundable if no qualifying match is sourced within the agreed window. |

---

## Refund Process

1. User emails don@lifeofmorr.com requesting refund
2. Admin verifies payment in /admin/payments and Stripe dashboard
3. Check refund eligibility per policy above
4. Process refund in Stripe dashboard (Payments -> find charge -> Refund)
5. Confirm to user via email with refund amount and timeline (5-10 business days)

---

## Dispute/Chargeback Handling

1. Stripe notifies via webhook when dispute filed
2. Admin reviews dispute in Stripe dashboard
3. Gather evidence:
   - Payment records
   - Service delivery proof
   - Communication logs
4. Submit evidence through Stripe dispute response
5. Document outcome regardless of result

---

## Subscription Management

- **Cancellation:** Users can cancel from their dashboard (not yet implemented -- admin handles via Stripe)
- **Effective Date:** Cancellation takes effect at end of current billing period
- **Resubscription:** Creates new subscription at current pricing
- **Downgrade/Upgrade:** Admin processes in Stripe, updates dealer profile in Supabase
