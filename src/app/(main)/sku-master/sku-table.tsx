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
} from "@/lib/serialized-assets/constants";
import type { SkuListItem } from "@/lib/sku-master/types";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

interface SkuTableProps {
    skus: SkuListItem[];
}

export function SkuTable({ skus }: SkuTableProps) {
    if (skus.length === 0) {
        return (
            <div className="rounded-md border p-12 text-center">
                <p className="text-muted-foreground">No SKUs match your filters.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead>SKU Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead className="text-right">Assets</TableHead>
                    <TableHead>Notes</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {skus.map((sku) => (
                    <TableRow key={sku.id}>
                        <TableCell className="font-mono text-xs font-bold">
                            {sku.sku}
                        </TableCell>
                        <TableCell>
                            <Badge
                                className={cn(
                                    "text-[10px]",
                                    PRODUCT_CATEGORY_COLORS[sku.productCategory],
                                )}
                            >
                                {PRODUCT_CATEGORY_LABELS[sku.productCategory]}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{sku.productDescription}</TableCell>
                        <TableCell>
                            <Badge
                                variant={sku.isSerialized ? "info" : "secondary"}
                                className="text-[10px]"
                            >
                                {sku.isSerialized ? "Serialized" : "Quantity"}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            {sku.assetCount > 0 ? (
                                <span className="inline-flex items-center gap-1 text-sm font-medium tabular-nums">
                                    <Package className="h-3 w-3 text-muted-foreground" />
                                    {sku.assetCount}
                                </span>
                            ) : (
                                <span className="text-muted-foreground/40">0</span>
                            )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {sku.notes ?? "—"}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
