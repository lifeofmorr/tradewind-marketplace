// Component tests for the seller / dealer / buyer / admin dashboard flows:
// rendering with mocked data, the key moderation interaction (approve /
// reject), pagination wiring on the dashboard grids, and error states.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

interface QueryRecord {
  table: string;
  op: "select" | "update" | "insert" | "delete";
  payload?: unknown;
  selectOpts?: { count?: string; head?: boolean };
  range?: [number, number];
  limits: number[];
  filters: [string, unknown][];
}

const state = vi.hoisted(() => ({
  log: [] as QueryRecord[],
  listings: [] as Record<string, unknown>[],
  savedRows: [] as Record<string, unknown>[],
  savedTotal: 0,
  updateError: null as { message: string } | null,
  authUser: { id: "user-1" } as { id: string } | null,
  profile: { id: "user-1", role: "seller", full_name: "Dana Seller", dealer_id: "dealer-1" } as Record<string, unknown> | null,
}));

function makeListing(i: number, over: Record<string, unknown> = {}) {
  return {
    id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
    slug: `dash-listing-${i}`,
    title: `Dash Listing ${i}`,
    description: "desc",
    category: "boat",
    status: "active",
    price_cents: 5_000_000 + i,
    year: 2021,
    make: "Boston Whaler",
    model: `M${i}`,
    city: "Miami",
    state: "FL",
    cover_photo_url: null,
    is_demo: false,
    is_featured: false,
    is_premium: false,
    seller_id: "user-1",
    dealer_id: "dealer-1",
    view_count: 10 + i,
    inquiry_count: i,
    deal_score: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    published_at: "2026-01-01T00:00:00.000Z",
    ...over,
  };
}

function respond(rec: QueryRecord) {
  if (rec.op !== "select") {
    return { data: null, error: rec.table === "listings" ? state.updateError : null, count: null };
  }
  if (rec.table === "listings") {
    if (rec.selectOpts?.head) return { data: null, error: null, count: state.listings.length };
    let rows = state.listings;
    if (rec.range) rows = rows.slice(rec.range[0], rec.range[1] + 1);
    else if (rec.limits.length) rows = rows.slice(0, rec.limits[0]);
    return { data: rows, error: null, count: state.listings.length };
  }
  if (rec.table === "saved_listings") {
    if (rec.selectOpts?.head) return { data: null, error: null, count: state.savedTotal };
    return { data: state.savedRows, error: null, count: state.savedTotal };
  }
  return { data: [], error: null, count: 0 };
}

vi.mock("@/lib/supabase", () => {
  const fluent = (table: string) => {
    const rec: QueryRecord = { table, op: "select", limits: [], filters: [] };
    state.log.push(rec);
    const chain: Record<string, (...args: never[]) => unknown> = {};
    chain.select = ((cols: string, opts?: QueryRecord["selectOpts"]) => {
      rec.selectOpts = opts;
      return chain;
    }) as never;
    chain.update = ((payload: unknown) => { rec.op = "update"; rec.payload = payload; return chain; }) as never;
    chain.insert = ((payload: unknown) => { rec.op = "insert"; rec.payload = payload; return chain; }) as never;
    chain.delete = (() => { rec.op = "delete"; return chain; }) as never;
    for (const m of ["eq", "neq", "in", "is", "gt", "lt", "gte", "lte", "contains", "ilike"]) {
      chain[m] = ((col: string, v: unknown) => { rec.filters.push([`${m}:${col}`, v]); return chain; }) as never;
    }
    chain.or = (() => chain) as never;
    chain.order = (() => chain) as never;
    chain.limit = ((n: number) => { rec.limits.push(n); return chain; }) as never;
    chain.range = ((from: number, to: number) => { rec.range = [from, to]; return chain; }) as never;
    chain.maybeSingle = (() => Promise.resolve({ data: null, error: null })) as never;
    chain.single = (() => Promise.resolve({ data: null, error: null })) as never;
    (chain as { then?: unknown }).then = ((resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
      Promise.resolve(respond(rec)).then(resolve, reject)) as never;
    return chain;
  };
  return {
    supabase: {
      from: (table: string) => fluent(table),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      channel: () => { const ch = { on: () => ch, subscribe: () => ch }; return ch; },
      removeChannel: () => Promise.resolve("ok"),
      functions: { invoke: vi.fn(() => Promise.resolve({ data: null, error: null })) },
      storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: "" } }) }) },
    },
    publicStorageUrl: () => null,
  };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: state.authUser, profile: state.profile, loading: false }),
  AuthProvider: ({ children }: { children?: ReactNode }) => children,
}));

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const passthrough = (tag: keyof JSX.IntrinsicElements) => {
    return ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) => {
      const safe = { ...rest };
      delete safe.initial; delete safe.animate; delete safe.transition;
      delete safe.whileHover; delete safe.whileTap; delete safe.exit;
      delete safe.layout; delete safe.layoutId; delete safe.variants;
      return React.createElement(tag, safe, children);
    };
  };
  return {
    motion: new Proxy({}, { get: (_t, prop: string) => passthrough(prop as keyof JSX.IntrinsicElements) }),
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
    useReducedMotion: () => false,
  };
});

