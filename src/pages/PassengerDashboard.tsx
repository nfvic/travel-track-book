import Map from "@/components/Map";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import BusList from "@/components/BusList";
import { useBuses } from "@/hooks/useBuses";
import BusDetailModal from "@/components/BusDetailModal";
import { useState, useMemo } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import LocationPermissionPrompt from "@/components/LocationPermissionPrompt";

export default function PassengerDashboard() {
  const navigate = useNavigate();
  const { data: buses, isLoading, error } = useBuses();
  const [selectedBus, setSelectedBus] = useState<null | {
    id: string;
    name: string;
    plate_number: string;
    created_at: string;
  }>(null);

  // Track if location permission is granted, to hide prompt after approval
  const [locationStatus, setLocationStatus] = useState<"unknown" | "granted" | "prompt" | "denied">("unknown");

  // Only show buses if permission is granted
  const canShowBook = locationStatus === "granted";

  // Get all stages from routes table and flatten into a single array of unique stages
  const { data: routeStages, isLoading: routeStagesLoading, error: routeStagesError } = useQuery({
    queryKey: ["all_stages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routes")
        .select("stages");
      if (error) {
        console.error("Error fetching stages from Supabase:", error.message);
        throw new Error(error.message);
      }
      console.log("Raw routes data:", data);
      if (!Array.isArray(data) || data.length === 0) {
        console.warn("No routes returned from Supabase!");
        return [];
      }
      const flatStages =
        data
          ?.map((route) => Array.isArray(route.stages) ? route.stages : [])
          .flat()
          .filter(Boolean) || [];
      console.log("Flattened stages array:", flatStages);
      const uniqueSortedStages = Array.from(new Set(flatStages)).sort();
      console.log("Unique sorted stages for Select:", uniqueSortedStages);
      return uniqueSortedStages;
    }
  });

  // Stage selection state
  const [selectedStage, setSelectedStage] = useState<string | undefined>(undefined);

  // Filter buses by selectedStage using the trips data
  const filteredBuses = useMemo(() => {
    if (!buses) return [];
    if (!selectedStage) return []; // No stage chosen: show none (force user to pick)

    // Only show buses whose most recent trip has current_stage == selectedStage
    return buses.filter((bus: any) => {
      // bus.trips[0] is most recent trip (from useBuses)
      const trip = (bus.trips && bus.trips.length > 0) ? bus.trips[0] : null;
      if (!trip) return false;
      return trip.current_stage === selectedStage;
    });
  }, [buses, selectedStage]);

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] dashboard-bg">
      <div className="w-full md:w-2/3">
        <div className="h-[60vh] rounded-lg overflow-hidden my-6">
          <Map />
        </div>
      </div>
      <div className="md:w-1/3 flex flex-col p-4 gap-6 items-center">
        <h2 className="text-xl font-medium">Buses at your Stage</h2>
        
        {/* Show location permission prompt if required */}
        <LocationPermissionPrompt
          onGranted={() => setLocationStatus("granted")}
          onDenied={() => setLocationStatus("denied")}
          triggerOnMount // NEW: request permission as soon as dashboard opens
        />

        {/* Stage selector */}
        <div className="w-full">
          <label htmlFor="stage" className="block mb-1 text-sm text-muted-foreground">
            Select Your Stage
          </label>
          <Select
            value={selectedStage}
            onValueChange={setSelectedStage}
            disabled={routeStagesLoading || !!routeStagesError || (routeStages && routeStages.length === 0)}
          >
            <SelectTrigger id="stage" className="w-full">
              <SelectValue placeholder={
                routeStagesLoading
                  ? "Loading stages..."
                  : !!routeStagesError
                    ? "Error loading stages"
                    : (routeStages && routeStages.length === 0)
                      ? "No stages found"
                      : "Select stage"
              } />
            </SelectTrigger>
            <SelectContent>
              {routeStagesLoading ? (
                <div className="px-4 py-2 text-muted-foreground">Loading...</div>
              ) : !!routeStagesError ? (
                <div className="px-4 py-2 text-destructive">Error loading stages.</div>
              ) : (routeStages && routeStages.length === 0) ? (
                <div className="px-4 py-2 text-muted-foreground">No stages found.</div>
              ) : (
                (routeStages || []).map((stage: string) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {!!routeStagesError && (
            <div className="text-red-500 text-xs mt-2">
              Could not load stages: {routeStagesError.message}
            </div>
          )}
          {(routeStages && routeStages.length === 0 && !routeStagesLoading && !routeStagesError) && (
            <div className="text-warning text-xs mt-2">
              No stages were found in your database. Please add routes and stages first!
            </div>
          )}
        </div>

        <div className="space-y-2 w-full">
          {/* Show loading or error for buses */}
          {isLoading ? (
            <div className="p-4 rounded bg-muted text-muted-foreground text-center">
              Loading buses…
            </div>
          ) : error ? (
            <div className="p-4 rounded bg-red-100 text-red-600 text-center">
              Error: {(error as Error).message}
            </div>
          ) : !selectedStage ? (
            <div className="p-4 rounded bg-muted text-muted-foreground text-center">
              Please select your stage above to see available buses.
            </div>
          ) : !canShowBook ? (
            <div className="p-4 rounded bg-yellow-100 text-yellow-800 text-center text-sm">
              Location access is required to book a bus. Please allow location access above.
            </div>
          ) : (
            <BusList
              buses={filteredBuses}
              onSelect={setSelectedBus}
            />
          )}
        </div>
        <Button variant="outline" onClick={() => navigate("/qr")}>
          Scan QR / Enter Code
        </Button>
      </div>

      <BusDetailModal
        bus={selectedBus}
        open={!!selectedBus}
        onClose={() => setSelectedBus(null)}
      />
    </div>
  );
}
