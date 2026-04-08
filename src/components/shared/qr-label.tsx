"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface QRLabelProps {
    assetId: string;
    assetName: string;
    serialNumber: string;
    qrCodeUrl: string;
}

/**
 * Printable QR label for a serialized asset.
 *
 * Renders the QR image, asset name, serial number, and a short human-readable ID.
 * The "Print Label" button triggers window.print(); the @media print styles ensure
 * only the label is visible on the printed page.
 */
export function QRLabel({ assetId, assetName, serialNumber, qrCodeUrl }: QRLabelProps) {
    const shortId = assetId.slice(0, 8).toUpperCase();

    return (
        <>
            {/* Print-only styles injected inline so they don't depend on global CSS */}
            <style>{`
                @media print {
                    body > * { display: none !important; }
                    #qr-label-print-root { display: flex !important; }
                }
            `}</style>

            <div className="space-y-3">
                {/* Label preview */}
                <div
                    id="qr-label-print-root"
                    className="flex flex-col items-center gap-2 rounded-lg border bg-white p-4 text-black w-fit"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={qrCodeUrl}
                        alt={`QR code for ${serialNumber}`}
                        width={200}
                        height={200}
                        className="block"
                    />
                    <div className="text-center space-y-0.5">
                        <p className="text-sm font-semibold leading-tight">{assetName}</p>
                        <p className="text-xs font-mono">{serialNumber}</p>
                        <p className="text-[10px] text-gray-500 font-mono">ID: {shortId}</p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="gap-2"
                >
                    <Printer className="h-3.5 w-3.5" />
                    Print Label
                </Button>
            </div>
        </>
    );
}
