import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Conversation, Message, Profile, Listing } from "@/types/database";

export interface ConversationWithMeta extends Conversation {
  listing: Pick<Listing, "id" | "title" | "slug"> | null;
  unread: number;
  lastMessage: { body: string; created_at: string; sender_id: string } | null;
  otherIds: string[];
}

export function useConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ConversationWithMeta[]> => {
      if (!user) return [];
      // Embed the latest message per conversation so the whole list costs two
      // queries total instead of two per conversation.
      const { data, error } = await supabase
        .from("conversations")
        .select("*, listing:listings(id, title, slug), messages(body, created_at, sender_id)")
        .contains("participants", [user.id])
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .order("created_at", { referencedTable: "messages", ascending: false })
        .limit(1, { referencedTable: "messages" })
        .limit(100);
      if (error) throw error;
      const convos = (data ?? []) as (Conversation & {
        listing: Pick<Listing, "id" | "title" | "slug"> | null;
        messages: { body: string; created_at: string; sender_id: string }[];
      })[];

      // Batch unread counts across all conversations in one query.
      const unreadByConvo = new Map<string, number>();
      if (convos.length) {
        const { data: unreadRows, error: unreadErr } = await supabase
          .from("messages")
          .select("conversation_id")
          .in("conversation_id", convos.map((c) => c.id))
          .neq("sender_id", user.id)
          .is("read_at", null)
          .limit(5000);
        if (unreadErr) throw unreadErr;
        for (const r of (unreadRows ?? []) as { conversation_id: string }[]) {
          unreadByConvo.set(r.conversation_id, (unreadByConvo.get(r.conversation_id) ?? 0) + 1);
        }
      }

      return convos.map(({ messages, ...c }) => ({
        ...c,
        unread: unreadByConvo.get(c.id) ?? 0,
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
      const { data: convos } = await supabase
        .from("conversations").select("id").contains("participants", [user.id]);
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

export function useMessages(conversationId: string | undefined) {
  const qc = useQueryClient();
  const result = useQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    queryFn: async (): Promise<Message[]> => {
      if (!conversationId) return [];
      // Most recent 200, returned oldest-first for display.
      const { data, error } = await supabase
        .from("messages").select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return ((data ?? []) as Message[]).reverse();
    },
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

  return result;
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