vi.mock("react-intersection-observer", () => ({
  useInView: () => ({ ref: () => {}, inView: true, entry: null }),
}));

import { CompareProvider } from "@/contexts/CompareContext";
import SellerDashboard from "@/pages/dashboard/seller/SellerDashboard";
import SellerListings from "@/pages/dashboard/seller/SellerListings";
import DealerInventory from "@/pages/dashboard/dealer/DealerInventory";
import BuyerSaved from "@/pages/dashboard/buyer/BuyerSaved";
import AdminListings from "@/pages/dashboard/admin/AdminListings";
import { computeOutreachStats } from "@/pages/dashboard/admin/outreach/useOutreachData";
import type { OutreachLead, OutreachMessage, OutreachReply } from "@/pages/dashboard/admin/outreach/types";

function renderPage(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <CompareProvider>{ui}</CompareProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  state.log.length = 0;
  state.listings = [];
  state.savedRows = [];
  state.savedTotal = 0;
  state.updateError = null;
  state.authUser = { id: "user-1" };
  state.profile = { id: "user-1", role: "seller", full_name: "Dana Seller", dealer_id: "dealer-1" };
  window.scrollTo = vi.fn();
});

describe("SellerDashboard", () => {
  it("computes status counts and all-time totals from the seller's listings", async () => {
    state.listings = [
      makeListing(0, { status: "active", view_count: 100, inquiry_count: 3 }),
      makeListing(1, { status: "active", view_count: 50, inquiry_count: 2 }),
      makeListing(2, { status: "draft", view_count: 0, inquiry_count: 0 }),
      makeListing(3, { status: "sold", view_count: 25, inquiry_count: 5 }),
    ];
    renderPage(<SellerDashboard />);
    await waitFor(() => expect(screen.getByText("Welcome, Dana")).toBeInTheDocument());
    const stat = (label: string) => screen.getByText(label).parentElement!;
    await waitFor(() => expect(within(stat("Active")).getByText("2")).toBeInTheDocument());
    expect(within(stat("Draft")).getByText("1")).toBeInTheDocument();
    expect(within(stat("Sold")).getByText("1")).toBeInTheDocument();
    expect(within(stat("Views (all-time)")).getByText("175")).toBeInTheDocument();
    expect(within(stat("Inquiries (all-time)")).getByText("10")).toBeInTheDocument();
  });
});

