import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConversationList } from "@/components/messaging/ConversationList";
import { MessageThread } from "@/components/messaging/MessageThread";
import { setMeta } from "@/lib/seo";

export default function Messages() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  useEffect(() => { setMeta({ title: "Messages", description: "Your TradeWind inbox." }); }, []);
  return (
    <div className="-m-8 h-[calc(100vh-0px)] grid grid-cols-[320px_1fr] border-l border-border">
      <ConversationList selectedId={id} onSelect={(cid) => navigate(`/messages/${cid}`)} />
      {id ? (
        <MessageThread conversationId={id} />
      ) : (
        <div className="grid place-items-center text-sm text-muted-foreground">
          Select a conversation to start.
        </div>
      )}
    </div>
  );
}
