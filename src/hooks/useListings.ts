import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Listing, ListingCategory, ListingStatus } from "@/types/database";

export interface UseListingsArgs {
  category?: ListingCategory;
  categories?: ListingCategory[];
  status?: ListingStatus;
  state?: string;
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  search?: string;
  seller_id?: string;
  dealer_id?: string;
  is_featured?: boolean;
  limit?: number;
  order?: "newest" | "price_asc" | "price_desc";
}

/** Minimal structural view of a PostgREST filter builder. */
interface FilterableQuery {
  eq: (col: string, v: unknown) => FilterableQuery;
  in: (col: string, v: unknown[]) => FilterableQuery;
  gte: (col: string, v: number) => FilterableQuery;
  lte: (col: string, v: number) => FilterableQuery;
  or: (f: string) => FilterableQuery;
  order: (col: string, opts?: { ascending?: boolean; nullsFirst?: boolean }) => FilterableQuery;
}

/** Applies the shared filter/order set to a listings query builder. */
function applyListingFilters<Q>(query: Q, args: UseListingsArgs): Q {
  let q = query as unknown as FilterableQuery;
  if (args.status) q = q.eq("status", args.status);
  if (args.category) q = q.eq("category", args.category);
  if (args.categories && args.categories.length > 0) q = q.in("category", args.categories);
  if (args.state) q = q.eq("state", args.state.toUpperCase());
  if (args.seller_id) q = q.eq("seller_id", args.seller_id);
  if (args.dealer_id) q = q.eq("dealer_id", args.dealer_id);
  if (typeof args.is_featured === "boolean") q = q.eq("is_featured", args.is_featured);
  if (typeof args.min_price === "number") q = q.gte("price_cents", args.min_price);
  if (typeof args.max_price === "number") q = q.lte("price_cents", args.max_price);
  if (typeof args.min_year === "number") q = q.gte("year", args.min_year);
  if (typeof args.max_year === "number") q = q.lte("year", args.max_year);
  if (args.search) {
    const escaped = args.search.replace(/[%,]/g, "");
    q = q.or(`title.ilike.%${escaped}%,make.ilike.%${escaped}%,model.ilike.%${escaped}%`);
  }
  if (args.order === "price_asc") q = q.order("price_cents", { ascending: true, nullsFirst: false });
  else if (args.order === "price_desc") q = q.order("price_cents", { ascending: false, nullsFirst: false });
  else q = q.order("created_at", { ascending: false });
  return q as unknown as Q;
}

export function useListings(args: UseListingsArgs = {}) {
  return useQuery({
    queryKey: ["listings", args],
    queryFn: async (): Promise<Listing[]> => {
      let q = applyListingFilters(supabase.from("listings").select("*"), args);
      if (args.limit) q = q.limit(args.limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Listing[];
    },
  });
}

export const LISTINGS_PAGE_SIZE = 24;

export interface PaginatedListings {
  listings: Listing[];
  /** Total rows matching the filters (across all pages). */
  total: number;
  page: number;
  pageCount: number;
}

export interface UsePaginatedListingsArgs extends Omit<UseListingsArgs, "limit"> {
  /** 1-based page number. */
  page?: number;
  pageSize?: number;
}

/**
 * Server-side pagination via PostgREST `.range()` + `count: "exact"`.
 * If the requested page is past the end (e.g. a stale `?page=9` URL after
 * listings were removed), it returns the real total with an empty page so
 * the UI can clamp instead of erroring.
 */
export function usePaginatedListings(args: UsePaginatedListingsArgs = {}) {
  const { page: rawPage, pageSize: rawSize, ...filters } = args;
  const page = Math.max(1, Math.floor(rawPage ?? 1));
  const pageSize = Math.max(1, rawSize ?? LISTINGS_PAGE_SIZE);
  return useQuery({
    queryKey: ["listings", "paginated", filters, page, pageSize],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<PaginatedListings> => {
      const from = (page - 1) * pageSize;
      const q = applyListingFilters(
        supabase.from("listings").select("*", { count: "exact" }),
        filters,
      ).range(from, from + pageSize - 1);
      const { data, error, count } = await q;
      if (error) {
        // PGRST103: requested range not satisfiable — the page is past the
        // end. Fetch the count alone so the caller can clamp.
        if ((error as { code?: string }).code === "PGRST103") {
          const head = await applyListingFilters(
            supabase.from("listings").select("*", { count: "exact", head: true }),
            filters,
          );
          if (head.error) throw head.error;
          const total = head.count ?? 0;
          return { listings: [], total, page, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
        }
        throw error;
      }
      const total = count ?? 0;
      return {
        listings: (data ?? []) as Listing[],
        total,
        page,
        pageCount: Math.max(1, Math.ceil(total / pageSize)),
      };
    },
  });
}

export function useListing(slug: string | undefined) {
  return useQuery({
    queryKey: ["listing", slug],
    enabled: !!slug,
    queryFn: async (): Promise<Listing | null> => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data as Listing | null) ?? null;
    },
  });
}
