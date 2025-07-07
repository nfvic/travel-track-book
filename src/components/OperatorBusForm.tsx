
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useUpsertBus } from "@/hooks/useOperatorBuses";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type BusFormProps = {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<Tables<"buses">>; // For edit mode
};

type FormData = {
  name: string;
  plate_number: string;
  total_seats: number | "";
};

export default function OperatorBusForm({ open, onClose, initialData }: BusFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: initialData?.name || "",
      plate_number: initialData?.plate_number || "",
      total_seats: initialData?.total_seats ?? "",
    },
  });
  const isEdit = !!initialData?.id;
  const upsertBus = useUpsertBus();

  React.useEffect(() => {
    reset({
      name: initialData?.name || "",
      plate_number: initialData?.plate_number || "",
      total_seats: initialData?.total_seats ?? "",
    });
  }, [initialData, reset, open]);

  const onSubmit = (form: FormData) => {
    if (form.total_seats === "" || isNaN(Number(form.total_seats))) {
      toast.warning("Total seats is required and must be a number.");
      return;
    }
    if (Number(form.total_seats) <= 0) {
      toast.warning("Total seats must be a positive number.");
      return;
    }
    // owner_id will be auto-added in the hook; do not pass it here
    upsertBus.mutate(
      isEdit ? { ...form, total_seats: Number(form.total_seats), id: initialData!.id } : { ...form, total_seats: Number(form.total_seats) },
      {
        onSuccess: () => {
          toast.success(isEdit ? "Bus updated." : "Bus added.");
          onClose();
        },
        onError: (e: any) => toast.error(e?.message ?? "Could not save bus."),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Bus Info" : "Add New Bus"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1 text-sm">Bus Name</label>
            <Input {...register("name", { required: true })} placeholder="eg. City Shuttle" autoFocus />
          </div>
          <div>
            <label className="block mb-1 text-sm">Plate Number</label>
            <Input {...register("plate_number", { required: true })} placeholder="eg. ABC 123" />
          </div>
          <div>
            <label className="block mb-1 text-sm">Total Seats</label>
            <Input
              type="number"
              min={1}
              step={1}
              {...register("total_seats", { required: true, min: 1, valueAsNumber: true })}
              placeholder="eg. 33"
            />
            {errors.total_seats && (
              <span className="text-xs text-destructive">Total seats is required</span>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={upsertBus.isPending}>
              {upsertBus.isPending ? (isEdit ? "Saving..." : "Adding...") : (isEdit ? "Save Changes" : "Add Bus")}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
