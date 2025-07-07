
import React from "react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { Button } from "@/components/ui/button";
import { Megaphone } from "lucide-react";
import OperatorAnnouncementForm from "./OperatorAnnouncementForm";

type OperatorAnnouncementsProps = {
  tripId: string;
};

export default function OperatorAnnouncements({ tripId }: OperatorAnnouncementsProps) {
  const { data: announcements = [], isLoading } = useAnnouncements(tripId);
  const [showForm, setShowForm] = React.useState(false);

  return (
    <div className="mt-3 pt-3 border-t">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm">Announcements</h4>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          <Megaphone className="mr-2 h-4 w-4" />
          Send New
        </Button>
      </div>

      {isLoading ? (
        <div className="text-xs text-muted-foreground">Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="text-xs text-muted-foreground">No announcements for this trip yet.</div>
      ) : (
        <div className="space-y-2">
          {announcements.map((ann) => (
            <div key={ann.id} className="text-xs bg-accent/50 p-2 rounded">
              <p className="whitespace-pre-wrap">{ann.message}</p>
              <p className="text-muted-foreground text-right mt-1">{new Date(ann.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      <OperatorAnnouncementForm
        open={showForm}
        onClose={() => setShowForm(false)}
        tripId={tripId}
      />
    </div>
  );
}
