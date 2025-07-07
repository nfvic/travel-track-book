
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

// Fetch all buses owned by the current operator with location info
export function useOperatorBusLocations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["operator-bus-locations", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("buses")
        .select("*")
        .eq("owner_id", user!.id)
        .not("location_lat", "is", null)
        .not("location_lng", "is", null);
      if (error) throw new Error(error.message);
      return (data ?? []) as Tables<"buses">[];
    },
    refetchInterval: 10000, // update every 10 seconds for near real-time
  });
}
