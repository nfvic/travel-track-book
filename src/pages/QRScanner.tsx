import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { useState } from "react";
import QrCameraScanner from "@/components/QrCameraScanner";
import { Input } from "@/components/ui/input";
import { useBuses } from "@/hooks/useBuses";
import BusDetailModal from "@/components/BusDetailModal";
import { ScanQrCode } from "lucide-react";

export default function QRScanner() {
  const [qrResult, setQrResult] = useState<string>("");
  const [manualCode, setManualCode] = useState<string>("");
  const [fetchedBus, setFetchedBus] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Get all buses & their IDs
  const { data: buses, isLoading } = useBuses();

  // When a code (from QR or manual input) is entered, try to fetch/show bus
  const handleCode = (code: string) => {
    const cleanCode = code.trim();
    setQrResult(cleanCode);
    if (!buses) return;
    const bus = buses.find((b: any) =>
      b.id === cleanCode ||
      b.plate_number === cleanCode ||
      (b.qr_code && b.qr_code === cleanCode)
    );
    setFetchedBus(bus || null);
    setShowDetails(!!bus);
  };

  return (
    <div className="max-w-lg mx-auto my-10 p-6 rounded bg-muted/40 shadow space-y-6">
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <ScanQrCode className="text-primary" />
        Scan QR Code or Enter Bus Code
      </h1>
      <div className="mb-2">
        <QrCameraScanner
          onResult={(code) => {
            handleCode(code);
          }}
        />
      </div>
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Or enter bus code or plate number"
          value={manualCode}
          onChange={e => setManualCode(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              handleCode(manualCode);
            }
          }}
        />
        <button
          className="bg-primary text-white px-3 py-2 rounded"
          onClick={() => handleCode(manualCode)}
        >
          Search
        </button>
      </div>
      {isLoading && <div className="text-center text-muted-foreground">Loading buses...</div>}
      {!!fetchedBus ? (
        <div>
          <div className="my-4 border rounded-lg bg-white p-3">
            <div className="font-medium text-lg">{fetchedBus.name}</div>
            <div className="text-xs text-muted-foreground mb-1">
              Plate: {fetchedBus.plate_number}
            </div>
            <div>
              Route: {fetchedBus.route_name || "N/A"}
              <br />
              Fare: {typeof fetchedBus.price_cents === "number" ? `KES ${fetchedBus.price_cents / 100}` : "N/A"}
              <br />
              Seats: {fetchedBus.total_seats ?? "N/A"}
            </div>
            <button
              className="mt-4 w-full bg-primary px-4 py-2 rounded text-white"
              onClick={() => setShowDetails(true)}
            >
              Show Booking & Details
            </button>
          </div>
          <BusDetailModal
            bus={fetchedBus}
            open={showDetails}
            onClose={() => setShowDetails(false)}
          />
        </div>
      ) : (
        qrResult && (
          <div className="text-red-500 text-sm mt-4">
            No bus found for code: <span className="font-mono">{qrResult}</span>
          </div>
        )
      )}
    </div>
  );
}
