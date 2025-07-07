
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fetch all active trips with live GPS and their bus info
export function useLiveBusLocations() {
  return useQuery({
    queryKey: ["live_bus_locations"],
    queryFn: async () => {
      // Only get active trips with a current location
      const { data, error } = await supabase
        .from("trips")
        .select(`
          id,
          bus_id,
          route_id,
          driver_name,
          current_stage,
          status,
          is_active,
          location_lat,
          location_lng,
          started_at,
          completed_at,
          buses (
            id,
            name,
            plate_number,
            total_seats
          ),
          routes (
            id,
            name,
            stages
          )
        `)
        .eq("is_active", true)
        .not("location_lat", "is", null)
        .not("location_lng", "is", null);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    refetchInterval: 10000 // 10s for near real-time
  });
}
