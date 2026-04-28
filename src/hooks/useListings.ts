import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Listing, ListingCategory, ListingStatus } from "@/types/database";

export interface UseListingsArgs {
  category?: ListingCategory;
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

export function useListings(args: UseListingsArgs = {}) {
  return useQuery({
    queryKey: ["listings", args],
    queryFn: async (): Promise<Listing[]> => {
      let q = supabase.from("listings").select("*");
      if (args.status) q = q.eq("status", args.status);
      if (args.category) q = q.eq("category", args.category);
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
      if (args.limit) q = q.limit(args.limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Listing[];
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
