
import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  busId: string;
  busLat: number | null | undefined;
  busLng: number | null | undefined;
  onBook: () => void;
  open?: boolean;
};

export default function NearbyBookingButton({ onBook }: Props) {
  // Always allow booking now; no distance checks or geolocation needed.
  return (
    <div>
      <Button
        className="w-full"
        onClick={onBook}
      >
        Book Seat
      </Button>
    </div>
  );
}
