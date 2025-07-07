
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

// Get all buses belonging to this operator
export function useOperatorBuses() {
  const { user } = useAuth();
  // If not loaded yet, return empty array and do not query
  return useQuery({
    queryKey: ["operator-buses", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // Only get buses with matching owner_id
      const { data, error } = await supabase
        .from("buses")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Tables<"buses">[];
    },
  });
}

// For add/edit bus
export function useUpsertBus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      bus: Omit<TablesInsert<"buses">, "id" | "owner_id"> & { id?: string }
    ) => {
      if (!user?.id) throw new Error("Not authenticated");
      if (bus.id) {
        // Update (ownership check enforced by RLS)
        const { error } = await supabase
          .from("buses")
          .update({ name: bus.name, plate_number: bus.plate_number, total_seats: bus.total_seats })
          .eq("id", bus.id)
          .eq("owner_id", user.id);
        if (error) throw new Error(error.message);
      } else {
        // Insert (set owner_id)
        const { error } = await supabase
          .from("buses")
          .insert([
            {
              name: bus.name,
              plate_number: bus.plate_number,
              total_seats: bus.total_seats,
              owner_id: user.id,
            },
          ]);
        if (error) throw new Error(error.message);
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-buses"] });
    },
  });
}
