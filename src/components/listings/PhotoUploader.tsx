import { useRef, useState, type ChangeEvent } from "react";
import { Upload, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase, publicStorageUrl } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const BUCKET = "listings-photos";

interface UploadedPhoto {
  storage_path: string;
  url: string | null;
}

interface EnhanceResult {
  url: string;
  enhancements: string[];
}

interface Props {
  /** owner uuid (seller_id OR dealer_id) — first path segment */
  ownerId: string;
  listingId: string;
  initial?: UploadedPhoto[];
  onChange?: (photos: UploadedPhoto[]) => void;
  className?: string;
}

/**
 * Path convention: listings-photos/{ownerId}/{listingId}/{idx}-{filename}
 * That first path segment is what storage RLS uses to authorize writes.
 */
export function PhotoUploader({ ownerId, listingId, initial = [], onChange, className }: Props) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>(initial);
  const [busy, setBusy] = useState(false);
  const [enhancing, setEnhancing] = useState<string | null>(null);
  const [enhancedNote, setEnhancedNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function emit(next: UploadedPhoto[]) {
    setPhotos(next);
    onChange?.(next);
  }

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    setError(null);
    const next = [...photos];
    for (const [i, file] of files.entries()) {
      const idx = next.length + i;
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${ownerId}/${listingId}/${idx}-${safe}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (upErr) {
        setError(upErr.message);
        break;
      }
      next.push({ storage_path: path, url: publicStorageUrl(BUCKET, path) });
    }
    emit(next);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function enhance(p: UploadedPhoto) {
    if (!p.url) return;
    setEnhancing(p.storage_path);
    setError(null);
    setEnhancedNote(null);
    try {
      const { data, error: e } = await supabase.functions.invoke<EnhanceResult>("photo-enhance", {
        body: { url: p.url },
      });
      if (e) throw e;
      setEnhancedNote(`Enhanced (${data?.enhancements?.length ?? 0} steps applied).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enhance failed");
    } finally {
      setEnhancing(null);
    }
  }

  async function remove(p: UploadedPhoto) {
    const { error: rmErr } = await supabase.storage.from(BUCKET).remove([p.storage_path]);
    if (rmErr) {
      setError(rmErr.message);
      return;
    }
    emit(photos.filter((x) => x.storage_path !== p.storage_path));
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {photos.map((p) => (
          <div key={p.storage_path} className="relative aspect-square rounded-md overflow-hidden border border-border group">
            {p.url && <img src={p.url} alt="" className="h-full w-full object-cover" />}
            <button
              type="button"
              onClick={() => { void remove(p); }}
              className="absolute top-1 right-1 rounded-full bg-background/70 p-1 hover:bg-background"
              aria-label="remove photo"
            >
              <X className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => { void enhance(p); }}
              disabled={enhancing === p.storage_path}
              className="absolute bottom-1 left-1 rounded-full bg-background/70 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background disabled:opacity-50"
              aria-label="enhance photo"
              title="AI enhance"
            >
              <Sparkles className="h-3 w-3 text-brass-400" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="aspect-square rounded-md border border-dashed border-border grid place-items-center text-xs text-muted-foreground hover:text-foreground hover:border-brass-500/50"
        >
          <Upload className="h-4 w-4 mb-1" />
          {busy ? "Uploading…" : "Add"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => { void handleFiles(e); }}
        className="hidden"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{photos.length} photo{photos.length === 1 ? "" : "s"}</span>
        {photos.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => emit([])}>Clear</Button>
        )}
      </div>
      {enhancedNote && <p className="text-xs text-emerald-400">{enhancedNote}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
