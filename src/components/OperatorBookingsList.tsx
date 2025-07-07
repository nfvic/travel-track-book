
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Booking = {
  id: string;
  bus_id: string;
  user_id: string;
  status: string;
  created_at: string | null;
};

type Profile = {
  id: string;
  full_name: string | null;
};

type Props = {
  bus: Tables<"buses"> | null;
  open: boolean;
  onClose: () => void;
};

export default function OperatorBookingsList({ bus, open, onClose }: Props) {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [profiles, setProfiles] = React.useState<Record<string, string | null>>({});
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!bus?.id || !open) return;
    setLoading(true);
    supabase
      .from("bookings")
      .select("*")
      .eq("bus_id", bus.id)
      .order("created_at", { ascending: false })
      .then(async ({ data, error }) => {
        setBookings(data ?? []);
        setLoading(false);

        // Fetch associated user profiles (to show full names)
        if (data && data.length > 0) {
          const userIds = Array.from(new Set(data.map(b => b.user_id)));
          if (userIds.length > 0) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("id,full_name")
              .in("id", userIds);
            // Make a map: userID -> full_name
            const profileMap: Record<string, string | null> = {};
            profileData?.forEach((p: Profile) => {
              profileMap[p.id] = p.full_name;
            });
            setProfiles(profileMap);
          } else {
            setProfiles({});
          }
        } else {
          setProfiles({});
        }
      });
  }, [bus?.id, open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bookings for {bus?.name}</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No bookings found for this bus.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Booked At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b, i) => (
                  <TableRow key={b.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="font-mono whitespace-nowrap">
                      {profiles[b.user_id] || <span className="text-xs text-muted-foreground">{b.user_id}</span>}
                    </TableCell>
                    <TableCell>{b.status}</TableCell>
                    <TableCell>{b.created_at?.substring(0, 16).replace("T", " ")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogClose asChild>
          <button className="mt-4 text-sm text-muted-foreground underline">Close</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
