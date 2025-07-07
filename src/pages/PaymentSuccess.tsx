
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Ticket } from "lucide-react";
import { findBookingIdFromOrderSession } from "@/hooks/useFindBookingIdForOrder";

export default function PaymentSuccess() {
  const [status, setStatus] = useState<"searching"|"failed"|"done">("searching");
  const [message, setMessage] = useState("Confirming your payment...");
  const navigate = useNavigate();
  const [pollCount, setPollCount] = useState(0);
  const polling = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let isDone = false;
    const sessionId = localStorage.getItem("last_stripe_session_id") || "";
    if (!sessionId) {
      setStatus("failed");
      setMessage("No payment session found.");
      return;
    }

    async function handlePoll() {
      setPollCount(count => count + 1);
      const bookingId = await findBookingIdFromOrderSession(sessionId);
      if (bookingId) {
        isDone = true;
        setStatus("done");
        setMessage("Ticket found! Redirecting...");
        setTimeout(() => {
          navigate(`/ticket/${bookingId}`);
        }, 1300);
        return;
      }
      // If polling too long, show link as fallback
      if (pollCount >= 10) {
        setStatus("failed");
        setMessage("We couldn't confirm your ticket yet. Please check 'My Tickets' in a moment, or try again.");
        isDone = true;
      }
    }

    // Initial poll
    handlePoll();

    // Poll every 2 seconds, stop after 10 tries (~20s)
    polling.current = setInterval(() => {
      if (!isDone) handlePoll();
    }, 2000);

    return () => {
      if (polling.current) clearInterval(polling.current);
    };
    // We intentionally don't include pollCount as a dep to avoid retrigger loop
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex flex-col items-center mt-20 gap-8">
      <Ticket size={46} className="text-primary animate-pulse" />
      <div className="text-lg font-semibold">{message}</div>
      {status === "searching" && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-muted-foreground" size={28} />
          <div className="text-sm text-gray-500">Waiting for your payment...<br />This may take a few seconds.</div>
        </div>
      )}
      {status === "failed" && (
        <div className="flex flex-col items-center gap-6">
          <a
            href="/my-tickets"
            className="text-primary underline text-lg"
          >
            Go to My Tickets
          </a>
          <button
            className="text-muted-foreground underline"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
