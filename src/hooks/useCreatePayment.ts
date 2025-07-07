
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

type PaymentParams = {
  amount: number; // cents
  currency: string;
  bus_id?: string;
  route_id?: string;
  booking_id?: string;
};

// Note: Now includes session_id!
type PaymentResult = {
  url?: string;
  session_id?: string;
  error?: string;
};

export default function useCreatePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async ({
    amount,
    currency = "usd",
    bus_id,
    route_id,
    booking_id,
  }: PaymentParams): Promise<PaymentResult> => {
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { amount, currency, bus_id, route_id, booking_id },
      });
      setLoading(false);
      if (error || !data?.url) {
        setError(error?.message || "Unable to create payment session");
        return { error: error?.message || "Unable to create payment session" };
      }
      // Success: return url for Stripe redirect, plus session_id if present
      return { url: data.url, session_id: data.session_id };
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setLoading(false);
      return { error: err.message || "Unknown error" };
    }
  };

  return { initiatePayment, loading, error };
}
