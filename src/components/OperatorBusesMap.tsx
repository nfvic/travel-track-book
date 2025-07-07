
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useOperatorBusLocations } from "@/hooks/useOperatorBusLocations";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoibmZ2aWMiLCJhIjoiY21id2Z0ZjMyMHR4cDJxczY0dHdiczI5NCJ9.581FXIhTBCf-DdmOOilQqw";

export default function OperatorBusesMap({ onClose }: { onClose?: () => void }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { data: buses, isLoading } = useOperatorBusLocations();
  const [popupInfo, setPopupInfo] = useState<any>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      projection: "globe",
      zoom: 11,
      center: [36.8219, -1.2921], // Nairobi default, will fit to buses if available
      pitch: 45,
    });
    map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.current.on("style.load", () => {
      map.current?.setFog({
        color: "rgb(255, 255, 255)",
        "high-color": "rgb(200, 200, 225)",
        "horizon-blend": 0.2,
      });
    });
    return () => { map.current?.remove(); };
  }, []);

  // Add/update/delete markers anytime buses change
  useEffect(() => {
    if (!map.current || !Array.isArray(buses)) return;
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    buses.forEach((bus: any) => {
      if (typeof bus.location_lat !== "number" || typeof bus.location_lng !== "number") return;
      const markerEl = document.createElement("div");
      markerEl.className = "w-8 h-8 rounded-full border-2 border-white bg-green-500 shadow-lg cursor-pointer transition duration-150 hover:scale-125 flex items-center justify-center text-white font-bold text-sm";
      markerEl.innerText = bus.name?.charAt(0)?.toUpperCase() || 'B';
      markerEl.title = bus.name;
      markerEl.onclick = () => {
        setPopupInfo({
          lat: bus.location_lat,
          lng: bus.location_lng,
          bus,
        });
        map.current!.flyTo({
          center: [bus.location_lng, bus.location_lat],
          zoom: 14,
          speed: 0.8,
        });
      };
      const marker = new mapboxgl.Marker({
        element: markerEl,
        color: "#22c55e",
        anchor: "center",
      })
        .setLngLat([bus.location_lng, bus.location_lat])
        .addTo(map.current!);
      markersRef.current.push(marker);
    });
    // Fit map to all buses if available
    if (buses.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      buses.forEach((bus: any) => {
        if (typeof bus.location_lat === "number" && typeof bus.location_lng === "number") {
          bounds.extend([bus.location_lng, bus.location_lat]);
        }
      });
      map.current?.fitBounds(bounds, { padding: 120, maxZoom: 14, duration: 800 });
    }
    setPopupInfo(null);
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [buses]);

  return (
    <div className="relative w-full h-[60vh]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg z-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10 rounded-lg" />
      {/* Popup info on marker click */}
      {popupInfo && (
        <div
          className="absolute z-10 left-1/2 -translate-x-1/2 bottom-5 w-[90vw] max-w-sm bg-white shadow-xl rounded-lg border px-4 py-3"
          style={{ pointerEvents: "auto", minWidth: 240 }}
        >
          <div className="font-bold text-lg mb-0.5 flex items-center gap-1">
            <MapPin size={16} className="text-green-700" />
            {popupInfo.bus.name}
          </div>
          <div className="text-xs text-muted-foreground mb-1">
            Plate: {popupInfo.bus.plate_number}
          </div>
          <div className="text-xs">Location: {popupInfo.lat.toFixed(6)}, {popupInfo.lng.toFixed(6)}</div>
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
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
          <div className="text-green-800 bg-white px-4 py-2 rounded shadow font-medium">
            Loading bus locations…
          </div>
        </div>
      )}
      {/* Close button for modal/dialog */}
      {onClose && (
        <button
          className="absolute top-4 right-4 z-20 bg-white rounded-full px-3 py-1 shadow hover:bg-slate-100 text-xs text-green-800"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      )}
    </div>
  );
}
