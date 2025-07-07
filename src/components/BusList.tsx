import React from "react";
import BusDetailModal from "@/components/BusDetailModal";

function getAvailableSeats(bus: any) {
  if (!bus?.total_seats) return "N/A";
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
  const available = Math.max(0, bus.total_seats - booked);
  return available;
}

const BusList = ({ buses, onSelect }: { buses: any[]; onSelect: (bus: any) => void }) => {
  if (!buses || buses.length === 0) {
    return <div className="p-4 rounded bg-muted text-muted-foreground text-center">No buses found.</div>;
  }
  return (
    <div className="space-y-2">
      {buses.map(bus => (
        <div
          key={bus.id}
          className="cursor-pointer border rounded-lg px-3 py-2 hover:bg-accent transition flex items-center justify-between"
          onClick={() => onSelect(bus)}
        >
          <div>
            <div className="font-semibold">{bus.name}</div>
            <div className="text-xs text-muted-foreground">
              Plate: {bus.plate_number}
              {" · "}
              Seats: {typeof bus.total_seats === "number" ? bus.total_seats : "N/A"}
              {" · "}
              Avail: {getAvailableSeats(bus)}
            </div>
          </div>
          <div>
            <span className="text-xs text-primary hover:underline">Details</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BusList;
