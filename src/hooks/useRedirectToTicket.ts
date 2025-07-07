
import { useNavigate } from "react-router-dom";

// Utility hook to redirect after payment/ticket creation
export default function useRedirectToTicket() {
  const navigate = useNavigate();

  function goToTicket(bookingId: string) {
    navigate(`/ticket/${bookingId}`);
  }
  return goToTicket;
}
