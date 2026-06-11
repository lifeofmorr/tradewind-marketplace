import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { SavedListing, Listing } from "@/types/database";

export const SAVED_PAGE_SIZE = 24;

export interface PaginatedSavedListings {
  saved: (SavedListing & { listing: Listing | null })[];
  total: number;
  page: number;
  pageCount: number;
}

/**
 * A user's saved listings, paginated server-side via `.range()` +
 * `count: "exact"` (same contract as `usePaginatedListings`).
 */
export function useSavedListings(page = 1, pageSize = SAVED_PAGE_SIZE) {
  const { user } = useAuth();
  const safePage = Math.max(1, Math.floor(page));
  return useQuery({
    queryKey: ["saved-listings", user?.id, safePage, pageSize],
    enabled: !!user,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<PaginatedSavedListings> => {
      if (!user) return { saved: [], total: 0, page: 1, pageCount: 1 };
      const from = (safePage - 1) * pageSize;
      const { data, error, count } = await supabase
        .from("saved_listings")
        .select("*, listing:listings(*)", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);
      if (error) {
        if ((error as { code?: string }).code === "PGRST103") {
          const head = await supabase
            .from("saved_listings")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);
          if (head.error) throw head.error;
          const total = head.count ?? 0;
          return { saved: [], total, page: safePage, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
        }
        throw error;
      }
      const total = count ?? 0;
      return {
        saved: (data ?? []) as (SavedListing & { listing: Listing | null })[],
        total,
        page: safePage,
        pageCount: Math.max(1, Math.ceil(total / pageSize)),
      };
    },
  });
}

export function useSavedListingIds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["saved-listing-ids", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<string[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("saved_listings")
        .select("listing_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return (data ?? []).map((r) => (r as { listing_id: string }).listing_id);
    },
  });
}

export function useToggleSave() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { listing_id: string; saved: boolean }) => {
      if (!user) throw new Error("Sign in to save listings");
      if (args.saved) {
        const { error } = await supabase
          .from("saved_listings")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", args.listing_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_listings")
          .insert({ user_id: user.id, listing_id: args.listing_id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["saved-listings"] });
      void qc.invalidateQueries({ queryKey: ["saved-listing-ids"] });
    },
  });
}
