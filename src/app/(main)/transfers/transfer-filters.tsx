"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    TRANSFER_STATUS_LABELS,
    ALL_TRANSFER_STATUSES,
} from "@/lib/transfers/constants";
import {
    WAREHOUSE_LOCATION_LABELS,
    ALL_WAREHOUSE_LOCATIONS,
} from "@/lib/serialized-assets/constants";
import type { TransferStatus, WarehouseLocation } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeftRight } from "lucide-react";

type StatusFilter = TransferStatus | "all";
type LocationFilter = WarehouseLocation | "all";

// Only warehouse locations, not deployed_customer
const WAREHOUSE_ONLY = ALL_WAREHOUSE_LOCATIONS.filter(
    (loc) => loc !== "deployed_customer",
);

interface TransferFiltersProps {
    statusFilter: StatusFilter;
    originFilter: LocationFilter;
    search: string;
    onStatusChange: (v: StatusFilter) => void;
    onOriginChange: (v: LocationFilter) => void;
    onSearchChange: (v: string) => void;
    resultCount: number;
    inTransitCount: number;
}

export function TransferFilters({
    statusFilter,
    originFilter,
    search,
    onStatusChange,
    onOriginChange,
    onSearchChange,
    resultCount,
    inTransitCount,
}: TransferFiltersProps) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search asset, item, person..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                        aria-label="Search transfers"
                    />
                </div>

                <Select
                    value={statusFilter}
                    onValueChange={(v) => onStatusChange(v as StatusFilter)}
                >
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {ALL_TRANSFER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                                {TRANSFER_STATUS_LABELS[s]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={originFilter}
                    onValueChange={(v) => onOriginChange(v as LocationFilter)}
                >
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Origin" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Origins</SelectItem>
                        {WAREHOUSE_ONLY.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                                {WAREHOUSE_LOCATION_LABELS[loc]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground tabular-nums">
                    {resultCount} transfer{resultCount !== 1 ? "s" : ""}
                </p>
                {inTransitCount > 0 && (
                    <Badge variant="warning" className="text-[10px] gap-1">
                        <ArrowLeftRight className="h-3 w-3" />
                        {inTransitCount} in transit
                    </Badge>
                )}
            </div>
        </div>
    );
}
