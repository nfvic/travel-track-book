
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, List, Map, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOperatorBuses } from "@/hooks/useOperatorBuses";
import React from "react";
import OperatorBusForm from "@/components/OperatorBusForm";
import OperatorBookingsList from "@/components/OperatorBookingsList";
import OperatorTripList from "@/components/OperatorTripList";
import OperatorRoutesManager from "@/components/OperatorRoutesManager";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import OperatorLocationUpdater from "@/components/OperatorLocationUpdater";
// Import live operator buses map
import OperatorBusesMap from "@/components/OperatorBusesMap";
import { toast } from "@/hooks/use-toast";
import { useRealtimeBookings } from "@/hooks/useRealtimeBookings";

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const { data: buses = [], isLoading } = useOperatorBuses();

  // Activate real-time booking notifications
  useRealtimeBookings(buses);

  // Add/edit modal state
  const [showForm, setShowForm] = React.useState(false);
  const [editBus, setEditBus] = React.useState<any | null>(null);
  // Bookings modal state
  const [bookingsBus, setBookingsBus] = React.useState<any | null>(null);
  const [showBookings, setShowBookings] = React.useState(false);
  // Manage Routes modal state
  const [routesOpen, setRoutesOpen] = React.useState(false);

  // Live Map modal
  const [mapOpen, setMapOpen] = React.useState(false);

  // DEMO MODE STATE ---
  const [demoMode, setDemoMode] = React.useState(false);
  const demoIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Utility to randomly move a bus within ~100m of its location
  function jitterLocation(lat: number, lng: number) {
    // 1 deg lat ~ 111km, ~0.001 deg lat ~ 111m
    const maxDelta = 0.001; // ~111 meters
    return {
      lat: lat + (Math.random() - 0.5) * maxDelta,
      lng: lng + (Math.random() - 0.5) * maxDelta,
    };
  }

  // DEMO: move all buses a little, every 4 seconds
  React.useEffect(() => {
    if (!demoMode || !buses || buses.length === 0) return;
    demoIntervalRef.current = setInterval(async () => {
      for (const bus of buses) {
        if (
          typeof bus.location_lat === "number" &&
          typeof bus.location_lng === "number"
        ) {
          const { lat, lng } = jitterLocation(bus.location_lat, bus.location_lng);
          // Update in Supabase
          const { error } = await import("@/integrations/supabase/client")
            .then(({ supabase }) =>
              supabase
                .from("buses")
                .update({
                  location_lat: lat,
                  location_lng: lng,
                })
                .eq("id", bus.id)
            );
          if (error) {
            toast({
              title: "Demo move failed",
              description: error.message,
              variant: "destructive",
            });
          }
        }
      }
    }, 4000);

    // Cleanup on stop
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    };
    // Only run when demoMode or buses changes
  }, [demoMode, buses]);

  // Handlers
  const handleAdd = () => {
    setEditBus(null);
    setShowForm(true);
  };
  const handleEdit = (bus: any) => {
    setEditBus(bus);
    setShowForm(true);
  };
  const handleViewBookings = (bus: any) => {
    setBookingsBus(bus);
    setShowBookings(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <Button
        variant="ghost"
        className="mb-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2" />
        Back
      </Button>
      <h1 className="text-2xl font-bold">Operator Dashboard</h1>
      <p className="text-muted-foreground">
        Here you can manage your buses, view bookings, and update bus info.
      </p>

      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-lg">Your Buses</div>
        <div className="flex gap-2">
          {/* DEMO BUTTON */}
          <Button
            type="button"
            variant={demoMode ? "destructive" : "outline"}
            onClick={() => setDemoMode(d => !d)}
          >
            {demoMode ? "Stop Demo Mode" : "Start Demo Mode"}
          </Button>
          <Button onClick={handleAdd}>Add New Bus</Button>
          <Button variant="outline" onClick={() => setRoutesOpen(true)}>Manage Routes</Button>
          <Button variant="secondary" onClick={() => setMapOpen(true)}>
            <Map className="mr-1" size={16} />
            View Buses Map
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 rounded bg-muted text-muted-foreground text-center">
          Loading...
        </div>
      ) : buses.length === 0 ? (
        <div className="p-4 rounded bg-muted text-muted-foreground text-center">
          No buses added yet.
        </div>
      ) : (
        <div className="space-y-3">
          {buses.map(bus => (
            <Card key={bus.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{bus.name}</CardTitle>
                  <CardDescription>Plate: {bus.plate_number}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(bus)}
                  >
                    <Edit className="mr-1" size={16} /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleViewBookings(bus)}
                  >
                    <List className="mr-1" size={16} /> Bookings
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                Added: {bus.created_at?.substring(0, 10)}
                {/* GPS Update: */}
                <div className="mt-2">
                  <OperatorLocationUpdater
                    busId={bus.id}
                    initialLat={bus.location_lat}
                    initialLng={bus.location_lng}
                  />
                </div>
                {/* New trip list under bus info */}
                <OperatorTripList busId={bus.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <OperatorBusForm
        open={showForm}
        initialData={editBus || undefined}
        onClose={() => setShowForm(false)}
      />
      {/* Bookings Modal */}
      <OperatorBookingsList
        bus={bookingsBus}
        open={showBookings}
        onClose={() => setShowBookings(false)}
      />
      {/* New Manage Routes Modal */}
      <OperatorRoutesManager open={routesOpen} onClose={() => setRoutesOpen(false)} />

      {/* Operator Buses Map Modal */}
      {mapOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl relative max-w-3xl w-[95vw] h-[72vh] flex flex-col">
            <OperatorBusesMap onClose={() => setMapOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
