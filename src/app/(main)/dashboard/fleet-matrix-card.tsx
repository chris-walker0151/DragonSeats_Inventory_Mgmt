"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    PRODUCT_CATEGORY_LABELS,
    LIFECYCLE_STATUS_LABELS,
    LIFECYCLE_STATUS_COLORS,
    ALL_PRODUCT_CATEGORIES,
    ALL_LIFECYCLE_STATUSES,
} from "@/lib/serialized-assets/constants";
import type { ProductCategory, LifecycleStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

interface FleetMatrixRow {
    productCategory: ProductCategory;
    lifecycleStatus: LifecycleStatus;
    count: number;
}

export function FleetMatrixCard({
    data,
    className,
}: {
    data: FleetMatrixRow[];
    className?: string;
}) {
    // Build a lookup map: category -> status -> count
    const matrix = new Map<string, Map<string, number>>();
    for (const row of data) {
        if (!matrix.has(row.productCategory)) {
            matrix.set(row.productCategory, new Map());
        }
        matrix.get(row.productCategory)!.set(row.lifecycleStatus, row.count);
    }

    // Calculate totals per category and grand total
    const categoryTotals = new Map<string, number>();
    let grandTotal = 0;
    for (const cat of ALL_PRODUCT_CATEGORIES) {
        let total = 0;
        for (const status of ALL_LIFECYCLE_STATUSES) {
            total += matrix.get(cat)?.get(status) ?? 0;
        }
        categoryTotals.set(cat, total);
        grandTotal += total;
    }

    // Calculate totals per status
    const statusTotals = new Map<string, number>();
    for (const status of ALL_LIFECYCLE_STATUSES) {
        let total = 0;
        for (const cat of ALL_PRODUCT_CATEGORIES) {
            total += matrix.get(cat)?.get(status) ?? 0;
        }
        statusTotals.set(status, total);
    }

    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">Fleet by Category & Status</CardTitle>
                </div>
                <CardDescription>
                    {grandTotal} total assets across all categories
                </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[140px]">Category</TableHead>
                            {ALL_LIFECYCLE_STATUSES.map((status) => (
                                <TableHead key={status} className="text-center">
                                    <Badge
                                        className={cn(
                                            "text-[10px] px-1.5",
                                            LIFECYCLE_STATUS_COLORS[status],
                                        )}
                                    >
                                        {LIFECYCLE_STATUS_LABELS[status]}
                                    </Badge>
                                </TableHead>
                            ))}
                            <TableHead className="text-center font-bold">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ALL_PRODUCT_CATEGORIES.map((cat) => (
                            <TableRow key={cat}>
                                <TableCell className="font-medium">
                                    {PRODUCT_CATEGORY_LABELS[cat]}
                                </TableCell>
                                {ALL_LIFECYCLE_STATUSES.map((status) => {
                                    const count = matrix.get(cat)?.get(status) ?? 0;
                                    return (
                                        <TableCell key={status} className="text-center tabular-nums">
                                            {count > 0 ? (
                                                <span className="text-foreground">{count}</span>
                                            ) : (
                                                <span className="text-muted-foreground/40">—</span>
                                            )}
                                        </TableCell>
                                    );
                                })}
                                <TableCell className="text-center font-bold tabular-nums">
                                    {categoryTotals.get(cat) ?? 0}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="border-t-2 font-bold hover:bg-transparent">
                            <TableCell>Total</TableCell>
                            {ALL_LIFECYCLE_STATUSES.map((status) => (
                                <TableCell key={status} className="text-center tabular-nums">
                                    {statusTotals.get(status) ?? 0}
                                </TableCell>
                            ))}
                            <TableCell className="text-center tabular-nums">{grandTotal}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
