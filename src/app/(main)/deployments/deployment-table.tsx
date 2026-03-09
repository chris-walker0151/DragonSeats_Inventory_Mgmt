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
    PRODUCT_CATEGORY_LABELS,
    PRODUCT_CATEGORY_COLORS,
    AVAILABILITY_LABELS,
    AVAILABILITY_COLORS,
} from "@/lib/deployments/constants";
import {
    WAREHOUSE_LOCATION_LABELS,
} from "@/lib/serialized-assets/constants";
import type { DeploymentAssetItem } from "@/lib/deployments/types";
import { cn } from "@/lib/utils";

interface DeploymentTableProps {
    assets: DeploymentAssetItem[];
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onToggleAll: () => void;
}

function locationDisplay(asset: DeploymentAssetItem): string {
    if (asset.deployedLocationName) return asset.deployedLocationName;
    return WAREHOUSE_LOCATION_LABELS[asset.currentLocation];
}

export function DeploymentTable({
    assets,
    selectedIds,
    onToggleSelect,
    onToggleAll,
}: DeploymentTableProps) {
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
                        <TableHead className="whitespace-nowrap">Category</TableHead>
                        <TableHead className="whitespace-nowrap">Availability</TableHead>
                        <TableHead className="whitespace-nowrap">Customer</TableHead>
                        <TableHead className="whitespace-nowrap">Location</TableHead>
                        <TableHead className="whitespace-nowrap">Deployed</TableHead>
                        <TableHead className="whitespace-nowrap">Expected Return</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assets.map((asset) => {
                        const isOverdue =
                            asset.availability === "deployed" &&
                            asset.expectedReturnDate !== null &&
                            new Date(asset.expectedReturnDate) < new Date();

                        return (
                            <TableRow key={asset.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.has(asset.id)}
                                        onCheckedChange={() => onToggleSelect(asset.id)}
                                        aria-label={`Select asset ${asset.serialNumber}`}
                                    />
                                </TableCell>
                                <TableCell className="font-mono text-xs font-medium whitespace-nowrap">
                                    {asset.serialNumber}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        className={cn(
                                            "text-[10px]",
                                            PRODUCT_CATEGORY_COLORS[asset.productCategory],
                                        )}
                                    >
                                        {PRODUCT_CATEGORY_LABELS[asset.productCategory]}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        className={cn(
                                            "text-[10px]",
                                            AVAILABILITY_COLORS[asset.availability],
                                        )}
                                    >
                                        {AVAILABILITY_LABELS[asset.availability]}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium whitespace-nowrap">
                                    {asset.customerName ?? <Dash />}
                                </TableCell>
                                <TableCell className="text-sm whitespace-nowrap">
                                    {locationDisplay(asset)}
                                </TableCell>
                                <TableCell className="text-sm tabular-nums text-muted-foreground whitespace-nowrap">
                                    {asset.deploymentDate
                                        ? new Date(asset.deploymentDate).toLocaleDateString()
                                        : <Dash />}
                                </TableCell>
                                <TableCell className="text-sm tabular-nums whitespace-nowrap">
                                    {asset.expectedReturnDate ? (
                                        <span className={cn(isOverdue && "text-amber-400 font-medium")}>
                                            {new Date(asset.expectedReturnDate).toLocaleDateString()}
                                            {isOverdue && " ⚠"}
                                        </span>
                                    ) : (
                                        <Dash />
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

function Dash() {
    return <span className="text-muted-foreground/40">&mdash;</span>;
}
