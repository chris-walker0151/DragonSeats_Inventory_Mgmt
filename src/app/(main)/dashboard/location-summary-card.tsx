"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    WAREHOUSE_LOCATION_LABELS,
    LIFECYCLE_STATUS_COLORS,
} from "@/lib/serialized-assets/constants";
import { WAREHOUSES } from "@/lib/constants";
import type { WarehouseLocation, LifecycleStatus } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface LocationRow {
    currentLocation: WarehouseLocation;
    lifecycleStatus: LifecycleStatus;
    count: number;
}

const WAREHOUSE_KEYS: WarehouseLocation[] = [
    "cleveland_warehouse",
    "kansas_city_warehouse",
    "jacksonville_warehouse",
];

export function LocationSummaryCard({
    data,
    className,
}: {
    data: LocationRow[];
    className?: string;
}) {
    // Build lookup: location -> status -> count
    const lookup = new Map<string, Map<string, number>>();
    for (const row of data) {
        if (!lookup.has(row.currentLocation)) {
            lookup.set(row.currentLocation, new Map());
        }
        lookup.get(row.currentLocation)!.set(row.lifecycleStatus, row.count);
    }

    // Count deployed assets (they're in "deployed_customer" location)
    const deployedCount = data
        .filter((r) => r.currentLocation === "deployed_customer")
        .reduce((sum, r) => sum + r.count, 0);

    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">Assets by Location</CardTitle>
                </div>
                <CardDescription>Warehouse distribution overview</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-5">
                    {WAREHOUSE_KEYS.map((locKey) => {
                        const warehouseInfo = WAREHOUSES.find((w) => w.location === locKey);
                        const statusMap = lookup.get(locKey);
                        const available = statusMap?.get("in_warehouse_available") ?? 0;
                        const reserved = statusMap?.get("in_warehouse_reserved") ?? 0;
                        const total = available + reserved;

                        return (
                            <div key={locKey} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="inline-block h-2.5 w-2.5 rounded-full"
                                            style={{
                                                backgroundColor: warehouseInfo?.color ?? "var(--muted)",
                                            }}
                                        />
                                        <span className="text-sm font-medium">
                                            {WAREHOUSE_LOCATION_LABELS[locKey]}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold tabular-nums">{total}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        className={cn(
                                            "text-[10px]",
                                            LIFECYCLE_STATUS_COLORS.in_warehouse_available,
                                        )}
                                    >
                                        {available} available
                                    </Badge>
                                    <Badge
                                        className={cn(
                                            "text-[10px]",
                                            LIFECYCLE_STATUS_COLORS.in_warehouse_reserved,
                                        )}
                                    >
                                        {reserved} reserved
                                    </Badge>
                                </div>
                            </div>
                        );
                    })}

                    {/* Deployed summary */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Badge
                                    className={cn(
                                        "text-[10px]",
                                        LIFECYCLE_STATUS_COLORS.deployed_customer,
                                    )}
                                >
                                    Deployed
                                </Badge>
                            </div>
                            <span className="text-sm font-bold tabular-nums">{deployedCount}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Currently at customer sites
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
