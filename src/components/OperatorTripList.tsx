
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOperatorTrips, useDeleteTrip } from "@/hooks/useOperatorTrips";
import { useOperatorRoutes } from "@/hooks/useOperatorRoutes";
import OperatorTripForm from "./OperatorTripForm";
import { Trash, Edit } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import OperatorAnnouncements from "./OperatorAnnouncements";

type OperatorTripListProps = {
  busId: string;
};

export default function OperatorTripList({ busId }: OperatorTripListProps) {
  const { data: trips = [], isLoading } = useOperatorTrips(busId);
  const { data: routes = [] } = useOperatorRoutes();
  const [showForm, setShowForm] = React.useState(false);
  const [editTrip, setEditTrip] = React.useState<Partial<Tables<"trips">> | null>(null);

  const deleteTrip = useDeleteTrip(busId);

  const handleAdd = React.useCallback(() => {
    setEditTrip(null);
    setShowForm(true);
  }, []);
  const handleEdit = React.useCallback((trip: Tables<"trips">) => {
    setEditTrip(trip);
    setShowForm(true);
  }, []);
  const handleDelete = React.useCallback((tripId: string) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      deleteTrip.mutate(tripId);
    }
  }, [deleteTrip]);

  // For looking up route names & stages
  const getRouteById = (id: string) => routes.find(route => route.id === id);

  return (
    <div className="my-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-base">Trips</div>
        <Button size="sm" onClick={handleAdd}>Add Trip</Button>
      </div>
      {isLoading ? (
        <div className="p-2 text-center text-muted-foreground">Loading trips…</div>
      ) : trips.length === 0 ? (
        <div className="p-2 text-center text-muted-foreground">No trips for this bus yet.</div>
      ) : (
        <div className="space-y-2">
          {trips.map(trip => {
            const route = getRouteById(trip.route_id);
            return (
              <Card key={trip.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">
                      Route:{" "}
                      <span className="font-mono">
                        {route ? route.name : trip.route_id}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Stage: {trip.current_stage || "—"}, Status: {trip.status}, Driver: {trip.driver_name || "—"}
                    </div>
                    {route && (
                      <div className="text-xs mt-1">
                        <span className="font-semibold">Stages:</span>{" "}
                        {route.stages.join(" → ")}
                      </div>
                    )}
                    <div className="text-xs">
                      Started: {trip.started_at?.substring(0, 16)?.replace("T", " ")}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 ml-2">
                    <Button size="icon" variant="outline" onClick={() => handleEdit(trip)}><Edit size={16} /></Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(trip.id)} disabled={deleteTrip.isPending}><Trash size={16} /></Button>
                  </div>
                </div>
                <OperatorAnnouncements tripId={trip.id} />
              </Card>
            );
          })}
        </div>
      )}

      <OperatorTripForm
        open={showForm}
        onClose={() => setShowForm(false)}
        busId={busId}
        initialData={editTrip || undefined}
      />
    </div>
  );
}
