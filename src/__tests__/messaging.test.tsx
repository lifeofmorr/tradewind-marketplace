// Tests for the windowed messaging hooks: the bounded conversation-list
// query (embedded last-message preview + capped unread badge counts — the
// replacement for the old flat 5,000-row pull) and `.range()`-windowed
// message history with load-older.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, renderHook, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

interface QueryRecord {
  table: string;
  select?: string;
  selectOpts?: { count?: string; head?: boolean };
  range?: [number, number];
  limits: [number, string | undefined][];
  filters: [string, unknown][];
}

const state = vi.hoisted(() => ({
  log: [] as QueryRecord[],
  totalMessages: 120,
  conversations: [] as Record<string, unknown>[],
}));

function makeMessage(i: number) {
  // i = 0 is the NEWEST message (queries order created_at desc).
  return {
    id: `msg-${i}`,
    conversation_id: "convo-1",
    sender_id: i % 2 === 0 ? "other-user" : "user-1",
    body: `Message ${i}`,
    created_at: new Date(Date.UTC(2026, 0, 1, 0, 0, state.totalMessages - i)).toISOString(),
    read_at: null,
  };
}

function respond(rec: QueryRecord) {
  if (rec.table === "conversations") {
    return { data: state.conversations, error: null, count: state.conversations.length };
  }
  if (rec.table === "messages" && rec.range) {
    const [from, to] = rec.range;
    if (from >= state.totalMessages && state.totalMessages > 0) {
      return { data: null, error: { code: "PGRST103", message: "Requested range not satisfiable" }, count: null };
    }
    const rows = [];
    for (let i = from; i <= Math.min(to, state.totalMessages - 1); i++) rows.push(makeMessage(i));
    return { data: rows, error: null, count: state.totalMessages };
  }
  return { data: [], error: null, count: 0 };
}

vi.mock("@/lib/supabase", () => {
  const fluent = (table: string) => {
    const rec: QueryRecord = { table, limits: [], filters: [] };
    state.log.push(rec);
    const chain: Record<string, (...args: never[]) => unknown> = {};
    chain.select = ((cols: string, opts?: QueryRecord["selectOpts"]) => {
      rec.select = cols;
      rec.selectOpts = opts;
      return chain;
    }) as never;
    for (const m of ["eq", "neq", "in", "is", "gt", "lt", "gte", "lte", "contains"]) {
      chain[m] = ((col: string, v: unknown) => {
        rec.filters.push([`${m}:${col}`, v]);
        return chain;
      }) as never;
    }
    chain.order = (() => chain) as never;
    chain.limit = ((n: number, opts?: { referencedTable?: string }) => {
      rec.limits.push([n, opts?.referencedTable]);
      return chain;
    }) as never;
    chain.range = ((from: number, to: number) => {
      rec.range = [from, to];
      return chain;
    }) as never;
    chain.maybeSingle = (() => Promise.resolve({ data: null, error: null })) as never;
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
      channel: () => {
        const ch = { on: () => ch, subscribe: () => ch };
        return ch;
      },
      removeChannel: () => Promise.resolve("ok"),
      functions: { invoke: () => Promise.resolve({ data: null, error: null }) },
      storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: "" } }) }) },
    },
    publicStorageUrl: () => null,
  };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    profile: { id: "user-1", role: "buyer" },
    loading: false,
  }),
  AuthProvider: ({ children }: { children?: ReactNode }) => children,
}));

import {
  useConversations,
  useMessages,
  CONVERSATIONS_WINDOW,
  UNREAD_BADGE_CAP,
  MESSAGES_PAGE_SIZE,
} from "@/hooks/useConversations";
import { MessageThread } from "@/components/messaging/MessageThread";

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  state.log.length = 0;
  state.totalMessages = 120;
  state.conversations = [
    {
      id: "convo-1",
      participants: ["user-1", "other-user"],
      listing_id: null,
      last_message_at: "2026-01-02T00:00:00.000Z",
      created_at: "2026-01-01T00:00:00.000Z",
      listing: { id: "l1", title: "Boston Whaler 280", slug: "bw-280" },
      messages: [{ body: "Is it still available?", created_at: "2026-01-02T00:00:00.000Z", sender_id: "other-user" }],
      unread: Array.from({ length: UNREAD_BADGE_CAP }, (_, i) => ({ id: `u${i}` })),
    },
    {
      id: "convo-2",
      participants: ["user-1", "third-user"],
      listing_id: null,
      last_message_at: "2026-01-01T12:00:00.000Z",
      created_at: "2026-01-01T00:00:00.000Z",
      listing: null,
      messages: [{ body: "Thanks!", created_at: "2026-01-01T12:00:00.000Z", sender_id: "user-1" }],
      unread: [],
    },
  ];
});

