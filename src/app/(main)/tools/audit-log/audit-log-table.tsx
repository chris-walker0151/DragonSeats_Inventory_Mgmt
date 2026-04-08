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
import { EmptyState } from "@/components/shared";
import { ScrollText } from "lucide-react";
import type { ActivityLogListItem } from "@/lib/activity-log/types";

const COLLECTION_LABELS: Record<string, string> = {
    "serialized-assets": "Serialized Assets",
    customers: "Customers",
    "service-tickets": "Service Tickets",
    "quantity-inventory": "Bulk Inventory",
};

const METHOD_COLORS: Record<string, string> = {
    "Manual / Web": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Import: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "Automation / Web": "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

interface AuditLogTableProps {
    entries: ActivityLogListItem[];
}

export function AuditLogTable({ entries }: AuditLogTableProps) {
    if (entries.length === 0) {
        return (
            <EmptyState
                icon={ScrollText}
                title="No activity found"
                description="No changes match the current filters."
            />
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[160px]">Date & Time</TableHead>
                        <TableHead className="w-[120px]">Collection</TableHead>
                        <TableHead className="w-[100px]">Method</TableHead>
                        <TableHead>Summary</TableHead>
                        <TableHead className="w-[120px]">Field</TableHead>
                        <TableHead className="w-[140px]">Change</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                {formatDate(entry.createdAt)}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className="text-[10px] font-normal"
                                >
                                    {COLLECTION_LABELS[entry.collectionName] ??
                                        entry.collectionName}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] font-normal ${METHOD_COLORS[entry.method] ?? ""}`}
                                >
                                    {entry.method}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                                {entry.summary}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                                {entry.fieldChanged ?? "—"}
                            </TableCell>
                            <TableCell className="text-xs">
                                {entry.oldValue != null ||
                                entry.newValue != null ? (
                                    <span className="flex items-center gap-1.5">
                                        {entry.oldValue && (
                                            <span className="line-through text-muted-foreground">
                                                {truncate(entry.oldValue)}
                                            </span>
                                        )}
                                        {entry.oldValue && entry.newValue && (
                                            <span className="text-muted-foreground">
                                                &rarr;
                                            </span>
                                        )}
                                        {entry.newValue && (
                                            <span>{truncate(entry.newValue)}</span>
                                        )}
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground">
                                        —
                                    </span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function truncate(val: string, max = 24): string {
    return val.length > max ? val.slice(0, max) + "…" : val;
}
