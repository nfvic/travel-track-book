
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin } from "lucide-react";

interface OperatorLocationUpdaterProps {
  busId: string;
  initialLat?: number | null;
  initialLng?: number | null;
  onSuccess?: (lat: number, lng: number) => void;
}

const OperatorLocationUpdater: React.FC<OperatorLocationUpdaterProps> = ({
  busId,
  initialLat,
  initialLng,
  onSuccess,
}) => {
  const [manualMode, setManualMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{
    lat: number | "";
    lng: number | "";
  }>({
    lat: initialLat ?? "",
    lng: initialLng ?? "",
  });

  // Try browser geolocation
  const handleGps = async () => {
    setLoading(true);
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation. Please enter your location manually.",
        variant: "destructive",
      });
      setManualMode(true);
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setManualMode(false);
        setLoading(false);
      },
      () => {
        toast({
          title: "Unable to fetch GPS location",
          description: "Please enter your location manually.",
          variant: "destructive",
        });
        setManualMode(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleManualChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: "lat" | "lng"
  ) => {
    setLocation(l => ({
      ...l,
      [key]: e.target.value === "" ? "" : Number(e.target.value),
    }));
  };

  const handleSave = async () => {
    if (
      typeof location.lat !== "number" ||
      typeof location.lng !== "number" ||
      isNaN(location.lat) ||
      isNaN(location.lng)
    ) {
      toast({
        title: "Invalid input",
        description: "Please provide valid latitude and longitude.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("buses")
      .update({
        location_lat: location.lat,
        location_lng: location.lng,
      })
      .eq("id", busId);

    setLoading(false);

    if (error) {
      toast({
        title: "Failed to update location",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Bus location updated!",
        description: "The bus location was updated successfully.",
        variant: "default",
      });
      onSuccess?.(location.lat, location.lng);
      setManualMode(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleGps}
          disabled={loading}
        >
          <MapPin className="mr-1" size={16} />
          Use GPS{loading && <Loader2 className="ml-1 animate-spin" size={16} />}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setManualMode(m => !m)}
        >
          Enter manually
        </Button>
      </div>
      {manualMode && (
        <form
          className="flex gap-2 items-center"
          onSubmit={e => {
            e.preventDefault();
            handleSave();
          }}
        >
          <Input
            type="number"
            step="any"
            placeholder="Latitude"
            className="w-[7rem]"
            value={location.lat}
            onChange={e => handleManualChange(e, "lat")}
            required
          />
          <Input
            type="number"
            step="any"
            placeholder="Longitude"
            className="w-[7rem]"
            value={location.lng}
            onChange={e => handleManualChange(e, "lng")}
            required
          />
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Save"}
          </Button>
        </form>
      )}
      {!manualMode && location.lat && location.lng && (
        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
          <MapPin size={14} />
          Location: {typeof location.lat === "number" && typeof location.lng === "number"
            ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
            : ""}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default OperatorLocationUpdater;

