# TradeWind Private Beta — Test Script

A guided walkthrough for beta testers. Plan ~45 minutes total if you do every flow. Each role has its own section — testers can stop after the role they were invited as.

> **Tip:** Use a fresh incognito window for each role so sessions don't collide.

---

## Buyer Flow (~10 min)

You don't need to sign up to do most of the buyer flow.

1. **Visit the homepage** at the production URL. Browse the featured listings strip and scroll to the listings grid.
2. **Click into a boat listing.** Confirm the detail page loads with photos (or a placeholder), specs, price, and seller info.
3. **Check the Deal Score and True Cost to Own** panels on the detail page. Both should show a numeric score with a short explainer.
4. **Try the Buy-Ready Checklist** on the listing. Toggle a few items and confirm progress saves on the page.
5. **Add 2–3 listings to Compare.** Use the "Compare" button on each listing card or detail page.
6. **Visit `/buyer/compare`.** Confirm the side-by-side table shows your selections with the right specs.
7. **Try the Offer Builder** on a listing detail page. Enter an offer amount, walk through any extras, and save the draft.
8. **Submit a financing request** from the listing detail page or the Financing CTA. Fill the form and submit.
9. **Submit a concierge request** from the homepage or `/concierge`. Describe what you're looking for.
10. **Visit `/trust`.** Skim the Trust Center — links should resolve, content should render.

What to flag: anything broken, slow, confusing, or not what you'd expect from a real marketplace.

---

## Seller Flow (~10 min)

1. **Sign up as a seller** using `?role=seller` on the signup page or by selecting "Seller" in the role picker.
2. **Create a listing.** Choose a category (boat, car, or truck). Try the **AI generator** if your invite says the API key is set — otherwise fill the form manually.
3. **Upload a photo.** Drag-and-drop or use the file picker. Confirm the upload completes and the photo appears in the preview.
4. **Check the Listing Quality Score.** It should appear after you save and tell you what's missing or low-effort.
5. **View inquiries.** Empty state expected — confirm the empty state is friendly and tells you what to do next.
6. **Edit the listing.** Change the price, save, and reload to confirm the edit persisted.

What to flag: form friction, unclear validation, AI output quality (if used), photo upload issues.

---

## Dealer Flow (~10 min)

1. **Sign up as a dealer** using `?role=dealer`.
2. **Complete dealer onboarding.** Fill in dealership name, address, specialty, and any required fields.
3. **View the inventory dashboard** at `/dashboard/dealer`. Empty state expected.
4. **Check Dealer Analytics.** Specifically the **inventory health** card — confirm it renders without errors even with zero inventory.
5. **View leads.** Empty state expected. The **AI follow-up panel** should render with a placeholder or sample suggestion.
6. **Edit your dealer profile.** Change the description, save, and reload to confirm.

What to flag: onboarding friction, missing fields, dashboard layout issues, anything that wouldn't make sense to a real dealer.

---

## Service Provider Flow (~5 min)

1. **Sign up as a service provider** using `?role=service_provider`.
2. **Complete onboarding.** Fill in business info and the services you offer.
3. **View leads.** Empty state expected.
4. **Edit your profile.** Change services or coverage area, save, reload.

What to flag: confusing fields, unclear scope (what kinds of providers belong here), missing service categories.

---

## Admin Flow (~10 min)

> Admin access is restricted. You'll be told if you're a tester for this flow.

1. **Log in as admin** with the credentials provided.
2. **Check the Admin Command Center** at `/admin`. Confirm headline metrics render.
3. **Review pending listings.** Approve or reject one. Confirm the listing's status updates.
4. **Check Market Pulse.** Card should show recent activity numbers without errors.
5. **View requests** at `/admin/requests`. Try the **Partner Match** action on a concierge or financing request.
6. **View fraud flags.** Confirm the page renders even with no flags.
7. **View payments.** Confirm Stripe activity (test-mode) shows here.
8. **Filter demo vs. real listings** in the admin listings view. Toggle the filter and confirm the count updates.

What to flag: missing admin actions, slow loads, anything an operator would need that isn't here.

---

## After Testing

Fill out [PRIVATE_BETA_FEEDBACK_FORM.md](./PRIVATE_BETA_FEEDBACK_FORM.md) and send it to the contact in your invite email. For specific bugs, use [BUG_REPORT_TEMPLATE.md](./BUG_REPORT_TEMPLATE.md).
