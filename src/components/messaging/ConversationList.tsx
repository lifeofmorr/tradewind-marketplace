import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { useConversations, useProfilesByIds, type ConversationWithMeta } from "@/hooks/useConversations";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn, timeAgo } from "@/lib/utils";

interface Props {
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function ConversationList({ selectedId, onSelect }: Props) {
  const { data: convos = [], isLoading } = useConversations();
  const otherIds = Array.from(new Set(convos.flatMap((c) => c.otherIds)));
  const { data: profiles = [] } = useProfilesByIds(otherIds);
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return (
    <div className="border-r border-border h-full overflow-y-auto">
      <div className="p-4 border-b border-border">
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Inbox</div>
        <h2 className="font-display text-lg mt-1">Messages</h2>
      </div>
      {isLoading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 skeleton rounded" />
          ))}
        </div>
      ) : convos.length === 0 ? (
        <div className="p-4">
          <EmptyState
            compact
            icon={MessageSquare}
            title="No conversations"
            body="Message a seller from any listing to start a thread. Replies land here."
            cta={{ label: "Browse listings", to: "/browse" }}
          />
        </div>
      ) : (
        <ul>
          {convos.map((c) => (
            <ConversationListItem
              key={c.id}
              conversation={c}
              otherName={c.otherIds.map((id) => profileMap.get(id)?.full_name ?? "Member").join(", ")}
              selected={selectedId === c.id}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface ItemProps {
  conversation: ConversationWithMeta;
  otherName: string;
  selected: boolean;
  onSelect?: (id: string) => void;
}

function ConversationListItem({ conversation: c, otherName, selected, onSelect }: ItemProps) {
  const inner = (
    <div className={cn(
      "px-4 py-3 border-b border-border block hover:bg-secondary/40 transition-colors",
      selected && "bg-secondary/60",
    )}>
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-display text-sm truncate">{otherName || "Member"}</div>
        {c.unread > 0 && (
          <span className="text-[10px] font-mono bg-brass-500 text-navy-950 rounded-full px-1.5 py-0.5">
            {c.unread}
          </span>
        )}
      </div>
      {c.listing && (
        <div className="text-xs text-brass-400 truncate">on {c.listing.title}</div>
      )}
      {c.lastMessage && (
        <div className="text-xs text-muted-foreground truncate mt-1">{c.lastMessage.body}</div>
      )}
      {c.last_message_at && (
        <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{timeAgo(c.last_message_at)} ago</div>
      )}
    </div>
  );
  return (
    <li>
      {onSelect
        ? <button type="button" onClick={() => onSelect(c.id)} className="w-full text-left">{inner}</button>
        : <Link to={`/messages/${c.id}`}>{inner}</Link>}
    </li>
  );
}
