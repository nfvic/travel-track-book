
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "./useAuth";

export function useGetTicket(bookingId: string | undefined) {
  const { user } = useAuth();

  // Debug: print supabase client at hook load
  if (typeof window !== "undefined") {
    // Is this the right client config?
    console.log("Supabase client config for get-ticket:", supabase);
  }

  return useQuery({
    queryKey: ["get-ticket", bookingId, user?.id],
    enabled: !!user && !!bookingId,
    queryFn: async () => {
      if (!user || !bookingId) throw new Error("Missing user or bookingId");

      try {
        // This invokes the get-ticket Edge Function in YOUR Supabase project
        const { data, error } = await supabase.functions.invoke("get-ticket", {
          body: { booking_id: bookingId },
        });

        console.log("useGetTicket: Supabase.functions.invoke returned:", { data, error });

        if (error || data?.error) {
          console.error("useGetTicket: Error from edge function:", error?.message, data?.error);
          throw new Error(
            error?.message || data?.error || "Failed to fetch ticket"
          );
        }

        if (!data || !data.ticket) {
          console.error("useGetTicket: No ticket returned in data", data);
          throw new Error("No ticket found with this booking ID.");
        }

        return data.ticket;
      } catch (err: any) {
        // Show errors if function couldn't be reached
        console.error("useGetTicket: Exception during invoke", err, { bookingId, user });
        alert(
          "Could not contact the ticket backend. Details: " +
            (err?.message || JSON.stringify(err))
        );
        throw new Error(
          "Could not contact the ticket backend. Details: " +
            (err?.message || JSON.stringify(err))
        );
      }
    },
  });
}
