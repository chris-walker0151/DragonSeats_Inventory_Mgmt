"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function MainError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to console in development, Sentry in production
        console.error("Page error:", error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle>Something went wrong</CardTitle>
                    <CardDescription>
                        An unexpected error occurred while loading this page.
                        {error.digest && (
                            <span className="mt-1 block font-mono text-[10px] text-muted-foreground/60">
                                Error ID: {error.digest}
                            </span>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-3">
                    <Button onClick={reset} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        If this keeps happening, check your database connection.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
