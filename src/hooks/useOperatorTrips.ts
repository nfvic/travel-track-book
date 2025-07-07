
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Fetch trips for a given bus owned by current operator
export function useOperatorTrips(busId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["operator-trips", user?.id, busId],
    enabled: !!user?.id && !!busId,
    queryFn: async () => {
      if (!busId || !user?.id) return [];
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("bus_id", busId)
        .order("started_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Tables<"trips">[];
    },
  });
}

// For add/edit/delete a trip for a bus you own
export function useUpsertTrip(busId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (values: Omit<TablesInsert<"trips">, "id"> & { id?: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      if (!busId) throw new Error("Invalid bus");
      if (values.id) {
        // UPDATE (ownership checked via RLS)
        const { error } = await supabase
          .from("trips")
          .update({
            current_stage: values.current_stage,
            driver_name: values.driver_name,
            gps_path: values.gps_path,
            delay_reason: values.delay_reason,
            status: values.status,
            is_active: values.is_active,
            started_at: values.started_at,
            completed_at: values.completed_at,
            route_id: values.route_id,
          } as TablesUpdate<"trips">)
          .eq("id", values.id)
          .eq("bus_id", busId);
        if (error) throw new Error(error.message);
      } else {
        // INSERT (ownership checked via RLS)
        const { error } = await supabase
          .from("trips")
          .insert([
            {
              bus_id: busId,
              route_id: values.route_id,
              current_stage: values.current_stage,
              driver_name: values.driver_name,
              gps_path: values.gps_path,
              delay_reason: values.delay_reason,
              status: values.status,
              is_active: values.is_active ?? true,
              started_at: values.started_at,
              completed_at: values.completed_at,
            }
          ]);
        if (error) throw new Error(error.message);
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-trips"] });
    }
  });
}

export function useDeleteTrip(busId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (tripId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("trips")
        .delete()
        .eq("id", tripId)
        .eq("bus_id", busId);
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-trips"] });
    }
  });
}
