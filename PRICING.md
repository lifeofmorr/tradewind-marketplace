# TradeWind · Stripe products

Phase 1L. Create these in **test mode** at https://dashboard.stripe.com/test/products,
then drop the `price_…` ids into `.env.local` (frontend) and `supabase secrets set` (backend).

| Kind                | Product name              | Price (USD)          | Type         | Frontend env                            | Backend env                     |
| ------------------- | ------------------------- | -------------------- | ------------ | --------------------------------------- | ------------------------------- |
| `featured_listing`  | Featured listing (30d)    | $49 one-off          | Payment      | `VITE_STRIPE_PRICE_FEATURED_LISTING`    | `STRIPE_PRICE_FEATURED_LISTING` |
| `boost_listing`     | Boost listing (7d)        | $19 one-off          | Payment      | `VITE_STRIPE_PRICE_BOOST_LISTING`       | `STRIPE_PRICE_BOOST_LISTING`    |
| `dealer_starter`    | Dealer · Starter          | $99/mo               | Subscription | `VITE_STRIPE_PRICE_DEALER_STARTER`      | `STRIPE_PRICE_DEALER_STARTER`   |
| `dealer_pro`        | Dealer · Pro              | $249/mo              | Subscription | `VITE_STRIPE_PRICE_DEALER_PRO`          | `STRIPE_PRICE_DEALER_PRO`       |
| `dealer_premier`    | Dealer · Premier          | $599/mo              | Subscription | `VITE_STRIPE_PRICE_DEALER_PREMIER`      | `STRIPE_PRICE_DEALER_PREMIER`   |
| `service_pro`       | Service partner           | $79/mo               | Subscription | `VITE_STRIPE_PRICE_SERVICE_PROVIDER`    | `STRIPE_PRICE_SERVICE_PROVIDER` |
| `concierge`         | Concierge engagement      | $499 one-off         | Payment      | `VITE_STRIPE_PRICE_CONCIERGE`           | `STRIPE_PRICE_CONCIERGE`        |

Suggested billing config:
- All subscriptions: monthly billing, **14-day free trial**, no auto-tax (configure later).
- All one-offs: USD, no tax.
- Webhook endpoint: `https://YOUR-PROJECT.supabase.co/functions/v1/stripe-webhook`
  Events to subscribe to: `checkout.session.completed`,
  `customer.subscription.created`, `customer.subscription.updated`,
  `customer.subscription.deleted`, `charge.refunded`.

Test cards: https://stripe.com/docs/testing#cards
