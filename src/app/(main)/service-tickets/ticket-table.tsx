"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    DAYS_DOWN_WARNING,
    DAYS_DOWN_CRITICAL,
} from "@/lib/service-tickets/constants";
import {
    WAREHOUSE_LOCATION_LABELS,
    WAREHOUSE_LOCATION_COLORS,
    CONDITION_COLORS,
} from "@/lib/serialized-assets/constants";
import type { DownedAssetListItem } from "@/lib/service-tickets/types";
import { cn } from "@/lib/utils";

interface TicketTableProps {
    assets: DownedAssetListItem[];
    onSelect: (id: string) => void;
}

function daysDownColor(days: number | null): string {
    if (days == null) return "";
    if (days >= DAYS_DOWN_CRITICAL) return "text-red-500 font-semibold";
    if (days >= DAYS_DOWN_WARNING) return "text-orange-500 font-medium";
    return "";
}

export function TicketTable({ assets, onSelect }: TicketTableProps) {
    if (assets.length === 0) {
        return (
            <div className="rounded-md border p-12 text-center">
                <p className="text-muted-foreground">No downed assets match your filters.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="whitespace-nowrap">Asset #</TableHead>
                        <TableHead className="whitespace-nowrap">Asset Type</TableHead>
                        <TableHead className="whitespace-nowrap">Availability</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="whitespace-nowrap">Condition</TableHead>
                        <TableHead className="whitespace-nowrap">Downed Date</TableHead>
                        <TableHead className="whitespace-nowrap"># Days Down</TableHead>
                        <TableHead className="whitespace-nowrap">Location</TableHead>
                        <TableHead className="whitespace-nowrap">Assigned Technician</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assets.map((asset) => (
                        <TableRow
                            key={asset.id}
                            className="cursor-pointer"
                            tabIndex={0}
                            role="button"
                            aria-label={`View details for asset ${asset.serialNumber}`}
                            onClick={() => onSelect(asset.id)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onSelect(asset.id);
                                }
                            }}
                        >
                            <TableCell className="font-mono text-xs font-medium whitespace-nowrap">
                                {asset.serialNumber}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                                {asset.productTypeModel ?? <Dash />}
                            </TableCell>
                            <TableCell className="text-xs whitespace-nowrap">
                                <Badge className="bg-red-900 text-red-200 text-[10px]">
                                    {asset.availability ?? <Dash />}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-xs whitespace-nowrap">
                                {asset.benchStatus ?? <Dash />}
                            </TableCell>
                            <TableCell>
                                {asset.condition ? (
                                    <Badge className={cn("text-[10px]", CONDITION_COLORS[asset.condition] ?? "bg-gray-800 text-gray-300")}>
                                        {asset.condition}
                                    </Badge>
                                ) : <Dash />}
                            </TableCell>
                            <TableCell className="text-xs tabular-nums whitespace-nowrap">
                                {asset.downedDate
                                    ? new Date(asset.downedDate).toLocaleDateString()
                                    : <Dash />}
                            </TableCell>
                            <TableCell
                                className={cn(
                                    "font-mono text-xs tabular-nums",
                                    daysDownColor(asset.daysDown),
                                )}
                            >
                                {asset.daysDown != null ? `${asset.daysDown}d` : <Dash />}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    className={cn(
                                        "text-[10px] whitespace-nowrap",
                                        WAREHOUSE_LOCATION_COLORS[asset.currentLocation],
                                    )}
                                >
                                    {WAREHOUSE_LOCATION_LABELS[asset.currentLocation]}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                                {asset.assignedTechnician ?? <Dash />}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function Dash() {
    return <span className="text-muted-foreground/40">&mdash;</span>;
}
