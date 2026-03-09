"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Bookmark, Truck, AlertTriangle } from "lucide-react";
import type { AvailabilitySummary, AvailabilityTileFilter } from "@/lib/deployments/types";
import { cn } from "@/lib/utils";

const TILES = [
    { key: "available" as const, label: "Available", icon: CheckCircle, color: "text-green-600" },
    { key: "reserved" as const, label: "Reserved", icon: Bookmark, color: "text-yellow-600" },
    { key: "deployed" as const, label: "Deployed", icon: Truck, color: "text-blue-600" },
    { key: "down" as const, label: "Down", icon: AlertTriangle, color: "text-red-500" },
];

interface AvailabilitySummaryCardsProps {
    summary: AvailabilitySummary;
    activeFilter: AvailabilityTileFilter;
    onFilterChange: (filter: AvailabilityTileFilter) => void;
}

export function AvailabilitySummaryCards({
    summary,
    activeFilter,
    onFilterChange,
}: AvailabilitySummaryCardsProps) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TILES.map(({ key, label, icon: Icon, color }) => {
                const isActive = activeFilter === key;
                return (
                    <Card
                        key={key}
                        className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            isActive
                                ? "ring-2 ring-primary"
                                : "hover:bg-muted/50",
                        )}
                        onClick={() => onFilterChange(isActive ? "all" : key)}
                    >
                        <CardContent className="flex items-center gap-3 py-3 px-4">
                            <div className="rounded-lg bg-muted p-2">
                                <Icon className={cn("h-5 w-5", color)} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold tabular-nums">
                                    {summary[key]}
                                </p>
                                <p className="text-xs text-muted-foreground">{label}</p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
