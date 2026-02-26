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
    WAREHOUSE_LOCATION_LABELS,
    WAREHOUSE_LOCATION_COLORS,
    BRANDING_STATUS_LABELS,
    BRANDING_STATUS_COLORS,
} from "@/lib/serialized-assets/constants";
import type { SerializedAssetListItem } from "@/lib/serialized-assets/types";
import { cn } from "@/lib/utils";

interface AssetTableProps {
    assets: SerializedAssetListItem[];
    onSelect: (id: string) => void;
}

export function AssetTable({ assets, onSelect }: AssetTableProps) {
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
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Branding</TableHead>
                    <TableHead>SKU</TableHead>
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
                        <TableCell className="font-mono text-xs font-medium">
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
                        <TableCell className="text-sm text-muted-foreground">
                            {asset.productTypeModel ?? "—"}
                        </TableCell>
                        <TableCell>
                            <Badge
                                className={cn(
                                    "text-[10px]",
                                    LIFECYCLE_STATUS_COLORS[asset.lifecycleStatus],
                                )}
                            >
                                {LIFECYCLE_STATUS_LABELS[asset.lifecycleStatus]}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge
                                className={cn(
                                    "text-[10px]",
                                    WAREHOUSE_LOCATION_COLORS[asset.currentLocation],
                                )}
                            >
                                {WAREHOUSE_LOCATION_LABELS[asset.currentLocation]}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                            {asset.lifecycleStatus === "deployed_customer" && asset.customerName ? (
                                <Badge className={cn("text-[10px]", LIFECYCLE_STATUS_COLORS["deployed_customer"])}>
                                    {asset.customerName}
                                </Badge>
                            ) : asset.customerName ? (
                                asset.customerName
                            ) : (
                                <span className="text-muted-foreground/40">—</span>
                            )}
                        </TableCell>
                        <TableCell>
                            {asset.brandingStatus ? (
                                <Badge
                                    className={cn(
                                        "text-[10px]",
                                        BRANDING_STATUS_COLORS[asset.brandingStatus],
                                    )}
                                >
                                    {BRANDING_STATUS_LABELS[asset.brandingStatus]}
                                </Badge>
                            ) : (
                                <span className="text-muted-foreground/40">—</span>
                            )}
                        </TableCell>
                        <TableCell className="font-mono text-[10px] text-muted-foreground">
                            {asset.skuCode ?? "—"}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
