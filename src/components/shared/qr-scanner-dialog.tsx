"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, QrCode, Camera, AlertCircle } from "lucide-react";
import type QrScannerType from "qr-scanner";

interface QrScannerDialogProps {
    open: boolean;
    onClose: () => void;
    onScan: (value: string) => void;
}

type ScanStatus = "idle" | "loading" | "scanning" | "error";

export function QrScannerDialog({ open, onClose, onScan }: QrScannerDialogProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<QrScannerType | null>(null);
    const [status, setStatus] = useState<ScanStatus>("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        if (!open) {
            if (scannerRef.current) { scannerRef.current.stop(); scannerRef.current.destroy(); scannerRef.current = null; }
            setStatus("idle"); setErrorMessage(""); return;
        }
        let cancelled = false;
        async function startScanner() {
            if (!videoRef.current) return;
            setStatus("loading");
            try {
                const { default: QrScanner } = await import("qr-scanner");
                const hasCamera = await QrScanner.hasCamera();
                if (!hasCamera) { if (!cancelled) { setStatus("error"); setErrorMessage("No camera found on this device."); } return; }
                if (cancelled) return;
                const scanner = new QrScanner(videoRef.current!, (result) => { scanner.stop(); onScan(result.data); onClose(); },
                    { preferredCamera: "environment", highlightScanRegion: true, highlightCodeOutline: true, maxScansPerSecond: 5 });
                scannerRef.current = scanner;
                await scanner.start();
                if (!cancelled) setStatus("scanning");
            } catch (err) {
                if (!cancelled) {
                    setStatus("error");
                    if (err instanceof Error) {
                        if (err.name === "NotAllowedError" || err.message.includes("denied"))
                            setErrorMessage("Camera access was denied. Please allow camera permissions and try again.");
                        else if (err.message.toLowerCase().includes("https") || err.message.toLowerCase().includes("secure"))
                            setErrorMessage("Camera requires HTTPS. Run npm run dev:network and connect via the https:// address in your terminal.");
                        else setErrorMessage(err.message || "Could not start the camera.");
                    } else setErrorMessage("Could not start the camera.");
                }
            }
        }
        startScanner();
        return () => { cancelled = true; if (scannerRef.current) { scannerRef.current.stop(); scannerRef.current.destroy(); scannerRef.current = null; } };
    }, [open, onScan, onClose]);

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="sm:max-w-sm p-4">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <QrCode className="h-4 w-4" /> Scan QR Code
                    </DialogTitle>
                </DialogHeader>
                <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-black">
                    <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                    {(status === "idle" || status === "loading") && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 text-white">
                            {status === "loading" ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
                            <p className="text-sm">{status === "loading" ? "Starting camera…" : "Initializing…"}</p>
                        </div>
                    )}
                    {status === "error" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 text-white p-6 text-center">
                            <AlertCircle className="h-8 w-8 text-red-400 shrink-0" />
                            <p className="text-sm text-red-300 leading-relaxed">{errorMessage}</p>
                        </div>
                    )}
                    {status === "scanning" && (
                        <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
                            <span className="text-xs text-white bg-black/50 px-3 py-1 rounded-full">Point at QR code</span>
                        </div>
                    )}
                </div>
                <Button variant="outline" onClick={onClose} className="w-full mt-1">Cancel</Button>
            </DialogContent>
        </Dialog>
    );
}
