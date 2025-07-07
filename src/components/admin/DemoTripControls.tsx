
import React from "react";
import { Button } from "@/components/ui/button";
import { useCreateDemoTrip, useCreateKituiDemoTrip } from "@/hooks/admin/useCreateDemoTrips";

export default function DemoTripControls() {
  const createDemoTrip = useCreateDemoTrip();
  const createKituiDemoTrip = useCreateKituiDemoTrip();

  return (
    <div className="mb-6 flex flex-wrap gap-2 items-center">
      <Button
        variant="secondary"
        disabled={createDemoTrip.isPending}
        onClick={() => createDemoTrip.mutate()}
      >
        {createDemoTrip.isPending ? "Creating Demo Live Trip..." : "Create Demo Live Trip"}
      </Button>
      <Button
        variant="secondary"
        disabled={createKituiDemoTrip.isPending}
        onClick={() => createKituiDemoTrip.mutate()}
      >
        {createKituiDemoTrip.isPending ? "Creating Kitui Demo Trip..." : "Create Demo Live Trip (Kitui)"}
      </Button>
      <span className="ml-3 text-xs text-muted-foreground">
        Instantly creates a test trip on your map.
      </span>
    </div>
  );
}
