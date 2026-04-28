import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Listing } from "@/types/database";

interface CompareCtx {
  ids: string[];
  count: number;
  isFull: boolean;
  has: (id: string) => boolean;
  add: (listing: Pick<Listing, "id">) => void;
  remove: (id: string) => void;
  toggle: (listing: Pick<Listing, "id">) => void;
  clear: () => void;
}

const CompareContext = createContext<CompareCtx | null>(null);

const MAX = 3;
const STORAGE_KEY = "tw:compare:ids";

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setIds(parsed.slice(0, MAX));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [ids]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const add = useCallback((listing: Pick<Listing, "id">) => {
    setIds((curr) => {
      if (curr.includes(listing.id)) return curr;
      if (curr.length >= MAX) return curr;
      return [...curr, listing.id];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setIds((curr) => curr.filter((x) => x !== id));
  }, []);

  const toggle = useCallback((listing: Pick<Listing, "id">) => {
    setIds((curr) =>
      curr.includes(listing.id)
        ? curr.filter((x) => x !== listing.id)
        : curr.length >= MAX
        ? curr
        : [...curr, listing.id],
    );
  }, []);

  const clear = useCallback(() => setIds([]), []);

  const value = useMemo<CompareCtx>(
    () => ({
      ids,
      count: ids.length,
      isFull: ids.length >= MAX,
      has,
      add,
      remove,
      toggle,
      clear,
    }),
    [ids, has, add, remove, toggle, clear],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used inside CompareProvider");
  return ctx;
}

export const COMPARE_MAX = MAX;
