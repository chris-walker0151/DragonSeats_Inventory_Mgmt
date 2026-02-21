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
    TRANSFER_STATUS_LABELS,
    TRANSFER_STATUS_COLORS,
} from "@/lib/transfers/constants";
import {
    WAREHOUSE_LOCATION_LABELS,
    WAREHOUSE_LOCATION_COLORS,
    PRODUCT_CATEGORY_LABELS,
    PRODUCT_CATEGORY_COLORS,
} from "@/lib/serialized-assets/constants";
import type { TransferListItem } from "@/lib/transfers/types";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface TransferTableProps {
    transfers: TransferListItem[];
}

export function TransferTable({ transfers }: TransferTableProps) {
    if (transfers.length === 0) {
        return (
            <div className="rounded-md border p-12 text-center">
                <p className="text-muted-foreground">No transfers match your filters.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Initiated By</TableHead>
                    <TableHead>Received By</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transfers.map((t) => {
                    const isAsset = t.assetId !== null;
                    return (
                        <TableRow key={t.id}>
                            <TableCell>
                                {isAsset ? (
                                    <span className="font-mono text-xs font-medium">
                                        {t.assetSerialNumber}
                                    </span>
                                ) : (
                                    <span className="text-sm">
                                        {t.quantityItemCategory}
                                        {t.quantity != null && (
                                            <span className="ml-1 text-muted-foreground">
                                                ×{t.quantity}
                                            </span>
                                        )}
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>
                                {isAsset && t.assetProductCategory ? (
                                    <Badge
                                        className={cn(
                                            "text-[10px]",
                                            PRODUCT_CATEGORY_COLORS[t.assetProductCategory],
                                        )}
                                    >
                                        {PRODUCT_CATEGORY_LABELS[t.assetProductCategory]}
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-[10px]">
                                        Quantity
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <Badge
                                        className={cn(
                                            "text-[10px]",
                                            WAREHOUSE_LOCATION_COLORS[t.originLocation],
                                        )}
                                    >
                                        {WAREHOUSE_LOCATION_LABELS[t.originLocation]}
                                    </Badge>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                    <Badge
                                        className={cn(
                                            "text-[10px]",
                                            WAREHOUSE_LOCATION_COLORS[t.destinationLocation],
                                        )}
                                    >
                                        {WAREHOUSE_LOCATION_LABELS[t.destinationLocation]}
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell className="text-sm tabular-nums text-muted-foreground">
                                {new Date(t.transferDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    className={cn(
                                        "text-[10px]",
                                        TRANSFER_STATUS_COLORS[t.transferStatus],
                                    )}
                                >
                                    {TRANSFER_STATUS_LABELS[t.transferStatus]}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {t.transferInitiatedBy ?? "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {t.transferReceivedBy ?? "—"}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
