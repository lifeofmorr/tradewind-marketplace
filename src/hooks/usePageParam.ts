import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/** Parses a `?page=` value: positive integers pass through, junk becomes 1. */
export function parsePageParam(raw: string | null): number {
  if (!raw) return 1;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export interface SetPageOptions {
  /** Scroll back to the top of the results (default true). */
  scroll?: boolean;
}

/**
 * URL-synced page state (`?page=N`). Page 1 removes the param so canonical
 * URLs stay clean; back/forward navigation restores the page naturally.
 */
export function usePageParam(): [number, (page: number, opts?: SetPageOptions) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePageParam(searchParams.get("page"));
  const setPage = useCallback(
    (next: number, opts?: SetPageOptions) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        if (next <= 1) params.delete("page");
        else params.set("page", String(next));
        return params;
      });
      if (opts?.scroll !== false) window.scrollTo({ top: 0 });
    },
    [setSearchParams],
  );
  return [page, setPage];
}
