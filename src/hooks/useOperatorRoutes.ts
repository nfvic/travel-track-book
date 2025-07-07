
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

// Hook to fetch routes owned by the current operator
export function useOperatorRoutes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["operator-routes", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("routes")
        .select("*")
        .eq("operator_id", user.id)
        .order("name");
      if (error) throw new Error(error.message);
      return (data ?? []) as Tables<"routes">[];
    },
  });
}
