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
    LEAGUE_LABELS,
    LEAGUE_COLORS,
    CUSTOMER_STATUS_LABELS,
    CUSTOMER_STATUS_COLORS,
    CONTRACT_TYPE_LABELS,
} from "@/lib/customers/constants";
import type { CustomerListItem } from "@/lib/customers/types";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

interface CustomerTableProps {
    customers: CustomerListItem[];
    onSelect: (id: string) => void;
}

export function CustomerTable({ customers, onSelect }: CustomerTableProps) {
    if (customers.length === 0) {
        return (
            <div className="rounded-md border p-12 text-center">
                <p className="text-muted-foreground">No customers match your filters.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead>Team</TableHead>
                    <TableHead>League</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Stadium</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Deployed</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {customers.map((customer) => (
                    <TableRow
                        key={customer.id}
                        className="cursor-pointer"
                        tabIndex={0}
                        role="button"
                        aria-label={`View details for ${customer.teamName}`}
                        onClick={() => onSelect(customer.id)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onSelect(customer.id);
                            }
                        }}
                    >
                        <TableCell className="font-medium">{customer.teamName}</TableCell>
                        <TableCell>
                            <Badge
                                className={cn(
                                    "text-[10px]",
                                    LEAGUE_COLORS[customer.league],
                                )}
                            >
                                {LEAGUE_LABELS[customer.league]}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge
                                className={cn(
                                    "text-[10px]",
                                    CUSTOMER_STATUS_COLORS[customer.activeStatus],
                                )}
                            >
                                {CUSTOMER_STATUS_LABELS[customer.activeStatus]}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {CONTRACT_TYPE_LABELS[customer.contractType]}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {customer.stadiumName ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {customer.primaryContactName ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                            {customer.deployedAssetCount > 0 ? (
                                <span className="inline-flex items-center gap-1 text-sm font-medium tabular-nums">
                                    <Package className="h-3 w-3 text-muted-foreground" />
                                    {customer.deployedAssetCount}
                                </span>
                            ) : (
                                <span className="text-muted-foreground/40">0</span>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
