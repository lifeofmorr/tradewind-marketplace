import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages, useSendMessage, markRead } from "@/hooks/useConversations";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ReportButton } from "@/components/ui/ReportButton";
import { cn, timeAgo } from "@/lib/utils";

interface Props { conversationId: string }

export function MessageThread({ conversationId }: Props) {
  const { user } = useAuth();
  const { data: messages = [], isLoading } = useMessages(conversationId);
  const send = useSendMessage();
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Mark unread messages read when this thread is open.
  useEffect(() => {
    if (!conversationId || !user) return;
    void markRead(conversationId, user.id).then(() => {
      void qc.invalidateQueries({ queryKey: ["unread-conversations", user.id] });
      void qc.invalidateQueries({ queryKey: ["conversations", user.id] });
    });
  }, [conversationId, messages.length, user, qc]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setError(null);
    setDraft("");
    try {
      await send.mutateAsync({ conversation_id: conversationId, body });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message");
      setDraft(body);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-3">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="text-sm text-muted-foreground">No messages yet — say hi.</div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <div key={m.id} className={cn("group flex items-center gap-1", mine ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[75%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                  mine ? "bg-brass-500 text-navy-950" : "bg-secondary text-foreground",
                )}>
                  {m.body}
                  <div className={cn(
                    "text-[10px] font-mono mt-1",
                    mine ? "text-navy-950/60" : "text-muted-foreground",
                  )}>{timeAgo(m.created_at)}</div>
                </div>
                {!mine && (
                  <ReportButton
                    targetType="message"
                    targetId={m.id}
                    variant="icon"
                    className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
                  />
                )}
              </div>
            );
          })
        )}
      </div>
      {error && (
        <div role="alert" className="px-4 py-2 border-t border-red-500/40 bg-red-500/10 text-xs text-red-300">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} className="p-4 border-t border-border flex items-end gap-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="min-h-[44px] max-h-32"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void onSubmit(e as unknown as FormEvent);
            }
          }}
        />
        <Button type="submit" disabled={send.isPending || !draft.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
