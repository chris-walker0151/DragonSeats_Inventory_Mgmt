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
    PRODUCT_CATEGORY_LABELS,
    PRODUCT_CATEGORY_COLORS,
    LIFECYCLE_STATUS_LABELS,
    LIFECYCLE_STATUS_COLORS,
    MAINTENANCE_AGE_WARNING,
    MAINTENANCE_AGE_CRITICAL,
} from "@/lib/maintenance/constants";
import type { MaintenanceListItem } from "@/lib/maintenance/types";
import { cn } from "@/lib/utils";

interface MaintenanceTableProps {
    assets: MaintenanceListItem[];
    onSelect: (id: string) => void;
}

function getAgeClass(yearManufactured: number | null): string {
    if (!yearManufactured) return "";
    const age = new Date().getFullYear() - yearManufactured;
    if (age >= MAINTENANCE_AGE_CRITICAL) return "border-l-2 border-l-red-500";
    if (age >= MAINTENANCE_AGE_WARNING) return "border-l-2 border-l-yellow-500";
    return "";
}

function needsReview(item: MaintenanceListItem): boolean {
    if (!item.yearManufactured) return false;
    const age = new Date().getFullYear() - item.yearManufactured;
    return age >= MAINTENANCE_AGE_WARNING && !item.lastRefurbishedDate;
}

export function MaintenanceTable({ assets, onSelect }: MaintenanceTableProps) {
    if (assets.length === 0) {
        return (
            <div className="rounded-md border p-12 text-center">
                <p className="text-muted-foreground">No assets match your filters.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead>Serial #</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Year Mfg</TableHead>
                    <TableHead>Last Refurbished</TableHead>
                    <TableHead>Maintenance Notes</TableHead>
                    <TableHead>Customer</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {assets.map((asset) => (
                    <TableRow
                        key={asset.id}
                        className={cn("cursor-pointer", getAgeClass(asset.yearManufactured))}
                        tabIndex={0}
                        role="button"
                        aria-label={`View maintenance details for ${asset.serialNumber}`}
                        onClick={() => onSelect(asset.id)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onSelect(asset.id);
                            }
                        }}
                    >
                        <TableCell className="font-mono text-xs font-medium">
                            {asset.serialNumber}
                        </TableCell>
                        <TableCell>
                            <Badge className={cn("text-[10px]", PRODUCT_CATEGORY_COLORS[asset.productCategory])}>
                                {PRODUCT_CATEGORY_LABELS[asset.productCategory]}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge className={cn("text-[10px]", LIFECYCLE_STATUS_COLORS[asset.lifecycleStatus])}>
                                {LIFECYCLE_STATUS_LABELS[asset.lifecycleStatus]}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-sm tabular-nums">
                            {asset.yearManufactured ?? <span className="text-muted-foreground/40">—</span>}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums">
                            {asset.lastRefurbishedDate ? (
                                new Date(asset.lastRefurbishedDate).toLocaleDateString()
                            ) : needsReview(asset) ? (
                                <Badge className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                    Needs Review
                                </Badge>
                            ) : (
                                <span className="text-muted-foreground/40">—</span>
                            )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {asset.maintenanceNotes ?? <span className="text-muted-foreground/40">—</span>}
                        </TableCell>
                        <TableCell className="text-sm">
                            {asset.customerName ?? <span className="text-muted-foreground/40">—</span>}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
