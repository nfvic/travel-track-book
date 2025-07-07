
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";

// Use this hook to create a booking for a bus
export function useBookBus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bus_id: string) => {
      if (!user?.id) throw new Error("You must be logged in to book.");
      const { error } = await supabase.from("bookings").insert([
        {
          bus_id,
          user_id: user.id,
          status: "reserved",
        },
      ]);
      if (error) throw new Error(error.message);
      // Optionally, refetch bookings or buses if needed
      return true;
    },
    onSuccess: () => {
      // Invalidate queries if you later show bookings
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