describe("SellerListings", () => {
  it("renders the seller's rows from a paginated, seller-scoped query", async () => {
    state.listings = [makeListing(0), makeListing(1, { status: "draft" })];
    renderPage(<SellerListings />);
    expect(await screen.findByText("Dash Listing 0")).toBeInTheDocument();
    expect(screen.getByText("Dash Listing 1")).toBeInTheDocument();
    expect(screen.getByText("draft")).toBeInTheDocument();
    const q = state.log.find((r) => r.table === "listings" && r.range)!;
    expect(q.range).toEqual([0, 23]);
    expect(q.filters).toContainEqual(["eq:seller_id", "user-1"]);
    expect(q.selectOpts).toEqual({ count: "exact" });
  });

  it("shows the empty state with a create CTA when there are no listings", async () => {
    renderPage(<SellerListings />);
    expect(await screen.findByText("No listings yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create your first listing/i })).toBeInTheDocument();
  });
});

describe("DealerInventory", () => {
  it("renders inventory rows scoped to the dealer with pagination", async () => {
    state.listings = [makeListing(0), makeListing(1)];
    renderPage(<DealerInventory />);
    expect(await screen.findByText("Dash Listing 0")).toBeInTheDocument();
    const q = state.log.find((r) => r.table === "listings" && r.range)!;
    expect(q.filters).toContainEqual(["eq:dealer_id", "dealer-1"]);
    expect(q.range).toEqual([0, 23]);
  });

  it("shows the empty state when the dealer has no inventory", async () => {
    renderPage(<DealerInventory />);
    expect(await screen.findByText("No inventory yet")).toBeInTheDocument();
  });
});

describe("BuyerSaved", () => {
  it("renders saved listings from a paginated query and flags demo content", async () => {
    state.savedRows = [
      { id: "s1", user_id: "user-1", listing_id: "l1", created_at: "2026-01-01", listing: makeListing(0, { is_demo: true }) },
      { id: "s2", user_id: "user-1", listing_id: "l2", created_at: "2026-01-02", listing: makeListing(1) },
    ];
    state.savedTotal = 2;
    renderPage(<BuyerSaved />);
    expect(await screen.findByText("Dash Listing 0")).toBeInTheDocument();
    expect(screen.getByText("Dash Listing 1")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument(); // demo disclaimer
    const q = state.log.find((r) => r.table === "saved_listings" && r.range)!;
    expect(q.range).toEqual([0, 23]);
    expect(q.selectOpts).toEqual({ count: "exact" });
  });

  it("shows the empty state when nothing is saved", async () => {
    renderPage(<BuyerSaved />);
    expect(await screen.findByText("You haven't saved anything yet")).toBeInTheDocument();
  });
});

describe("AdminListings (moderation queue)", () => {
  it("renders pending listings with Approve/Reject and approves with a status update", async () => {
    state.listings = [makeListing(0, { status: "pending_review" })];
    renderPage(<AdminListings />);
    expect(await screen.findByText("Dash Listing 0")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /approve/i }));
    await waitFor(() => {
      const update = state.log.find((r) => r.table === "listings" && r.op === "update");
      expect(update).toBeTruthy();
      expect((update!.payload as { status: string }).status).toBe("active");
      expect(update!.filters).toContainEqual(["eq:id", state.listings[0].id]);
    });
  });

  it("rejects via the dialog and records the rejection reason", async () => {
    state.listings = [makeListing(0, { status: "pending_review" })];
    renderPage(<AdminListings />);
    await screen.findByText("Dash Listing 0");

    fireEvent.click(screen.getByRole("button", { name: /reject/i }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText(/rejection reason/i), {
      target: { value: "Misleading photos" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /reject listing/i }));

    await waitFor(() => {
      const update = state.log.find((r) => r.table === "listings" && r.op === "update");
      expect(update).toBeTruthy();
      const payload = update!.payload as { status: string; rejection_reason: string };
      expect(payload.status).toBe("rejected");
      expect(payload.rejection_reason).toBe("Misleading photos");
    });
  });

  it("surfaces an alert when a moderation update fails", async () => {
    state.listings = [makeListing(0, { status: "pending_review" })];
    state.updateError = { message: "permission denied" };
    renderPage(<AdminListings />);
    await screen.findByText("Dash Listing 0");

    fireEvent.click(screen.getByRole("button", { name: /approve/i }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("permission denied");
  });
});

describe("computeOutreachStats (admin outreach KPIs)", () => {
  const lead = (over: Partial<OutreachLead>): OutreachLead => ({
    id: Math.random().toString(36).slice(2),
    company: "Acme Marine",
    contact_name: null, contact_role: null, vertical: "Boat Dealer",
    email: null, phone: null, website: null, linkedin_url: null, instagram_url: null,
    location: null, lead_source: null, lead_score: 3, priority: 3,
    personalization_angle: null, pain_point: null, recommended_offer: null,
    status: "new", date_contacted: null, follow_up_date: null, reply_text: null,
    demo_booked: false, beta_invited: false, real_listing_candidate: false,
    partner_candidate: false, interested_in_paying: null, do_not_contact: false,
    notes: null, next_action: null,
    email_verification_status: null, email_verification_source: null,
    email_verified_at: null, bounce_reason: null, invalid_email_address: null,
    created_at: "2026-01-01", updated_at: "2026-01-01",
    ...over,
  });

  it("computes funnel, verification, and workflow buckets", () => {
    const leads = [
      lead({ status: "send_ready", email_verification_status: "likely_valid", priority: 5 }),
      lead({ status: "needs_review", email_verification_status: "unverified" }),
      lead({ status: "replied", email_verification_status: "verified", demo_booked: true }),
      lead({ do_not_contact: true }),
      lead({ email_verification_status: "bounced" }),
    ];
    const drafts = [
      { status: "drafted" } as OutreachMessage,
      { status: "approved" } as OutreachMessage,
    ];
    const replies = [{ reply_type: "interested" } as OutreachReply, { reply_type: "spam" } as OutreachReply];
    const stats = computeOutreachStats(
      leads,
      { delivered: 8, bounced: 2, sent: 6, sentToday: 3 },
      [],
      drafts,
      replies,
    );
    expect(stats.total).toBe(5);
    expect(stats.sendReady).toBe(1);
    expect(stats.needsReview).toBe(1);
    expect(stats.replied).toBe(1);
    expect(stats.demos).toBe(1);
    expect(stats.dnc).toBe(1);
    expect(stats.verified).toBe(2); // verified + likely_valid
    expect(stats.bouncedLeads).toBe(1);
    expect(stats.removed).toBe(2); // dnc + bounced
    expect(stats.draftsPending).toBe(1);
    expect(stats.queued).toBe(1);
    expect(stats.positiveReplies).toBe(1);
    expect(stats.bounceRatePct).toBe(20); // 2 / (8 + 2)
    expect(stats.sentToday).toBe(3);
  });

  it("handles the empty campaign without dividing by zero", () => {
    const stats = computeOutreachStats([], { delivered: 0, bounced: 0, sent: 0, sentToday: 0 }, [], [], []);
    expect(stats.total).toBe(0);
    expect(stats.bounceRatePct).toBe(0);
  });
});
