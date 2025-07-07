
import { useState } from "react";

/**
 * Haversine formula to compute distance between (lat1, lng1) and (lat2, lng2) in meters.
 */
function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371e3; // earth radius in meters
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

type UseNearbyBusCheckOptions = {
  busLat: number | null | undefined;
  busLng: number | null | undefined;
  distanceLimit?: number; // meters, default 100
};

export default function useNearbyBusCheck({
  busLat,
  busLng,
  distanceLimit = 100,
}: UseNearbyBusCheckOptions) {
  const [isNearby, setIsNearby] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Call this to check proximity
  const check = () => {
    setError(null);
    setIsChecking(true);
    if (
      typeof busLat !== "number" ||
      typeof busLng !== "number" ||
      isNaN(busLat) ||
      isNaN(busLng)
    ) {
      setError("Bus location unavailable.");
      setIsNearby(false);
      setIsChecking(false);
      return;
    }
    if (!navigator.geolocation) {
      setError("Geolocation not supported in your browser.");
      setIsNearby(false);
      setIsChecking(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const dist = getDistanceMeters(latitude, longitude, busLat, busLng);
        setIsNearby(dist <= distanceLimit);
        setIsChecking(false);
        if (dist > distanceLimit) {
          setError(
            `You are ${Math.round(dist)}m away. Please get closer to the bus to book.`
          );
        }
      },
      (err) => {
        setError("Could not get your location.");
        setIsChecking(false);
        setIsNearby(false);
      }
    );
  };

  // Reset all state (for new modal/bus)
  const reset = () => {
    setIsNearby(false);
    setIsChecking(false);
    setError(null);
  };

  return { isNearby, isChecking, error, check, reset };
}
