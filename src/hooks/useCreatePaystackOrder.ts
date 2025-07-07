
// Verify Paystack transaction, then create ticket/booking and order in Supabase via Edge Function
import { supabase } from "@/integrations/supabase/client";

export async function verifyPaystackPayment({
  reference,
  bus_id,
  route_id,
  amount,
  currency,
  user_id,
  user_email,
}: {
  reference: string;
  bus_id: string;
  route_id?: string;
  amount: number;
  currency: string;
  user_id?: string;
  user_email?: string;
}): Promise<{ success: boolean; booking?: any; order?: any; error?: string }> {
  const { data, error } = await supabase.functions.invoke("paystack-verify", {
    body: {
      reference,
      bus_id,
      route_id,
      amount,
      currency,
      user_id,
      user_email
    },
  });
  if (error || data?.error) return { success: false, error: error?.message || data?.error };
  return { success: true, booking: data.booking, order: data.order };
}
