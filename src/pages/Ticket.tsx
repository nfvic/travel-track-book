import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Ticket } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useGetTicket } from "@/hooks/useGetTicket";

export default function TicketPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { data: ticket, isLoading, error } = useGetTicket(bookingId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center mt-10 gap-4 text-muted-foreground">
        <Loader2 className="animate-spin" /> Loading ticket...
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 rounded bg-red-100 text-red-600 text-center mt-8">
        Error: {(error as Error).message}
      </div>
    );
  }
  if (!ticket) {
    return (
      <div className="p-4 rounded bg-muted text-muted-foreground text-center mt-8">
        Ticket not found.
      </div>
    );
  }
  return (
    <div className="max-w-xl mx-auto p-4 space-y-5">
      <div className="flex justify-center">
        <Ticket size={42} className="text-primary mb-4" />
      </div>
      <h1 className="text-2xl font-bold mb-2 text-center">Your Digital Ticket</h1>
      <Card>
        <CardHeader>
          <CardTitle>Bus: {ticket.bus?.name || "Unknown"}</CardTitle>
          <div className="mt-1 text-xs text-gray-600">
            Plate: {ticket.bus?.plate_number || "N/A"}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:gap-8 gap-4">
            <div className="flex-1 space-y-2">
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
              <div>
                <span className="font-semibold">Issued:</span>{" "}
                {new Date(ticket.created_at).toLocaleString()}
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <QRCodeSVG
                value={ticket.id}
                size={100}
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
      <div className="flex justify-between mt-6">
        <Link to="/my-tickets" className="text-primary underline mr-6">
          View All My Tickets
        </Link>
        <Link to="/" className="text-muted-foreground underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
