
import React from "react";
import useCreatePayment from "@/hooks/useCreatePayment";
import { Button } from "@/components/ui/button";

// PayButton: Handles payments via Stripe.
export default function PayButton({
  amountInCents,
  currency = "usd",
  busId,
  routeId,
  bookingId,
}: {
  amountInCents: number;
  currency?: string;
  busId?: string;
  routeId?: string;
  bookingId?: string;
}) {
  const { initiatePayment, loading } = useCreatePayment();

  const handlePay = async () => {
    const result = await initiatePayment({
      amount: amountInCents,
      currency,
      bus_id: busId,
      route_id: routeId,
      booking_id: bookingId,
    });
    if (result.url) {
      // Store the Stripe session_id in localStorage for later retrieval
      if (result.session_id) {
        localStorage.setItem("last_stripe_session_id", result.session_id);
      }
      // Redirect user in the current tab (not new tab)
      window.location.href = result.url!;
    } else if (result.error) {
      alert(result.error);
    }
  };

  return (
    <Button
      onClick={handlePay}
      disabled={loading}
      className="w-full bg-primary text-white"
    >
      {loading ? "Processing..." : "Pay"}
    </Button>
  );
}
