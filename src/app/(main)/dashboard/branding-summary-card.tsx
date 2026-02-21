"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";

interface BrandingData {
    branded: number;
    unbranded: number;
    total: number;
}

export function BrandingSummaryCard({
    data,
    className,
}: {
    data: BrandingData;
    className?: string;
}) {
    const brandedPercent = data.total > 0 ? Math.round((data.branded / data.total) * 100) : 0;

    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">Bench Branding</CardTitle>
                </div>
                <CardDescription>Branded vs. unbranded bench fleet</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-3xl font-bold tabular-nums">{brandedPercent}%</p>
                            <p className="text-xs text-muted-foreground">of benches branded</p>
                        </div>
                        <p className="text-sm text-muted-foreground tabular-nums">
                            {data.total} total benches
                        </p>
                    </div>

                    <Progress value={brandedPercent} className="h-2" />

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Branded</p>
                            <p className="text-xl font-bold tabular-nums text-indigo-400">
                                {data.branded}
                            </p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Unbranded</p>
                            <p className="text-xl font-bold tabular-nums text-muted-foreground">
                                {data.unbranded}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
