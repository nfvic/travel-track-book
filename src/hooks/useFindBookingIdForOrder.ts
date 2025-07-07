
import { supabase } from "@/integrations/supabase/client";

// Helper: get booking_id from a Stripe session/order id
export async function findBookingIdFromOrderSession(orderSessionId: string): Promise<string | null> {
  // Look in orders, try by stripe_session_id (for Stripe) or reference (for Paystack)
  const { data, error } = await supabase
    .from("orders")
    .select("booking_id")
    .or(`stripe_session_id.eq.${orderSessionId},paystack_reference.eq.${orderSessionId}`)
    .maybeSingle();
  if (error || !data?.booking_id) return null;
  return data.booking_id;
}
