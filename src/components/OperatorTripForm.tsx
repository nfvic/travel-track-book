import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useUpsertTrip } from "@/hooks/useOperatorTrips";
import { useOperatorRoutes } from "@/hooks/useOperatorRoutes";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { Tables } from "@/integrations/supabase/types";

type OperatorTripFormProps = {
  open: boolean;
  onClose: () => void;
  busId: string;
  initialData?: Partial<Tables<"trips">>;
};

export default function OperatorTripForm({ open, onClose, busId, initialData }: OperatorTripFormProps) {
  const isEdit = !!initialData?.id;
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      route_id: initialData?.route_id || "",
      current_stage: initialData?.current_stage || "",
      driver_name: initialData?.driver_name || "",
      status: initialData?.status || "ongoing",
      is_active: initialData?.is_active ?? true,
    }
  });

  // Fetch all operator routes for the dropdown
  const { data: routes = [], isLoading: routesLoading } = useOperatorRoutes();

  // Show the selected route name in the dropdown on edit
  React.useEffect(() => {
    reset({
      route_id: initialData?.route_id || "",
      current_stage: initialData?.current_stage || "",
      driver_name: initialData?.driver_name || "",
      status: initialData?.status || "ongoing",
      is_active: initialData?.is_active ?? true,
    });
  }, [reset, initialData, open]);

  // Control the Select with watch/setValue for route_id
  const route_id = watch("route_id");

  // FIX: Always call hooks at the top level, never inside event handlers!
  const upsertTrip = useUpsertTrip(busId);

  const onSubmit = (form: {
    route_id: string;
    current_stage: string;
    driver_name: string;
    status: string;
    is_active: boolean;
  }) => {
    if (isEdit) {
      upsertTrip.mutate(
        { ...form, id: initialData!.id, bus_id: busId },
        {
          onSuccess: () => {
            toast.success("Trip updated.");
            onClose();
          },
          onError: (e: any) => {
            toast.error(e?.message || "Could not save trip.");
          }
        }
      );
    } else {
      upsertTrip.mutate(
        { ...form, bus_id: busId },
        {
          onSuccess: () => {
            toast.success("Trip created.");
            onClose();
          },
          onError: (e: any) => {
            toast.error(e?.message || "Could not save trip.");
          }
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Trip" : "Add Trip"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">Route</label>
            <Select
              value={route_id}
              onValueChange={val => setValue("route_id", val, { shouldValidate: true })}
              disabled={routesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={routesLoading ? "Loading routes..." : "Select route"} />
              </SelectTrigger>
              <SelectContent>
                {routes.map(route =>
                  <SelectItem key={route.id} value={route.id}>
                    {route.name}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-sm">Current Stage</label>
            <Input {...register("current_stage")} placeholder="e.g. CBD, Westlands" />
          </div>
          <div>
            <label className="block mb-1 text-sm">Driver Name</label>
            <Input {...register("driver_name")} placeholder="e.g. John Doe" />
          </div>
          <div>
            <label className="block mb-1 text-sm">Status</label>
            <Input {...register("status")} placeholder="ongoing/completed" />
          </div>
          <div>
            <label className="block mb-1 text-sm">Is Active</label>
            <input type="checkbox" {...register("is_active")} className="ml-2" />
          </div>
          <DialogFooter>
            <Button type="submit">{isEdit ? "Save Changes" : "Add Trip"}</Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
