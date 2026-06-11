import { useEffect, useMemo } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Conversation, Message, Profile, Listing } from "@/types/database";

export interface ConversationWithMeta extends Conversation {
  listing: Pick<Listing, "id" | "title" | "slug"> | null;
  /** Unread count, capped at UNREAD_BADGE_CAP (render ">9" when it hits the cap). */
  unread: number;
  lastMessage: { body: string; created_at: string; sender_id: string } | null;
  otherIds: string[];
}

/** Inbox recency window — newest conversations by last activity. */
export const CONVERSATIONS_WINDOW = 100;
/**
 * Per-conversation cap on unread rows fetched for the badge. Counting stops
 * here and the UI renders "9+" — this is what keeps the inbox query bounded
 * (window × cap id-only rows worst case) instead of the old flat 5,000-row
 * message pull.
 */
export const UNREAD_BADGE_CAP = 10;

export function useConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ConversationWithMeta[]> => {
      if (!user) return [];
      // One bounded query: the conversation window with, per conversation,
      // (a) the latest message embedded as the preview and (b) up to
      // UNREAD_BADGE_CAP unread incoming message ids for the badge count.
      const { data, error } = await supabase
        .from("conversations")
        .select("*, listing:listings(id, title, slug), messages(body, created_at, sender_id), unread:messages(id)")
        .contains("participants", [user.id])
        .neq("unread.sender_id", user.id)
        .is("unread.read_at", null)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .order("created_at", { referencedTable: "messages", ascending: false })
        .limit(1, { referencedTable: "messages" })
        .limit(UNREAD_BADGE_CAP, { referencedTable: "unread" })
        .limit(CONVERSATIONS_WINDOW);
      if (error) throw error;
      const convos = (data ?? []) as (Conversation & {
        listing: Pick<Listing, "id" | "title" | "slug"> | null;
        messages: { body: string; created_at: string; sender_id: string }[];
        unread: { id: string }[];
      })[];

      return convos.map(({ messages, unread, ...c }) => ({
        ...c,
        unread: unread?.length ?? 0,
        lastMessage: messages?.[0] ?? null,
        otherIds: c.participants.filter((p) => p !== user.id),
      }));
    },
  });
}

export function useUnreadConversationCount() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const result = useQuery({
    queryKey: ["unread-conversations", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<number> => {
      if (!user) return 0;
      // Bounded to the same recency window as the inbox list — conversations
      // older than the window can't surface in the UI anyway.
      const { data: convos } = await supabase
        .from("conversations").select("id").contains("participants", [user.id])
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(CONVERSATIONS_WINDOW);
      const ids = ((convos ?? []) as { id: string }[]).map((r) => r.id);
      if (!ids.length) return 0;
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", ids)
        .neq("sender_id", user.id)
        .is("read_at", null);
      return count ?? 0;
    },
  });

  // Realtime: refetch when any new message arrives in any of my conversations.
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`unread:${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        void qc.invalidateQueries({ queryKey: ["unread-conversations", user.id] });
        void qc.invalidateQueries({ queryKey: ["conversations", user.id] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user, qc]);

  return result;
}

export const MESSAGES_PAGE_SIZE = 50;

interface MessagesWindow {
  /** Newest-first within the window (the flattened view re-orders for display). */
  messages: Message[];
  nextOffset: number | null;
}

/**
 * Windowed message history: the newest MESSAGES_PAGE_SIZE rows up front,
 * older windows on demand via `.range()` (`loadOlder`). Realtime inserts
 * invalidate the query, which refetches the loaded windows fresh.
 */
export function useMessages(conversationId: string | undefined) {
  const qc = useQueryClient();
  const result = useInfiniteQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<MessagesWindow> => {
      if (!conversationId) return { messages: [], nextOffset: null };
      const from = pageParam;
      const { data, error } = await supabase
        .from("messages").select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .range(from, from + MESSAGES_PAGE_SIZE - 1);
      if (error) {
        // Past the end (rows deleted since the last window) — nothing older.
        if ((error as { code?: string }).code === "PGRST103") {
          return { messages: [], nextOffset: null };
        }
        throw error;
      }
      const rows = (data ?? []) as Message[];
      return {
        messages: rows,
        nextOffset: rows.length === MESSAGES_PAGE_SIZE ? from + MESSAGES_PAGE_SIZE : null,
      };
    },
    getNextPageParam: (last) => last.nextOffset,
  });

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase.channel(`msgs:${conversationId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        () => { void qc.invalidateQueries({ queryKey: ["messages", conversationId] }); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [conversationId, qc]);

  // Flatten the newest-first windows into a single oldest-first list for display.
  const messages = useMemo<Message[]>(() => {
    const pages = result.data?.pages ?? [];
    const out: Message[] = [];
    for (let i = pages.length - 1; i >= 0; i--) {
      for (let j = pages[i].messages.length - 1; j >= 0; j--) out.push(pages[i].messages[j]);
    }
    return out;
  }, [result.data]);

  return {
    messages,
    isLoading: result.isLoading,
    isError: result.isError,
    /** Fetch the next (older) window of MESSAGES_PAGE_SIZE messages. */
    loadOlder: result.fetchNextPage,
    hasOlder: result.hasNextPage ?? false,
    isLoadingOlder: result.isFetchingNextPage,
  };
}

export function useSendMessage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { conversation_id: string; body: string }) => {
      if (!user) throw new Error("not signed in");
      const { error } = await supabase.from("messages").insert({
        conversation_id: args.conversation_id,
        sender_id: user.id,
        body: args.body,
      });
      if (error) throw error;
    },
    onSuccess: (_d, args) => {
      void qc.invalidateQueries({ queryKey: ["messages", args.conversation_id] });
      void qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useStartConversation() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { other_id: string; listing_id?: string | null }): Promise<string> => {
      if (!user) throw new Error("not signed in");
      // Check for existing 2-party convo first (regardless of listing context).
      const { data: existing } = await supabase
        .from("conversations").select("id, participants")
        .contains("participants", [user.id, args.other_id])
        .limit(1);
      const found = (existing ?? []) as { id: string; participants: string[] }[];
      const exact = found.find(
        (c) => c.participants.length === 2
          && c.participants.includes(user.id)
          && c.participants.includes(args.other_id),
      );
      if (exact) return exact.id;

      const { data, error } = await supabase.from("conversations").insert({
        participants: [user.id, args.other_id],
        listing_id: args.listing_id ?? null,
      }).select("id").maybeSingle();
      if (error || !data) throw error ?? new Error("could not create conversation");
      return (data as { id: string }).id;
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["conversations"] }); },
  });
}

export function useProfilesByIds(ids: string[]) {
  return useQuery({
    queryKey: ["profiles-by-ids", ids.slice().sort().join(",")],
    enabled: ids.length > 0,
    queryFn: async (): Promise<Profile[]> => {
      if (!ids.length) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, role")
        .in("id", ids);
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });
}

export async function markRead(conversationId: string, userId: string): Promise<void> {
  const { error } = await supabase.from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("read_at", null);
  if (error) throw error;
}
