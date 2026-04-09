"use client";

import { QRCodeSVG } from "qrcode.react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface QrCodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assetId: string;
    serialNumber: string;
}

export function QrCodeDialog({ open, onOpenChange, assetId, serialNumber }: QrCodeDialogProps) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const url = `${baseUrl}/serialized-assets/${assetId}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xs">
                <DialogHeader>
                    <DialogTitle>QR Code — {serialNumber}</DialogTitle>
                    <DialogDescription>
                        Scan to open this asset&apos;s profile on any device.
                    </DialogDescription>
                </DialogHeader>

                {/* Print isolation: @media print hides everything except this div */}
                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        #qr-print-area, #qr-print-area * { visibility: visible; }
                        #qr-print-area {
                            position: fixed;
                            left: 50%;
                            top: 50%;
                            transform: translate(-50%, -50%);
                            text-align: center;
                        }
                    }
                `}</style>

                <div id="qr-print-area" className="flex flex-col items-center gap-3 py-2">
                    <QRCodeSVG
                        value={url}
                        size={200}
                        level="M"
                        className="rounded"
                    />
                    <p className="text-center text-xs text-muted-foreground font-mono break-all px-2">
                        {url}
                    </p>
                    <p className="text-center text-sm font-semibold print:block hidden">
                        {serialNumber}
                    </p>
                </div>

                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.print()}
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Print QR Code
                </Button>
            </DialogContent>
        </Dialog>
    );
}
