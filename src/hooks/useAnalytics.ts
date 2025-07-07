
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAnalytics() {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      // We are fetching from the 'daily_analytics' VIEW here
      const { data, error } = await supabase.from("daily_analytics").select("*");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}
