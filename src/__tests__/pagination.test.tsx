// Component tests for browse pagination: Supabase .range() paging,
// URL-synced ?page state, filter-change reset, and stale-page clamping.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface QueryRecord {
  table: string;
  selectOpts?: { count?: string; head?: boolean };
  range?: [number, number];
  filters: [string, unknown][];
}

const state = vi.hoisted(() => ({
  total: 60,
  log: [] as QueryRecord[],
}));

function makeListing(i: number) {
  return {
    id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
    slug: `test-listing-${i}`,
    title: `Test Listing ${i}`,
    description: "A fine vessel.",
    category: "boat",
    status: "active",
    price_cents: 1_000_000 + i * 100,
    year: 2020,
    make: "Boston Whaler",
    model: `Model ${i}`,
    city: "Miami",
    state: "FL",
    cover_photo_url: null,
    is_demo: false,
    is_featured: false,
    is_premium: false,
    seller_id: "seller-1",
    dealer_id: null,
    view_count: 0,
    inquiry_count: 0,
    deal_score: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    published_at: "2026-01-01T00:00:00.000Z",
  };
}

function respond(rec: QueryRecord) {
  if (rec.table !== "listings") return { data: [], error: null, count: 0 };
  const total = state.total;
  if (rec.selectOpts?.head) return { data: null, error: null, count: total };
  if (!rec.range) return { data: [makeListing(0)], error: null, count: total };
  const [from, to] = rec.range;
  if (total === 0 && from === 0) return { data: [], error: null, count: 0 };
  if (from >= total) {
    // PostgREST behavior for an offset past the end of the result set.
    return {
      data: null,
      error: { code: "PGRST103", message: "Requested range not satisfiable" },
      count: null,
    };
  }
  const rows = [];
  for (let i = from; i <= Math.min(to, total - 1); i++) rows.push(makeListing(i));
  return { data: rows, error: null, count: total };
}

vi.mock("@/lib/supabase", () => {
  const fluent = (table: string) => {
    const rec: QueryRecord = { table, filters: [] };
    state.log.push(rec);
    const chain: Record<string, (...args: never[]) => unknown> = {};
    chain.select = ((_cols: string, opts?: QueryRecord["selectOpts"]) => {
      rec.selectOpts = opts;
      return chain;
    }) as never;
    for (const m of ["eq", "neq", "in", "is", "gt", "lt", "gte", "lte", "match"]) {
      chain[m] = ((col: string, v: unknown) => {
        rec.filters.push([`${m}:${col}`, v]);
        return chain;
      }) as never;
    }
    chain.or = ((f: string) => {
      rec.filters.push(["or", f]);
      return chain;
    }) as never;
    chain.order = (() => chain) as never;
    chain.limit = (() => chain) as never;
    chain.range = ((from: number, to: number) => {
      rec.range = [from, to];
      return chain;
    }) as never;
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
      functions: { invoke: () => Promise.resolve({ data: null, error: null }) },
      storage: {
        from: () => ({ getPublicUrl: () => ({ data: { publicUrl: "" } }) }),
      },
    },
    publicStorageUrl: () => null,
  };
});

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
    useScroll: () => ({ scrollYProgress: 0, scrollY: 0 }),
    useTransform: () => 0,
    useMotionValue: (init: unknown) => init,
    useSpring: (v: unknown) => v,
  };
});

vi.mock("react-intersection-observer", () => ({
  useInView: () => ({ ref: () => {}, inView: true, entry: null }),
}));

import { AuthProvider } from "@/contexts/AuthContext";
import { CompareProvider } from "@/contexts/CompareContext";
import { BrowsePage } from "@/pages/CategoryPage";
import AircraftPage from "@/pages/public/AircraftPage";
import { Pagination } from "@/components/ui/pagination";
import { parsePageParam } from "@/hooks/usePageParam";
import { AIRCRAFT_CATEGORIES } from "@/lib/categories";

function LocationProbe() {
  const loc = useLocation();
  return <div data-testid="location">{loc.pathname + loc.search}</div>;
}

function renderBrowse(initialEntry = "/browse") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <CompareProvider>
            <BrowsePage />
            <LocationProbe />
          </CompareProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

function listingQueries() {
  return state.log.filter((r) => r.table === "listings" && r.range);
}

beforeEach(() => {
  state.total = 60;
  state.log.length = 0;
  window.scrollTo = vi.fn();
});

