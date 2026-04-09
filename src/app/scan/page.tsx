"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { QrScannerDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ScanLine, QrCode, RotateCcw } from "lucide-react";

export default function ScanTestPage() {
    const [scannerOpen, setScannerOpen] = useState(false);
    const [lastResult, setLastResult] = useState<string | null>(null);
    const [history, setHistory] = useState<string[]>([]);

    function handleScan(value: string) {
        setLastResult(value);
        setHistory((prev) => [value, ...prev].slice(0, 10));
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-start p-6 gap-6">
            <div className="w-full max-w-sm text-center space-y-1 pt-8">
                <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                    <QrCode className="h-5 w-5" /> QR Scanner Test
                </div>
                <p className="text-sm text-muted-foreground">Use this page to verify QR scanning works on this device.</p>
            </div>
            <Button size="lg" className="w-full max-w-sm gap-2" onClick={() => setScannerOpen(true)}>
                <ScanLine className="h-5 w-5" /> Open Scanner
            </Button>
            {lastResult && (
                <div className="w-full max-w-sm rounded-lg border bg-muted/30 p-4 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Last scanned value</p>
                    <p className="text-sm font-mono break-all">{lastResult}</p>
                </div>
            )}
            {history.length > 0 && (
                <div className="w-full max-w-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Scan history ({history.length})</p>
                        <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs" onClick={() => { setHistory([]); setLastResult(null); }}>
                            <RotateCcw className="h-3 w-3" /> Clear
                        </Button>
                    </div>
                    <div className="rounded-lg border divide-y">
                        {history.map((value, i) => <div key={i} className="px-3 py-2 text-sm font-mono break-all">{value}</div>)}
                    </div>
                </div>
            )}
            <p className="w-full max-w-sm text-xs text-muted-foreground text-center pb-8">
                Camera requires HTTPS on mobile. <span className="font-medium">Run npm run dev:network</span> and connect via the https:// address in your terminal.
            </p>
            <QrScannerDialog open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleScan} />
        </div>
    );
}
