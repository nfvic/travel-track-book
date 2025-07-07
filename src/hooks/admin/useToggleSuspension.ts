
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useToggleSuspension(table: "profiles" | "buses") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_suspended }: { id: string; is_suspended: boolean }) => {
      const { error } = await supabase
        .from(table)
        .update({ is_suspended })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", table] });
      toast.success(`Updated suspension for ${table === "profiles" ? "user" : "bus"}.`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update.");
    }
  });
}
