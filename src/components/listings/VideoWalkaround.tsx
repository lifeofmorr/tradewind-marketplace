import { Film } from "lucide-react";

interface Props {
  url: string | null | undefined;
  title?: string;
}

interface ParsedVideo {
  kind: "youtube" | "vimeo" | "file";
  embed: string;
}

const YT = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/i;
const VIMEO = /vimeo\.com\/(?:video\/)?(\d+)/i;
const FILE_EXT = /\.(mp4|webm|mov|m4v|ogv)(?:$|\?)/i;

function parse(url: string): ParsedVideo | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  const yt = trimmed.match(YT);
  if (yt) return { kind: "youtube", embed: `https://www.youtube.com/embed/${yt[1]}` };
  const vm = trimmed.match(VIMEO);
  if (vm) return { kind: "vimeo", embed: `https://player.vimeo.com/video/${vm[1]}` };
  if (FILE_EXT.test(trimmed) || trimmed.startsWith("http")) {
    return { kind: "file", embed: trimmed };
  }
  return null;
}

export function VideoWalkaround({ url, title }: Props) {
  if (!url) return null;
  const parsed = parse(url);
  if (!parsed) return null;

  return (
    <section aria-labelledby="video-walkaround">
      <div className="flex items-center gap-2 mb-3">
        <Film className="h-4 w-4 text-brass-400" />
        <span id="video-walkaround" className="font-mono text-[10px] uppercase tracking-[0.32em] text-brass-400">
          Video walkaround
        </span>
      </div>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
        {parsed.kind === "file" ? (
          <video
            src={parsed.embed}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full"
            aria-label={title ? `${title} walkaround video` : "Listing walkaround video"}
          />
        ) : (
          <iframe
            src={parsed.embed}
            title={title ? `${title} walkaround` : "Listing walkaround"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 h-full w-full"
          />
        )}
      </div>
    </section>
  );
}