describe("BrowsePage pagination", () => {
  it("requests the first page with a 24-row range and an exact count", async () => {
    renderBrowse();
    expect(await screen.findByText("Test Listing 0")).toBeInTheDocument();
    const q = listingQueries()[0];
    expect(q.range).toEqual([0, 23]);
    expect(q.selectOpts).toEqual({ count: "exact" });
    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    expect(screen.getByText(/60 listings/)).toBeInTheDocument();
  });

  it("disables Previous on the first page and Next on the last", async () => {
    renderBrowse();
    await screen.findByText("Test Listing 0");
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(within(nav).getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(within(nav).getByRole("button", { name: "Next page" })).toBeEnabled();

    fireEvent.click(within(nav).getByRole("button", { name: "Next page" }));
    await screen.findByText("Test Listing 24");
    await waitFor(() =>
      expect(within(nav).getByRole("button", { name: "Next page" })).toBeEnabled(),
    );
    fireEvent.click(within(nav).getByRole("button", { name: "Next page" }));
    await screen.findByText("Test Listing 48");
    expect(screen.getByText(/Page 3 of 3/)).toBeInTheDocument();
    await waitFor(() =>
      expect(within(nav).getByRole("button", { name: "Next page" })).toBeDisabled(),
    );
    expect(within(nav).getByRole("button", { name: "Previous page" })).toBeEnabled();
  });

  it("advances pages with .range() offsets and syncs ?page= to the URL", async () => {
    renderBrowse();
    await screen.findByText("Test Listing 0");
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(await screen.findByText("Test Listing 24")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/browse?page=2");
    const ranges = listingQueries().map((q) => q.range);
    expect(ranges).toContainEqual([24, 47]);
  });

  it("restores the page from a ?page= deep link", async () => {
    renderBrowse("/browse?page=3");
    expect(await screen.findByText("Test Listing 48")).toBeInTheDocument();
    expect(screen.getByText(/Page 3 of 3/)).toBeInTheDocument();
    // The requested window is always 24 wide; PostgREST truncates to the
    // rows that exist (48–59 here).
    expect(listingQueries()[0].range).toEqual([48, 71]);
  });

  it("resets to page 1 when filters change", async () => {
    renderBrowse("/browse?page=3");
    await screen.findByText("Test Listing 48");

    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "whaler" } });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(/^\/browse$/),
    );
    expect(await screen.findByText("Test Listing 0")).toBeInTheDocument();
    const last = listingQueries().at(-1)!;
    expect(last.range).toEqual([0, 23]);
    expect(last.filters).toContainEqual(["or", "title.ilike.%whaler%,make.ilike.%whaler%,model.ilike.%whaler%"]);
  });

  it("clamps a stale ?page= past the end to the real last page", async () => {
    state.total = 10; // one page only
    renderBrowse("/browse?page=5");
    expect(await screen.findByText("Test Listing 0")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(/^\/browse$/),
    );
  });

  it("hides pagination when everything fits on one page", async () => {
    state.total = 10;
    renderBrowse();
    await screen.findByText("Test Listing 0");
    expect(screen.queryByRole("navigation", { name: "Pagination" })).not.toBeInTheDocument();
  });
});

describe("AircraftPage pagination (vertical parity)", () => {
  function renderAircraft(initialEntry = "/aircraft") {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <QueryClientProvider client={qc}>
          <AuthProvider>
            <CompareProvider>
              <AircraftPage />
              <LocationProbe />
            </CompareProvider>
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  }

  it("requests a 24-row range scoped to the aircraft categories with an exact count", async () => {
    renderAircraft();
    expect(await screen.findByText("Test Listing 0")).toBeInTheDocument();
    const q = listingQueries()[0];
    expect(q.range).toEqual([0, 23]);
    expect(q.selectOpts).toEqual({ count: "exact" });
    expect(q.filters).toContainEqual(["in:category", AIRCRAFT_CATEGORIES]);
    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
  });

  it("advances pages and syncs ?page= to the URL", async () => {
    renderAircraft();
    await screen.findByText("Test Listing 0");
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(await screen.findByText("Test Listing 24")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/aircraft?page=2");
    expect(listingQueries().map((q) => q.range)).toContainEqual([24, 47]);
  });

  it("selecting a category chip narrows to one category and resets to page 1", async () => {
    renderAircraft("/aircraft?page=2");
    await screen.findByText("Test Listing 24");
    fireEvent.click(screen.getByRole("button", { name: "Jets" }));
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(/^\/aircraft$/),
    );
    const last = listingQueries().at(-1)!;
    expect(last.range).toEqual([0, 23]);
    expect(last.filters).toContainEqual(["eq:category", "aircraft_jet"]);
  });

  it("clamps a stale ?page= deep link past the end", async () => {
    state.total = 10;
    renderAircraft("/aircraft?page=9");
    expect(await screen.findByText("Test Listing 0")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(/^\/aircraft$/),
    );
  });
});

describe("Pagination component", () => {
  it("renders nothing for a single page", () => {
    const { container } = render(
      <Pagination page={1} pageCount={1} onPageChange={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("disables both buttons while loading", () => {
    render(<Pagination page={2} pageCount={3} onPageChange={() => {}} isLoading />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("clamps an out-of-range page for display and navigation", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={99} pageCount={3} onPageChange={onPageChange} />);
    expect(screen.getByText(/Page 3 of 3/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});

describe("parsePageParam", () => {
  it("parses positive integers", () => {
    expect(parsePageParam("3")).toBe(3);
  });
  it("falls back to 1 for junk, zero, negatives, and floats", () => {
    expect(parsePageParam(null)).toBe(1);
    expect(parsePageParam("")).toBe(1);
    expect(parsePageParam("abc")).toBe(1);
    expect(parsePageParam("0")).toBe(1);
    expect(parsePageParam("-4")).toBe(1);
    expect(parsePageParam("2.5")).toBe(1);
  });
});
