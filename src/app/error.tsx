"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global error:", error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <div className="max-w-md w-full text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-7 w-7 text-destructive" />
                </div>
                <h1 className="text-xl font-bold">Application Error</h1>
                <p className="text-sm text-muted-foreground">
                    Something went wrong at the application level. This is likely a
                    configuration or connectivity issue.
                </p>
                <Button onClick={reset} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Reload
                </Button>
            </div>
        </div>
    );
}
