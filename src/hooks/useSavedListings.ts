import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { SavedListing, Listing } from "@/types/database";

export function useSavedListings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["saved-listings", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<(SavedListing & { listing: Listing | null })[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("saved_listings")
        .select("*, listing:listings(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as (SavedListing & { listing: Listing | null })[];
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
