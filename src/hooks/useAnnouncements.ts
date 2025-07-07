
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

// Hook to fetch announcements for a specific trip
export function useAnnouncements(tripId: string) {
  return useQuery({
    queryKey: ["announcements", tripId],
    enabled: !!tripId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as Tables<"announcements">[];
    },
  });
}

// Hook to create a new announcement
export function useCreateAnnouncement(tripId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      if (!tripId) throw new Error("Trip ID is required");

      const newAnnouncement: TablesInsert<"announcements"> = {
        trip_id: tripId,
        operator_id: user.id,
        message,
      };

      const { error } = await supabase.from("announcements").insert([newAnnouncement]);
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements", tripId] });
    },
  });
}
