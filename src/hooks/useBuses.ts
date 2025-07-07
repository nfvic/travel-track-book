
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export function useBuses() {
  return useQuery({
    queryKey: ["buses"],
    queryFn: async () => {
      // Now that a trips.route_id -> routes.id foreign key exists,
      // we can use a nested select joining trips to their route, and route details.
      const { data, error } = await supabase
        .from("buses")
        .select(`
          *,
          trips:trips(
            id,
            bus_id,
            route_id,
            current_stage,
            status,
            is_active,
            started_at,
            completed_at,
            driver_name,
            delay_reason,
            routes(
              id,
              name,
              price_cents,
              stages
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      // Returns buses enriched with trip & route pricing info (most recent trip per bus)
      return (data ?? []).map((bus: any) => {
        let price = null;
        let routeName = null;
        if (bus.trips && bus.trips.length > 0) {
          // In case of multiple trips, just use the latest one
          const latestTrip = bus.trips[0];
          price = latestTrip.routes?.price_cents ?? null;
          routeName = latestTrip.routes?.name ?? null;
        }
        return {
          ...bus,
          price_cents: price,
          route_name: routeName
        };
      });
    },
  });
}

