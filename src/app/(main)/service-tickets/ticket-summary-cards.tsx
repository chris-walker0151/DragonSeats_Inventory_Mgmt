"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { DownedEquipmentSummary } from "@/lib/service-tickets/types";
import { ArrowDownCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type TileFilter = "all" | "30plus";

export function TicketSummaryCards({
    summary,
    activeTile,
    onTileClick,
}: {
    summary: DownedEquipmentSummary;
    activeTile: TileFilter;
    onTileClick: (tile: TileFilter) => void;
}) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <Card
                className={cn(
                    "cursor-pointer transition-colors",
                    activeTile === "all"
                        ? "ring-2 ring-primary"
                        : "hover:bg-muted/50",
                )}
                onClick={() => onTileClick("all")}
            >
                <CardContent className="flex items-center gap-4 p-5">
                    <div className="rounded-lg bg-muted p-2.5">
                        <ArrowDownCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold tabular-nums">{summary.downedCount}</p>
                        <p className="text-xs text-muted-foreground">Downed Equipment</p>
                        <p className="text-[10px] text-muted-foreground/60">Assets with &quot;Down&quot; availability</p>
                    </div>
                </CardContent>
            </Card>

            <Card
                className={cn(
                    "cursor-pointer transition-colors",
                    activeTile === "30plus"
                        ? "ring-2 ring-primary"
                        : "hover:bg-muted/50",
                )}
                onClick={() => onTileClick("30plus")}
            >
                <CardContent className="flex items-center gap-4 p-5">
                    <div className="rounded-lg bg-muted p-2.5">
                        <Clock className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold tabular-nums">{summary.downed30PlusCount}</p>
                        <p className="text-xs text-muted-foreground">Downed 30+ Days</p>
                        <p className="text-[10px] text-muted-foreground/60">With active service ticket 30+ days</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
