// Tests for the checkout UI: the startCheckout flow (mocked Stripe edge
// function) and the success/cancel result pages.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const state = vi.hoisted(() => ({
  invokes: [] as { fn: string; body: Record<string, unknown> }[],
  invokeResult: { data: { url: "https://checkout.stripe.com/c/session-123" } as Record<string, unknown> | null, error: null as Error | null },
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    functions: {
      invoke: (fn: string, opts: { body: Record<string, unknown> }) => {
        state.invokes.push({ fn, body: opts.body });
        return Promise.resolve(state.invokeResult);
      },
    },
  },
  publicStorageUrl: () => null,
}));

// loadStripe must never be hit with a real key in tests.
vi.mock("@stripe/stripe-js", () => ({
  loadStripe: vi.fn(() => Promise.resolve(null)),
}));

import { startCheckout, getStripe } from "@/lib/stripe";
import { CheckoutSuccess, CheckoutCancel } from "@/pages/CheckoutPages";

beforeEach(() => {
  state.invokes.length = 0;
  state.invokeResult = { data: { url: "https://checkout.stripe.com/c/session-123" }, error: null };
});

describe("startCheckout", () => {
  it("invokes the stripe-checkout edge function with the SKU payload and redirects", async () => {
    const hrefSpy = vi.fn();
    const original = window.location;
    // jsdom's location is non-navigable; intercept the redirect assignment.
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...original,
        origin: "https://gotradewind.com",
        get href() { return "https://gotradewind.com/seller"; },
        set href(v: string) { hrefSpy(v); },
      },
    });
    try {
      await startCheckout({ kind: "featured_listing", listingId: "lst-1" });
      expect(state.invokes).toHaveLength(1);
      expect(state.invokes[0].fn).toBe("stripe-checkout");
      expect(state.invokes[0].body).toEqual({
        kind: "featured_listing",
        listingId: "lst-1",
        successUrl: "https://gotradewind.com/checkout/success",
        cancelUrl: "https://gotradewind.com/checkout/cancel",
      });
      expect(hrefSpy).toHaveBeenCalledWith("https://checkout.stripe.com/c/session-123");
    } finally {
      Object.defineProperty(window, "location", { configurable: true, value: original });
    }
  });

  it("propagates edge-function errors", async () => {
    state.invokeResult = { data: null, error: new Error("unauthorized") };
    await expect(startCheckout({ kind: "dealer_pro", dealerId: "d-1" })).rejects.toThrow("unauthorized");
  });

  it("throws when no checkout URL comes back", async () => {
    state.invokeResult = { data: {}, error: null };
    await expect(startCheckout({ kind: "concierge" })).rejects.toThrow(/No checkout URL/);
  });

  it("getStripe memoizes the loadStripe promise", async () => {
    const { loadStripe } = await import("@stripe/stripe-js");
    const a = getStripe();
    const b = getStripe();
    expect(a).toBe(b);
    expect(vi.mocked(loadStripe)).toHaveBeenCalledTimes(1);
  });
});

describe("CheckoutSuccess page", () => {
  it("confirms payment, shows the session id, and links onward", () => {
    render(
      <MemoryRouter initialEntries={["/checkout/success?session_id=cs_test_abc"]}>
        <CheckoutSuccess />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Payment received." })).toBeInTheDocument();
    expect(screen.getByText(/session: cs_test_abc/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Go to dashboard" })).toHaveAttribute("href", "/buyer");
  });

  it("shows the test-mode banner when no live publishable key is configured", () => {
    render(
      <MemoryRouter initialEntries={["/checkout/success"]}>
        <CheckoutSuccess />
      </MemoryRouter>,
    );
    expect(screen.getByText("Test mode")).toBeInTheDocument();
    expect(screen.getByText(/No real charge was made/)).toBeInTheDocument();
  });

  it("omits the session line when there is no session_id", () => {
    render(
      <MemoryRouter initialEntries={["/checkout/success"]}>
        <CheckoutSuccess />
      </MemoryRouter>,
    );
    expect(screen.queryByText(/session:/)).not.toBeInTheDocument();
  });
});

describe("CheckoutCancel page", () => {
  it("confirms no charge was made", () => {
    render(
      <MemoryRouter initialEntries={["/checkout/cancel"]}>
        <CheckoutCancel />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Checkout canceled." })).toBeInTheDocument();
    expect(screen.getByText(/No charge was made/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
  });
});
