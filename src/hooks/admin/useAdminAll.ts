
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminAll(table: "profiles" | "buses" | "bookings" | "orders") {
  return useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table as any).select("*");
      if (error) throw new Error(error.message);
      return data ?? [];
    }
  });
}
