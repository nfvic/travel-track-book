
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="mb-4 flex items-center gap-2"
      onClick={() => navigate("/passenger")}
      aria-label="Go back"
    >
      <ArrowLeft className="mr-1" />
      <span>Back</span>
    </Button>
  );
}
