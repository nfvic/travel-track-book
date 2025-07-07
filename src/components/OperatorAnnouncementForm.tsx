
import React from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAnnouncement } from "@/hooks/useAnnouncements";
import { toast } from "sonner";

type OperatorAnnouncementFormProps = {
  open: boolean;
  onClose: () => void;
  tripId: string;
};

export default function OperatorAnnouncementForm({ open, onClose, tripId }: OperatorAnnouncementFormProps) {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<{ message: string }>();
  const createAnnouncement = useCreateAnnouncement(tripId);

  const onSubmit = async (data: { message: string }) => {
    await createAnnouncement.mutateAsync(data.message, {
      onSuccess: () => {
        toast.success("Announcement sent!");
        reset();
        onClose();
      },
      onError: (error: any) => {
        toast.error("Failed to send announcement", { description: error.message });
      },
    });
  };

  React.useEffect(() => {
    if (open) {
      reset({ message: "" });
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Announcement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <Textarea
            {...register("message", { required: "Message cannot be empty." })}
            placeholder="Type your announcement here..."
            rows={4}
          />
          {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
