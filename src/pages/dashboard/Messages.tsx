import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ConversationList } from "@/components/messaging/ConversationList";
import { MessageThread } from "@/components/messaging/MessageThread";
import { setMeta } from "@/lib/seo";

export default function Messages() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  useEffect(() => { setMeta({ title: "Messages", description: "Your TradeWind inbox." }); }, []);

  return (
    <div className="-m-4 md:-m-8 min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-0px)] md:grid md:grid-cols-[320px_1fr] border-l border-border">
      {/* Mobile: show list when no thread selected; show thread otherwise */}
      <div className={id ? "hidden md:block" : "block"}>
        <ConversationList selectedId={id} onSelect={(cid) => navigate(`/messages/${cid}`)} />
      </div>
      <div className={id ? "block" : "hidden md:block"}>
        {id ? (
          <div className="flex flex-col h-full">
            <button
              type="button"
              onClick={() => navigate("/messages")}
              className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-border text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> All conversations
            </button>
            <div className="flex-1 min-h-0">
              <MessageThread conversationId={id} />
            </div>
          </div>
        ) : (
          <div className="grid place-items-center text-sm text-muted-foreground h-full p-8">
            Select a conversation to start.
          </div>
        )}
      </div>
    </div>
  );
}
