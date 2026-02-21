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
    WAREHOUSE_LOCATION_LABELS,
    WAREHOUSE_LOCATION_COLORS,
} from "@/lib/serialized-assets/constants";
import type { QuantityInventoryListItem } from "@/lib/quantity-inventory/types";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface QuantityTableProps {
    items: QuantityInventoryListItem[];
    onSelect: (item: QuantityInventoryListItem) => void;
}

export function QuantityTable({ items, onSelect }: QuantityTableProps) {
    if (items.length === 0) {
        return (
            <div className="rounded-md border p-12 text-center">
                <p className="text-muted-foreground">No inventory items match your filters.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead>Category</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">On Hand</TableHead>
                    <TableHead className="text-right">Reorder Level</TableHead>
                    <TableHead>Last Count</TableHead>
                    <TableHead>Responsible</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => {
                    const isLow = item.quantityOnHand <= item.reorderLevel;
                    return (
                        <TableRow
                            key={item.id}
                            className="cursor-pointer"
                            tabIndex={0}
                            role="button"
                            aria-label={`View details for ${item.itemCategory}${item.itemVariant ? ` ${item.itemVariant}` : ""}`}
                            onClick={() => onSelect(item)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onSelect(item);
                                }
                            }}
                        >
                            <TableCell className="font-medium">{item.itemCategory}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {item.itemVariant ?? "—"}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    className={cn(
                                        "text-[10px]",
                                        WAREHOUSE_LOCATION_COLORS[item.location],
                                    )}
                                >
                                    {WAREHOUSE_LOCATION_LABELS[item.location]}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                <span className={cn("font-medium", isLow && "text-amber-400")}>
                                    {item.quantityOnHand}
                                </span>
                                {isLow && (
                                    <AlertTriangle className="ml-1.5 inline-block h-3 w-3 text-amber-400" />
                                )}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">
                                {item.reorderLevel}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground tabular-nums">
                                {item.lastCountDate
                                    ? new Date(item.lastCountDate).toLocaleDateString()
                                    : "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {item.responsiblePerson ?? "—"}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
