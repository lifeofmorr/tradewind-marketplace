import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Notification } from "@/types/database";

export function useNotifications(limit = 20) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const result = useQuery({
    queryKey: ["notifications", user?.id, limit],
    enabled: !!user,
    queryFn: async (): Promise<Notification[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications").select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`notif:${user.id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => { void qc.invalidateQueries({ queryKey: ["notifications", user.id] }); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user, qc]);

  return result;
}

export function useUnreadNotificationCount() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const result = useQuery({
    queryKey: ["unread-notifications", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<number> => {
      if (!user) return 0;
      const { count } = await supabase
        .from("notifications").select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null);
      return count ?? 0;
    },
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`notif-count:${user.id}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => { void qc.invalidateQueries({ queryKey: ["unread-notifications", user.id] }); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user, qc]);

  return result;
}

export function useMarkAllNotificationsRead() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .is("read_at", null);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["unread-notifications"] });
      void qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/** Best-effort notification creator. Failures are logged, not thrown. */
export async function createNotification(args: {
  user_id: string;
  kind: Notification["kind"];
  title: string;
  body?: string | null;
  link?: string | null;
}): Promise<void> {
  try {
    await supabase.from("notifications").insert({
      user_id: args.user_id,
      kind: args.kind,
      title: args.title,
      body: args.body ?? null,
      link: args.link ?? null,
    });
  } catch (e) {
    console.warn("[notifications] create failed", e);
  }
}
