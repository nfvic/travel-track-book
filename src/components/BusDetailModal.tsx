import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import NearbyBookingButton from "@/components/NearbyBookingButton";
import { useBookBus } from "@/hooks/useBookBus";
import { toast } from "sonner";
import useCreatePayment from "@/hooks/useCreatePayment";
import usePaystack, { PAYSTACK_PUBLIC_KEY } from "@/hooks/usePaystack";
import { verifyPaystackPayment } from "@/hooks/useCreatePaystackOrder";
import useAuth from "@/hooks/useAuth";

type BusDetailModalProps = {
  bus: any | null;
  open: boolean;
  onClose: () => void;
};

function getAvailableSeats(bus: any) {
  if (!bus?.total_seats) return "N/A";
  const total = bus.total_seats;
  let booked = 0;
  if (bus.trips && Array.isArray(bus.trips)) {
    for (const trip of bus.trips) {
      if (Array.isArray(trip.bookings)) {
        booked += trip.bookings.length;
      }
    }
  } else if (Array.isArray(bus.bookings)) {
    booked = bus.bookings.length;
  } else if (typeof bus.bookings_count === "number") {
    booked = bus.bookings_count;
  }
  const available = Math.max(0, total - booked);
  return available;
}

export default function BusDetailModal({ bus, open, onClose }: BusDetailModalProps) {
  if (!bus) return null;

  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const [paymentSuccess, setPaymentSuccess] = React.useState(false);

  const { payWithPaystack } = usePaystack();
  const { user } = useAuth();

  React.useEffect(() => {
    if (!open) {
      setPaymentLoading(false);
      setPaymentSuccess(false);
    }
  }, [open, bus?.id]);

  const busTrip = bus?.trips && bus.trips.length > 0 ? bus.trips[0] : null;
  const busLat = busTrip?.location_lat ?? null;
  const busLng = busTrip?.location_lng ?? null;

  // Only paid bookings decrease seats
  const paidBookings = Array.isArray(bus.bookings)
    ? bus.bookings.filter((b: any) => b.status === "paid")
    : [];
  const availableSeats = typeof bus.total_seats === "number"
    ? Math.max(0, bus.total_seats - paidBookings.length)
    : "N/A";

  const fareInCents =
    typeof bus?.price_cents === "number"
      ? bus.price_cents
      : typeof bus?.route?.price_cents === "number"
      ? bus.route.price_cents
      : typeof bus?.trip?.route?.price_cents === "number"
      ? bus.trip.route.price_cents
      : 500;

  // Handler: Trigger Paystack checkout, then verify payment, then create booking+order
  const handlePayAndBook = () => {
    if (!user?.email || !user?.id) {
      toast.error("Please log in to book and pay.");
      return;
    }
    let payAmount = fareInCents * 100;
    setPaymentLoading(true);

    payWithPaystack({
      email: user.email,
      amount: payAmount,
      reference: `BUS-${bus.id}-${Date.now()}`,
      onSuccess: async (reference) => {
        // After payment, verify and create booking/order
        const result = await verifyPaystackPayment({
          reference,
          bus_id: bus.id,
          route_id: bus.route_id ?? bus.route?.id,
          amount: payAmount,
          currency: "KES",
          user_id: user.id,
          user_email: user.email,
        });
        setPaymentLoading(false);
        if (result.success) {
          setPaymentSuccess(true);
          toast.success("Payment verified! Ticket generated and seat confirmed.");
        } else {
          toast.error(result.error || "Payment verification failed. Contact support.");
        }
      },
      onClose: () => {
        setPaymentLoading(false);
        toast("You closed the payment window. No seat reserved.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{bus.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Plate: {bus.plate_number}</div>
          <div className="text-sm">Total Seats: {typeof bus.total_seats === "number" ? bus.total_seats : "N/A"}</div>
          <div className="text-sm">Seats Available: {availableSeats}</div>
          <div className="text-xs text-muted-foreground">
            Added: {bus.created_at?.substring(0, 10)}
          </div>
          <div className="text-sm">
            Fare: <span className="font-semibold">KES {(fareInCents / 100).toLocaleString()}</span>
          </div>
        </div>
        <DialogFooter className="flex flex-col gap-2 w-full">
          {/* Pay & Book button, only if seats are left */}
          {typeof availableSeats === "number" && availableSeats > 0 && !paymentLoading && !paymentSuccess && (
            <Button
              className="w-full"
              disabled={paymentLoading}
              onClick={handlePayAndBook}
            >
              Pay & Book
            </Button>
          )}
          {paymentLoading && (
            <div className="rounded bg-green-100 text-green-800 px-3 py-2 text-center text-sm">
              Starting payment...
            </div>
          )}
          {paymentSuccess && (
            <div className="rounded bg-green-100 text-green-800 px-3 py-2 text-center text-sm">
              Ticket generated and seat confirmed! Check your tickets page.
            </div>
          )}
          {typeof availableSeats === "number" && availableSeats === 0 && (
            <div className="rounded bg-yellow-100 text-yellow-800 px-3 py-2 text-center text-sm">
              This bus is fully booked.
            </div>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
