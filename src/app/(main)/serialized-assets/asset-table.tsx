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
import { Checkbox } from "@/components/ui/checkbox";
import {
    WAREHOUSE_LOCATION_LABELS,
    WAREHOUSE_LOCATION_COLORS,
    CONDITION_COLORS,
} from "@/lib/serialized-assets/constants";
import type { SerializedAssetListItem } from "@/lib/serialized-assets/types";
import { cn } from "@/lib/utils";

interface AssetTableProps {
    assets: SerializedAssetListItem[];
    onSelect: (id: string) => void;
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onToggleAll: () => void;
}

function locationDisplay(asset: SerializedAssetListItem): string {
    if (asset.deployedLocationName) {
        return asset.deployedLocationName;
    }
    return WAREHOUSE_LOCATION_LABELS[asset.currentLocation];
}

function locationColor(asset: SerializedAssetListItem): string {
    const name = asset.deployedLocationName;
    if (name === "Retired") return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (name?.startsWith("Reserved")) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    if (name?.startsWith("Refurbish")) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    return WAREHOUSE_LOCATION_COLORS[asset.currentLocation];
}

export function AssetTable({ assets, onSelect, selectedIds, onToggleSelect, onToggleAll }: AssetTableProps) {
    const allSelected = assets.length > 0 && assets.every((a) => selectedIds.has(a.id));
    const someSelected = assets.some((a) => selectedIds.has(a.id)) && !allSelected;
    if (assets.length === 0) {
        return (
            <div className="rounded-md border p-12 text-center">
                <p className="text-muted-foreground">No assets match your filters.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-10">
                            <Checkbox
                                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                                onCheckedChange={onToggleAll}
                                aria-label="Select all assets"
                            />
                        </TableHead>
                        <TableHead className="whitespace-nowrap">Asset #</TableHead>
                        <TableHead className="whitespace-nowrap">Asset Type</TableHead>
                        <TableHead className="whitespace-nowrap">Manufacturer</TableHead>
                        <TableHead className="whitespace-nowrap">Condition</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="whitespace-nowrap">Availability</TableHead>
                        <TableHead className="whitespace-nowrap">Location</TableHead>
                        <TableHead className="whitespace-nowrap">Manifold</TableHead>
                        <TableHead className="whitespace-nowrap">Deck Type</TableHead>
                        <TableHead className="whitespace-nowrap">Seat Type</TableHead>
                        <TableHead className="whitespace-nowrap">Wheels</TableHead>
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
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                    checked={selectedIds.has(asset.id)}
                                    onCheckedChange={() => onToggleSelect(asset.id)}
                                    aria-label={`Select asset ${asset.serialNumber}`}
                                />
                            </TableCell>
                            <TableCell className="font-mono text-xs font-medium whitespace-nowrap">
                                {asset.serialNumber}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                                {asset.productTypeModel ?? <Dash />}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                                {asset.manufacturer ?? <Dash />}
                            </TableCell>
                            <TableCell>
                                {asset.condition ? (
                                    <Badge className={cn("text-[10px]", CONDITION_COLORS[asset.condition] ?? "bg-gray-800 text-gray-300")}>
                                        {asset.condition}
                                    </Badge>
                                ) : <Dash />}
                            </TableCell>
                            <TableCell className="text-xs whitespace-nowrap">
                                {asset.benchStatus ?? <Dash />}
                            </TableCell>
                            <TableCell className="text-xs whitespace-nowrap">
                                {asset.availability ?? <Dash />}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    className={cn(
                                        "text-[10px] whitespace-nowrap",
                                        locationColor(asset),
                                    )}
                                >
                                    {locationDisplay(asset)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-xs whitespace-nowrap">
                                {asset.manifoldStyle ?? <Dash />}
                            </TableCell>
                            <TableCell className="text-xs whitespace-nowrap">
                                {asset.deckType ?? <Dash />}
                            </TableCell>
                            <TableCell className="text-xs whitespace-nowrap">
                                {asset.seatType ?? <Dash />}
                            </TableCell>
                            <TableCell className="text-xs whitespace-nowrap">
                                {asset.wheelType ?? <Dash />}
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
