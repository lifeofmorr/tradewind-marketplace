import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Stub the Supabase client so route tests don't need network/env.
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
  InView: ({ children }: { children: (state: { ref: () => void; inView: boolean }) => React.ReactNode }) =>
    children({ ref: () => {}, inView: true }),
}));

import { AuthProvider } from "@/contexts/AuthContext";
import { CompareProvider } from "@/contexts/CompareContext";
import ProtectedRoute from "@/routes/ProtectedRoute";

function renderAt(initialPath: string, ui: React.ReactNode) {
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

describe("Route protection", () => {
  it("redirects unauthenticated users from admin to /login", async () => {
    renderAt(
      "/admin",
      <Routes>
        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/admin" element={<div>admin home</div>} />
        </Route>
        <Route path="/login" element={<div>login screen</div>} />
      </Routes>,
    );
    await waitFor(() => {
      expect(screen.getByText("login screen")).toBeInTheDocument();
    });
    expect(screen.queryByText("admin home")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated users from seller to /login", async () => {
    renderAt(
      "/seller",
      <Routes>
        <Route element={<ProtectedRoute roles={["seller", "dealer", "admin"]} />}>
          <Route path="/seller" element={<div>seller home</div>} />
        </Route>
        <Route path="/login" element={<div>login screen</div>} />
      </Routes>,
    );
    await waitFor(() => {
      expect(screen.getByText("login screen")).toBeInTheDocument();
    });
  });
});

describe("Form validation", () => {
  it("Login shows email validation error on bad submit", async () => {
    const { default: Login } = await import("@/pages/Login");
    renderAt("/login", <Login />);
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email required/i)).toBeInTheDocument();
    });
  });

  it("Signup requires a name", async () => {
    const { default: Signup } = await import("@/pages/Signup");
    renderAt("/signup", <Signup />);
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/name required/i)).toBeInTheDocument();
    });
  });
});
