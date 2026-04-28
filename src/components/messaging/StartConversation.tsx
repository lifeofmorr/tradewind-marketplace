import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStartConversation } from "@/hooks/useConversations";
import { Button, type ButtonProps } from "@/components/ui/button";

interface Props extends Omit<ButtonProps, "onClick" | "children"> {
  otherId: string;
  listingId?: string | null;
  label?: string;
}

export function StartConversation({ otherId, listingId, label = "Message", ...rest }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const start = useStartConversation();
  const [error, setError] = useState<string | null>(null);

  async function go() {
    if (!user) { navigate("/login"); return; }
    if (otherId === user.id) return;
    setError(null);
    try {
      const id = await start.mutateAsync({ other_id: otherId, listing_id: listingId ?? null });
      navigate(`/messages/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start conversation");
    }
  }

  return (
    <>
      <Button {...rest} onClick={() => { void go(); }} disabled={start.isPending || rest.disabled}>
        <MessageSquare className="h-4 w-4" />
        {start.isPending ? "Opening…" : label}
      </Button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </>
  );
}
