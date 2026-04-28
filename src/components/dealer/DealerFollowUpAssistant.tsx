import { useEffect, useMemo, useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { generateFollowUp, type FollowUpType } from "@/lib/dealerFollowUp";
import type { Inquiry } from "@/types/database";

interface Props {
  inquiry: Inquiry;
  listingTitle?: string | null;
  dealerName?: string | null;
  agentName?: string | null;
}

export function DealerFollowUpAssistant({ inquiry, listingTitle, dealerName, agentName }: Props) {
  const [type, setType] = useState<FollowUpType>("first_reply");
  const initial = useMemo(
    () => generateFollowUp(inquiry, type, { listing_title: listingTitle ?? null, dealer_name: dealerName ?? null, agent_name: agentName ?? null }),
    [inquiry, type, listingTitle, dealerName, agentName],
  );
  const [draft, setDraft] = useState(initial);
  const [copied, setCopied] = useState(false);

  useEffect(() => { setDraft(initial); }, [initial]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card/50 p-4 mt-3">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-3 w-3 text-brass-400" />
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-brass-400">Powered by AI</span>
        <span className="text-xs text-muted-foreground">— suggested reply</span>
      </div>
      <Tabs value={type} onValueChange={(v) => setType(v as FollowUpType)}>
        <TabsList>
          <TabsTrigger value="first_reply">First reply</TabsTrigger>
          <TabsTrigger value="follow_up">Follow-up</TabsTrigger>
          <TabsTrigger value="still_interested">Still interested?</TabsTrigger>
        </TabsList>
      </Tabs>
      <Textarea
        rows={10}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="mt-3 font-sans text-sm"
      />
      <div className="mt-2 flex items-center gap-2">
        <Button size="sm" onClick={() => { void copy(); }}>
          {copied ? <><Check className="h-3 w-3 mr-1" /> Copied</> : <><Copy className="h-3 w-3 mr-1" /> Copy</>}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setDraft(initial)}>Reset</Button>
      </div>
    </div>
  );
}
