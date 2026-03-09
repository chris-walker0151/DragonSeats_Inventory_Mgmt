"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { fetchGlobalAuditLogs } from "@/lib/audit/actions";
import type { AuditLogEntry } from "@/lib/audit/types";

const ACTION_BADGE_COLORS: Record<string, string> = {
    create: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    update: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    delete: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    deploy: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    return: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    batch_update: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
};

const ENTITY_TYPES = [
    "SerializedAsset",
    "ServiceTicket",
    "Customer",
    "QuantityInventory",
    "Deployment",
    "Transfer",
];

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
}

interface ActivityLogShellProps {
    initialLogs: AuditLogEntry[];
    initialTotal: number;
}

export function ActivityLogShell({ initialLogs, initialTotal }: ActivityLogShellProps) {
    const [logs, setLogs] = useState(initialLogs);
    const [total, setTotal] = useState(initialTotal);
    const [entityFilter, setEntityFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [isPending, startTransition] = useTransition();

    function handleRefresh() {
        startTransition(async () => {
            const params: { entityType?: string; limit: number; offset: number } = {
                limit: 50,
                offset: 0,
            };
            if (entityFilter !== "all") params.entityType = entityFilter;
            const result = await fetchGlobalAuditLogs(params);
            setLogs(result.logs);
            setTotal(result.total);
        });
    }

    function handleEntityFilterChange(value: string) {
        setEntityFilter(value);
        startTransition(async () => {
            const params: { entityType?: string; limit: number; offset: number } = {
                limit: 50,
                offset: 0,
            };
            if (value !== "all") params.entityType = value;
            const result = await fetchGlobalAuditLogs(params);
            setLogs(result.logs);
            setTotal(result.total);
        });
    }

    function handleLoadMore() {
        startTransition(async () => {
            const params: { entityType?: string; limit: number; offset: number } = {
                limit: 50,
                offset: logs.length,
            };
            if (entityFilter !== "all") params.entityType = entityFilter;
            const result = await fetchGlobalAuditLogs(params);
            setLogs((prev) => [...prev, ...result.logs]);
            setTotal(result.total);
        });
    }

    // Client-side search filter
    const filtered = search.trim()
        ? logs.filter(
              (log) =>
                  log.entityId.toLowerCase().includes(search.toLowerCase()) ||
                  (log.summary ?? "").toLowerCase().includes(search.toLowerCase()) ||
                  (log.changedBy ?? "").toLowerCase().includes(search.toLowerCase()),
          )
        : logs;

    const hasMore = logs.length < total;

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by ID, summary, user..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select value={entityFilter} onValueChange={handleEntityFilterChange}>
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Entity Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {ENTITY_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                                {t}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isPending}
                >
                    <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
                    Refresh
                </Button>

                <p className="text-xs text-muted-foreground tabular-nums ml-auto">
                    {filtered.length} of {total} entries
                </p>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="rounded-md border p-12 text-center">
                    <p className="text-muted-foreground">No activity log entries found.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Time</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Summary</TableHead>
                            <TableHead>By</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                                    {formatRelativeTime(log.createdAt)}
                                </TableCell>
                                <TableCell>
                                    <div className="text-xs">
                                        <span className="text-muted-foreground">
                                            {log.entityType}
                                        </span>
                                        <br />
                                        <span className="font-mono text-[10px]">
                                            {log.entityId.slice(0, 8)}...
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        className={`text-[10px] ${ACTION_BADGE_COLORS[log.action] ?? "bg-gray-100 text-gray-800"}`}
                                    >
                                        {log.action}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm max-w-[300px] truncate">
                                    {log.summary ?? "—"}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {log.changedBy ?? "—"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Load More */}
            {hasMore && (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLoadMore}
                        disabled={isPending}
                    >
                        {isPending ? "Loading..." : `Load more (${total - logs.length} remaining)`}
                    </Button>
                </div>
            )}
        </div>
    );
}
