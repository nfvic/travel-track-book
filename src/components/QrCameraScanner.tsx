
import React, { useEffect, useRef } from "react";
// Using browser's QR code decoding via QRCode.js is usual,
// but we'll use 'qrcode.react' as a fallback for simplicity

type Props = {
  onResult: (code: string) => void;
};

// Try to use BarcodeDetector API if available, else show unsupported
const QrCameraScanner: React.FC<Props> = ({ onResult }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        // log error
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    // BarcodeDetector is available in most mobile modern browsers
    let interval: NodeJS.Timeout;

    if (
      "BarcodeDetector" in window &&
      videoRef.current
    ) {
      const barcodeDetector = new (window as any).BarcodeDetector([
        "qr_code",
      ]);
      const detect = async () => {
        if (!videoRef.current) return;
        try {
          const canvas = document.createElement("canvas");
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(
            videoRef.current,
            0,
            0,
            canvas.width,
            canvas.height
          );
          const barcodes = await barcodeDetector.detect(canvas);
          if (barcodes.length > 0 && barcodes[0].rawValue) {
            onResult(barcodes[0].rawValue);
          }
        } catch {}
      };
      interval = setInterval(detect, 700);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line
  }, [onResult]);

  return (
    <div className="flex flex-col items-center">
      <video
        ref={videoRef}
        style={{ width: "100%", maxWidth: 320, borderRadius: 8 }}
        autoPlay
        muted
        playsInline
      />
      <div className="text-xs text-muted-foreground mt-2">
        {!("BarcodeDetector" in window)
          ? "QR scanning unsupported (try a different browser)"
          : "Point camera at the QR code on the bus"}
      </div>
    </div>
  );
};

export default QrCameraScanner;
