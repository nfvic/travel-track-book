
import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  onGranted?: () => void;
  onDenied?: () => void;
  triggerOnMount?: boolean;
};

// Utility to check geolocation permission status (async)
const checkLocationPermission = async (): Promise<"granted" | "prompt" | "denied"> => {
  if (!navigator.permissions) return "prompt";
  try {
    // @ts-ignore
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state;
  } catch {
    return "prompt";
  }
};

export default function LocationPermissionPrompt({ onGranted, onDenied, triggerOnMount }: Props) {
  const [status, setStatus] = React.useState<"unknown" | "granted" | "prompt" | "denied">("unknown");
  const [error, setError] = React.useState<string | null>(null);

  // Check permission status on mount
  React.useEffect(() => {
    checkLocationPermission().then(result => setStatus(result)).catch(() => setStatus("prompt"));
  }, []);

  // Function to request geo permission
  const requestPermission = React.useCallback(() => {
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in your browser.");
      setStatus("denied");
      onDenied?.();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setStatus("granted");
        onGranted?.();
      },
      () => {
        setStatus("denied");
        setError("Location access denied. Enable location in your browser settings to use bus booking, or try again.");
        onDenied?.();
      }
    );
  }, [onGranted, onDenied]);

  // Auto-trigger permission request on mount if needed
  React.useEffect(() => {
    if (triggerOnMount && (status === "prompt" || status === "unknown")) {
      requestPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerOnMount, status]);

  // If granted, hide the prompt entirely
  if (status === "granted") return null;

  return (
    <div className="w-full rounded border border-yellow-300 bg-yellow-50 px-4 py-3 my-2 flex flex-col items-center gap-2">
      <div className="text-yellow-800 font-medium text-sm pb-1">Location access required to book a bus seat.</div>
      <div className="text-yellow-800 text-xs pb-2">
        {status === "denied"
          ? "Enable location permission in your browser settings and reload this page, or try again below."
          : "We need your location to verify you are near the bus for booking."}
      </div>
      {error && <div className="text-destructive text-xs">{error}</div>}
      {/* Always show the button unless permission is granted */}
      <Button variant="outline" onClick={requestPermission}>
        Allow Location Access
      </Button>
    </div>
  );
}
