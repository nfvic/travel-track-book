
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useLiveBusLocations } from "@/hooks/useLiveBusLocations";
import { Button } from "@/components/ui/button";

// NOTE: This token is safe here. Never commit secret/private tokens for other services!
const MAPBOX_TOKEN =
  "pk.eyJ1IjoibmZ2aWMiLCJhIjoiY21id2Z0ZjMyMHR4cDJxczY0dHdiczI5NCJ9.581FXIhTBCf-DdmOOilQqw";

// Light Mapbox marker color
const markerColor = "#0ea5e9";

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Bus locations and selected trip state
  const { data: trips, isLoading } = useLiveBusLocations();
  const [popupInfo, setPopupInfo] = useState<any>(null); // For popup marker info

  // On mount: setup base map only
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      projection: "globe",
      zoom: 11,
      // Updated from Kampala, Uganda to Nairobi, Kenya:
      center: [36.8219, -1.2921], // Nairobi [longitude, latitude]
      pitch: 45,
    });

    // Controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      "top-right"
    );

    // Atmosphere/fog
    map.current.on("style.load", () => {
      map.current?.setFog({
        color: "rgb(255, 255, 255)",
        "high-color": "rgb(200, 200, 225)",
        "horizon-blend": 0.2,
      });
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  // Store marker refs to clean up
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Add or update markers whenever trips change
  useEffect(() => {
    if (!map.current || !Array.isArray(trips)) return;

    // Clean up previous markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    trips.forEach((trip: any) => {
      if (
        typeof trip.location_lat !== "number" ||
        typeof trip.location_lng !== "number"
      ) {
        return;
      }

      // Customize marker element to allow click
      const markerEl = document.createElement("div");
      markerEl.className = "w-8 h-8 rounded-full border-2 border-white bg-sky-500 shadow-lg cursor-pointer transition duration-150 hover:scale-125 flex items-center justify-center text-white font-bold text-sm";
      markerEl.innerText = trip.buses?.name?.charAt(0)?.toUpperCase() || 'B';
      markerEl.title =
        (trip.buses?.name || "Bus") +
        (trip.current_stage ? ` @ ${trip.current_stage}` : "");

      markerEl.onclick = (e) => {
        setPopupInfo({
          lat: trip.location_lat,
          lng: trip.location_lng,
          trip,
        });
        // Center and zoom map nicely on click
        map.current!.flyTo({
          center: [trip.location_lng, trip.location_lat],
          zoom: 14,
          speed: 0.8,
        });
      };

      const marker = new mapboxgl.Marker({
        element: markerEl,
        color: markerColor,
        anchor: "center",
      })
        .setLngLat([trip.location_lng, trip.location_lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Optional: Center view based on buses if needed
    if (trips.length > 0) {
      // Compute bounds
      const bounds = new mapboxgl.LngLatBounds();
      trips
        .filter(
          trip =>
            typeof trip.location_lat === "number" &&
            typeof trip.location_lng === "number"
        )
        .forEach(trip =>
          bounds.extend([trip.location_lng, trip.location_lat])
        );
      map.current?.fitBounds(bounds, { padding: 120, maxZoom: 13, duration: 800 });
    }
    // Clean up previous popups on trips update
    setPopupInfo(null);

    // Clean up markers when trips change or unmount
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [trips]);

  // Visible info cards below the map: move out of map's absolute layer
  return (
    <div className="w-full">
      {/* Map container */}
      <div className="relative w-full h-[60vh]">
        <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg z-0" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10 rounded-lg" />
        {/* Popup still shown if marker/card pressed (close with button) */}
        {popupInfo && (
          <div
            className="absolute z-30 left-1/2 -translate-x-1/2 bottom-5 w-[90vw] max-w-sm bg-white shadow-xl rounded-lg border px-4 py-3"
            style={{
              pointerEvents: "auto",
              minWidth: 240
            }}
          >
            <div className="font-bold text-lg text-black mb-0.5">{popupInfo.trip.buses?.name || "Bus"}</div>
            <div className="text-xs text-black mb-1">
              Plate: {popupInfo.trip.buses?.plate_number || "?"} • Route: {popupInfo.trip.routes?.name || "?"}
            </div>
            <div className="text-sm text-black mb-1">
              At: <span className="font-semibold">{popupInfo.trip.current_stage || "?"}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-black mb-2">
              <span>Capacity: {popupInfo.trip.buses?.total_seats ?? "?"}</span>
              <span>Driver: {popupInfo.trip.driver_name ?? "?"}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => setPopupInfo(null)}
            >
              Close
            </Button>
          </div>
        )}
        {/* Show loading overlay if necessary */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
            <div className="text-sky-800 bg-white px-4 py-2 rounded shadow font-medium">
              Loading live bus locations…
            </div>
          </div>
        )}
      </div>
      {/* Always visible info cards BELOW the map */}
      {Array.isArray(trips) && trips.length > 0 && (
        <div className="w-full flex flex-col items-center mt-4">
          {trips.map((trip: any) => (
            <div
              key={trip.id}
              className="w-[90vw] max-w-xs bg-white/95 shadow-xl rounded-lg border px-4 py-3 mb-2"
              style={{
                minWidth: 240,
                borderLeft: "4px solid #0ea5e9",
                boxShadow: "0 2px 16px 2px rgba(0,160,233,0.07)",
              }}
            >
              <div className="font-bold text-base text-black mb-0.5 flex items-center gap-2">
                {/* Bus emoji for visibility */}
                <span role="img" aria-label="bus">🚌</span>
                {trip.buses?.name || "Bus"}
              </div>
              <div className="text-xs text-black mb-1">
                Plate: {trip.buses?.plate_number || "?"} • Route: {trip.routes?.name || "?"}
              </div>
              <div className="text-sm text-black mb-1">
                At: <span className="font-semibold">{trip.current_stage || "?"}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-black mb-2">
                <span>Capacity: {trip.buses?.total_seats ?? "?"}</span>
                <span>Driver: {trip.driver_name ?? "?"}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  setPopupInfo({
                    lat: trip.location_lat,
                    lng: trip.location_lng,
                    trip,
                  });
                  // Center and zoom map nicely on click
                  map.current!.flyTo({
                    center: [trip.location_lng, trip.location_lat],
                    zoom: 14,
                    speed: 0.8,
                  });
                }}
              >
                Center on Map
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Map;
