import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="text-center space-y-6 max-w-lg mx-auto p-8 rounded-lg bg-background/90 backdrop-blur-sm border">
        <div className="text-left">
          <BackButton />
        </div>
        <h1 className="text-4xl font-bold mb-2">Bus Tracking & Booking</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Welcome! Please choose your role to start:
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/passenger")}
            className="w-full sm:w-48"
          >
            I am a Passenger
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/operator")}
            className="w-full sm:w-48"
          >
            I am a Bus Operator
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/admin")}
            className="w-full sm:w-48 flex items-center justify-center gap-2"
          >
            I am an Admin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
