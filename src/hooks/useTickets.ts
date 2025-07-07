
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "./useAuth";

// Define Ticket type for what the UI expects
type Ticket = {
  id: string;
  created_at: string;
  status: string;
  bus: {
    id: string;
    name: string;
    plate_number: string;
  } | null;
  order: {
    amount: number;
    status: string | null;
    currency: string;
    stripe_session_id: string | null;
  };
};

export function useTickets() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my_tickets", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Ticket[]> => {
      if (!user?.id) return [];

      // 1. Get all paid orders that the user owns (with booking_id present)
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id, booking_id, amount, status, currency, stripe_session_id")
        .eq("user_id", user.id)
        .eq("status", "paid");

      if (ordersError) throw new Error(ordersError.message);

      const paidOrders = (orders ?? []).filter(
        (o) => o.booking_id != null
      );

      if (paidOrders.length === 0) return [];

      // 2. Fetch associated bookings for each booking_id
      const bookingIds = paidOrders.map((o) => o.booking_id);
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, created_at, status, bus:buses(id, name, plate_number)")
        .in("id", bookingIds);

      if (bookingsError) throw new Error(bookingsError.message);

      // 3. Merge bookings & orders by booking_id
      const tickets: Ticket[] = paidOrders
        .map((order) => {
          const booking = (bookings ?? []).find((b) => b.id === order.booking_id);
          if (!booking) return null;
          return {
            id: booking.id,
            created_at: booking.created_at,
            status: booking.status,
            bus: booking.bus,
            order: {
              amount: order.amount,
              status: order.status,
              currency: order.currency,
              stripe_session_id: order.stripe_session_id,
            },
          };
        })
        .filter(Boolean) as Ticket[];

      // Sort newest first
      tickets.sort((a, b) => (b.created_at.localeCompare(a.created_at)));
      return tickets;
    },
  });
}
