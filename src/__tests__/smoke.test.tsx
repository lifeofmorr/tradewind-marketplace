import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompareProvider } from "@/contexts/CompareContext";

// Stub the Supabase client so smoke tests don't need network/env.
vi.mock("@/lib/supabase", () => {
  const fluent = () => {
    const chain: Record<string, (...args: unknown[]) => unknown> = {};
    const methods = [
      "select", "insert", "update", "delete", "upsert",
      "eq", "neq", "in", "is", "gt", "lt", "gte", "lte",
      "order", "limit", "range", "match",
    ];
    for (const m of methods) chain[m] = () => chain;
    chain.maybeSingle = () => Promise.resolve({ data: null, error: null });
    chain.single = () => Promise.resolve({ data: null, error: null });
    chain.then = (onResolve: (v: { data: never[]; error: null }) => unknown) =>
      Promise.resolve({ data: [], error: null }).then(onResolve);
    return chain;
  };
  return {
    supabase: {
      from: () => fluent(),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: null }),
        signUp: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
      functions: { invoke: () => Promise.resolve({ data: null, error: null }) },
      storage: {
        from: () => ({
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
          upload: () => Promise.resolve({ data: null, error: null }),
        }),
      },
    },
    publicStorageUrl: () => null,
  };
});

// Mock framer-motion to avoid animation-related JSDOM noise.
vi.mock("framer-motion", async () => {
  const React = await import("react");
  const passthrough = (tag: keyof JSX.IntrinsicElements) => {
    return ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) => {
      // Drop framer-only props that aren't valid DOM attributes
      const safe = { ...rest };
      delete safe.initial; delete safe.animate; delete safe.transition;
      delete safe.whileHover; delete safe.whileTap; delete safe.exit;
      delete safe.layout; delete safe.layoutId; delete safe.variants;
      return React.createElement(tag, safe, children);
    };
  };
  return {
    motion: new Proxy(
      {},
      {
        get: (_t, prop: string) => passthrough(prop as keyof JSX.IntrinsicElements),
      },
    ),
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
    useReducedMotion: () => false,
    useScroll: () => ({ scrollYProgress: 0, scrollY: 0 }),
    useTransform: () => 0,
    useMotionValue: (init: unknown) => init,
    useSpring: (v: unknown) => v,
  };
});

// Mock react-intersection-observer to avoid IO requirements.
vi.mock("react-intersection-observer", () => ({
  useInView: () => ({ ref: () => {}, inView: true, entry: null }),
  InView: ({ children }: { children: (state: { ref: () => void; inView: boolean }) => React.ReactNode }) =>
    children({ ref: () => {}, inView: true }),
}));

function renderRoute(ui: React.ReactNode, initialPath = "/") {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <CompareProvider>{ui}</CompareProvider>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  // Each test gets a clean document head.
  document.head.querySelectorAll("[data-test], #tradewind-jsonld").forEach((n) => n.remove());
});

describe("TradeWind smoke", () => {
  it("Login page renders sign-in form", async () => {
    const { default: Login } = await import("@/pages/Login");
    renderRoute(<Login />, "/login");
    expect(screen.getByRole("heading", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("Signup page renders create-account form", async () => {
    const { default: Signup } = await import("@/pages/Signup");
    renderRoute(<Signup />, "/signup");
    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it("Home page renders hero search and category grid", async () => {
    const { default: Home } = await import("@/pages/Home");
    renderRoute(<Home />, "/");
    expect(screen.getAllByRole("heading").length).toBeGreaterThan(0);
    // Hero scene is lazy-loaded; the search input mounts after Suspense resolves.
    expect(await screen.findByPlaceholderText(/Boston Whaler|Porsche/i)).toBeInTheDocument();
  });

  it("TrustCenter page renders verification copy", async () => {
    const { default: TrustCenter } = await import("@/pages/public/TrustCenter");
    renderRoute(<TrustCenter />, "/trust");
    expect(screen.getAllByText(/Verified Dealer/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Why you'll see 'Demo' badges/i)).toBeInTheDocument();
  });

  it("CheckoutSuccess page renders payment-received state", async () => {
    const { CheckoutSuccess } = await import("@/pages/CheckoutPages");
    renderRoute(<CheckoutSuccess />, "/checkout/success");
    expect(screen.getByRole("heading", { name: /payment received/i })).toBeInTheDocument();
  });
});
