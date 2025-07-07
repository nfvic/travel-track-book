
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCreateDemoTrip() {
  return useMutation({
    mutationFn: async () => {
      // Fetch first available bus and route:
      const { data: buses } = await supabase.from("buses").select("id").limit(1);
      const { data: routes } = await supabase.from("routes").select("id, stages").limit(1);
      if (!buses?.length || !routes?.length) throw new Error("No bus or route found.");
      // Nairobi: lat -1.2921, lng 36.8219
      const randomLat = -1.2921 + (Math.random() - 0.5) * 0.02; // ~±0.01 deg (~1.1km)
      const randomLng = 36.8219 + (Math.random() - 0.5) * 0.02;
      const { error } = await supabase.from("trips").insert([
        {
          bus_id: buses[0].id,
          route_id: routes[0].id,
          current_stage: routes[0].stages?.[0] ?? "Start",
          is_active: true,
          status: "ongoing",
          driver_name: "Demo Driver",
          location_lat: randomLat,
          location_lng: randomLng,
        },
      ]);
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => {
      toast.success("Demo live trip created! You should see the bus marker on the map.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create demo trip.");
    },
  });
}

export function useCreateKituiDemoTrip() {
  return useMutation({
    mutationFn: async () => {
      // Kitui: lat -1.375, lng 38.0106
      const { data: buses } = await supabase.from("buses").select("id").limit(1);
      const { data: routes } = await supabase.from("routes").select("id, stages").limit(1);
      if (!buses?.length || !routes?.length) throw new Error("No bus or route found.");
      const randomLat = -1.375 + (Math.random() - 0.5) * 0.02; // ±0.01 deg ~1.1km
      const randomLng = 38.0106 + (Math.random() - 0.5) * 0.02;
      const { error } = await supabase.from("trips").insert([
        {
          bus_id: buses[0].id,
          route_id: routes[0].id,
          current_stage: routes[0].stages?.[0] ?? "Start",
          is_active: true,
          status: "ongoing",
          driver_name: "Demo Driver (Kitui)",
          location_lat: randomLat,
          location_lng: randomLng,
        },
      ]);
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => {
      toast.success("Demo live trip created in Kitui! You should see the bus marker on the map.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create demo trip.");
    },
  });
}
