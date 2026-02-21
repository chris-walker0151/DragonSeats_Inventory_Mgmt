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
import type { DeploymentListItem } from "@/lib/deployments/types";
import { cn } from "@/lib/utils";

interface DeploymentTableProps {
    deployments: DeploymentListItem[];
}

export function DeploymentTable({ deployments }: DeploymentTableProps) {
    if (deployments.length === 0) {
        return (
            <div className="rounded-md border p-12 text-center">
                <p className="text-muted-foreground">No deployments match your filters.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead>Asset</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Deployed</TableHead>
                    <TableHead>Expected Return</TableHead>
                    <TableHead>Actual Return</TableHead>
                    <TableHead>Notes</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {deployments.map((d) => {
                    const isActive = d.actualReturnDate === null;
                    const isOverdue =
                        isActive &&
                        d.expectedReturnDate !== null &&
                        new Date(d.expectedReturnDate) < new Date();

                    return (
                        <TableRow key={d.id}>
                            <TableCell className="font-mono text-xs font-medium">
                                {d.assetSerialNumber}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    className={cn(
                                        "text-[10px]",
                                        PRODUCT_CATEGORY_COLORS[d.assetProductCategory],
                                    )}
                                >
                                    {PRODUCT_CATEGORY_LABELS[d.assetProductCategory]}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{d.customerName}</TableCell>
                            <TableCell className="text-sm tabular-nums text-muted-foreground">
                                {new Date(d.deploymentDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-sm tabular-nums">
                                {d.expectedReturnDate ? (
                                    <span className={cn(isOverdue && "text-amber-400 font-medium")}>
                                        {new Date(d.expectedReturnDate).toLocaleDateString()}
                                        {isOverdue && " ⚠"}
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground/40">—</span>
                                )}
                            </TableCell>
                            <TableCell className="text-sm tabular-nums">
                                {d.actualReturnDate ? (
                                    <Badge variant="active" className="text-[10px]">
                                        {new Date(d.actualReturnDate).toLocaleDateString()}
                                    </Badge>
                                ) : (
                                    <Badge variant="info" className="text-[10px]">
                                        Active
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                                {d.deploymentNotes ?? "—"}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
