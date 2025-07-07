import { useTickets } from "@/hooks/useTickets";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import BackButton from "@/components/BackButton";

export default function MyTickets() {
  const { data: tickets, isLoading, error } = useTickets();

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <BackButton />
      <h1 className="text-2xl font-bold mb-4">My Tickets</h1>
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" /> Loading tickets…
        </div>
      ) : error ? (
        <div className="p-4 rounded bg-red-100 text-red-600 text-center">
          Error: {(error as Error).message}
        </div>
      ) : !tickets || tickets.length === 0 ? (
        <div className="p-4 rounded bg-muted text-muted-foreground text-center">
          You have no paid tickets yet.
        </div>
      ) : (
        tickets.map((ticket) => (
          <Card key={ticket.id} className="mb-4">
            <CardHeader>
              <CardTitle>Bus: {ticket.bus?.name || "Unknown"}</CardTitle>
              <div className="mt-1 text-xs text-gray-600">
                Plate: {ticket.bus?.plate_number || "N/A"}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:gap-8 gap-4">
                <div className="flex-1 space-y-2">
                  {/* Route and trip info skipped for now */}
                  <div>
                    <span className="font-semibold">Status:</span>{" "}
                    <span className="capitalize">{ticket.status}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Fare Paid:</span>{" "}
                    {ticket.order
                      ? `${(ticket.order.amount / 100).toLocaleString()} ${(
                          ticket.order.currency || "USD"
                        ).toUpperCase()}`
                      : "N/A"}
                  </div>
                  <div>
                    <span className="font-semibold">Ticket ID:</span> {ticket.id}
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <QRCodeSVG
                    value={ticket.id}
                    size={88}
                    level="M"
                    includeMargin={true}
                  />
                  <span className="text-xs mt-1 text-muted-foreground">
                    QR Ticket
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

