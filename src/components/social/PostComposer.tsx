import { useState } from "react";
import { Image as ImageIcon, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PostType } from "./PostCard";

const POST_TYPES: Array<{ value: PostType; label: string }> = [
  { value: "lifestyle",        label: "Lifestyle" },
  { value: "inventory_update", label: "Inventory" },
  { value: "market_insight",   label: "Market" },
  { value: "tip",              label: "Tip" },
  { value: "dealer_spotlight", label: "Spotlight" },
];

interface Props {
  onPost?: (input: { content: string; postType: PostType }) => Promise<void> | void;
  busy?: boolean;
}

export function PostComposer({ onPost, busy = false }: Props) {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("lifestyle");
  const canPost = content.trim().length > 0 && !busy;

  async function submit() {
    if (!canPost) return;
    await onPost?.({ content: content.trim(), postType });
    setContent("");
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share an inventory update, sea trial story, or market take…"
        rows={3}
        disabled={busy}
        className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground resize-none disabled:opacity-60"
        aria-label="Post content"
      />
      <div className="flex flex-wrap gap-1.5">
        {POST_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setPostType(t.value)}
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.18em] border transition-colors",
              postType === t.value
                ? "border-brass-500/60 bg-brass-500/10 text-brass-300"
                : "border-border text-muted-foreground hover:text-foreground hover:border-brass-500/40",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Attach photo (coming soon)"
          title="Photo attach is coming soon"
        >
          <ImageIcon className="h-4 w-4" />
          Photo
        </button>
        <Button size="sm" onClick={submit} disabled={!canPost}>
          <Send className="h-4 w-4 mr-1.5" />
          {busy ? "Posting…" : "Post"}
        </Button>
      </div>
    </div>
  );
}