describe("useConversations (bounded inbox query)", () => {
  it("issues one bounded query with embedded preview and capped unread counts", async () => {
    const { result } = renderHook(() => useConversations(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const q = state.log.find((r) => r.table === "conversations")!;
    // Embeds both the 1-row preview and the capped unread id list.
    expect(q.select).toContain("messages(body, created_at, sender_id)");
    expect(q.select).toContain("unread:messages(id)");
    // Bounded: window on conversations, 1-per-convo preview, capped unread.
    expect(q.limits).toContainEqual([CONVERSATIONS_WINDOW, undefined]);
    expect(q.limits).toContainEqual([1, "messages"]);
    expect(q.limits).toContainEqual([UNREAD_BADGE_CAP, "unread"]);
    // Unread embed only counts unread messages from other senders.
    expect(q.filters).toContainEqual(["neq:unread.sender_id", "user-1"]);
    expect(q.filters).toContainEqual(["is:unread.read_at", null]);
    // No flat message pull anywhere.
    expect(state.log.filter((r) => r.table === "messages")).toHaveLength(0);
  });

  it("maps previews, unread counts, and other participants", async () => {
    const { result } = renderHook(() => useConversations(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const [c1, c2] = result.current.data!;
    expect(c1.lastMessage?.body).toBe("Is it still available?");
    expect(c1.unread).toBe(UNREAD_BADGE_CAP); // hit the cap
    expect(c1.otherIds).toEqual(["other-user"]);
    expect(c2.unread).toBe(0);
    expect(c2.lastMessage?.body).toBe("Thanks!");
  });
});

describe("useMessages (windowed history)", () => {
  it("fetches only the newest window first, oldest-first for display", async () => {
    const { result } = renderHook(() => useMessages("convo-1"), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const q = state.log.find((r) => r.table === "messages")!;
    expect(q.range).toEqual([0, MESSAGES_PAGE_SIZE - 1]);

    const msgs = result.current.messages;
    expect(msgs).toHaveLength(MESSAGES_PAGE_SIZE);
    // Oldest of the window first, newest last.
    expect(msgs[0].body).toBe(`Message ${MESSAGES_PAGE_SIZE - 1}`);
    expect(msgs[msgs.length - 1].body).toBe("Message 0");
    expect(result.current.hasOlder).toBe(true);
  });

  it("loadOlder prepends the next .range() window and stops at the end", async () => {
    state.totalMessages = 70; // window 1: 0–49, window 2: 50–69 (short → end)
    const { result } = renderHook(() => useMessages("convo-1"), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasOlder).toBe(true);

    await result.current.loadOlder();
    await waitFor(() => expect(result.current.messages).toHaveLength(70));

    const ranges = state.log.filter((r) => r.table === "messages").map((r) => r.range);
    expect(ranges).toContainEqual([50, 99]);
    // Whole history now oldest-first.
    expect(result.current.messages[0].body).toBe("Message 69");
    expect(result.current.messages[69].body).toBe("Message 0");
    // Short window → no more pages.
    expect(result.current.hasOlder).toBe(false);
  });

  it("treats a past-the-end range (PGRST103) as the end of history", async () => {
    state.totalMessages = 50; // exactly one full window → nextOffset 50 → 416
    const { result } = renderHook(() => useMessages("convo-1"), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasOlder).toBe(true);

    await result.current.loadOlder();
    await waitFor(() => expect(result.current.hasOlder).toBe(false));
    expect(result.current.isError).toBe(false);
    expect(result.current.messages).toHaveLength(50);
  });
});

describe("MessageThread (load-older UI)", () => {
  it("shows a Load older control only while older windows remain", async () => {
    state.totalMessages = 60;
    render(<MessageThread conversationId="convo-1" />, { wrapper });
    await waitFor(() => expect(screen.getByText("Message 0")).toBeInTheDocument());

    const btn = screen.getByRole("button", { name: "Load older messages" });
    fireEvent.click(btn);
    await waitFor(() => expect(screen.getByText("Message 59")).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Load older messages" })).not.toBeInTheDocument(),
    );
  });
});
