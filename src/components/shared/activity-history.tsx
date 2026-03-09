"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, History } from "lucide-react";
import { fetchEntityAuditLogs } from "@/lib/audit/actions";
import type { AuditLogEntry } from "@/lib/audit/types";

interface ActivityHistoryProps {
    entityType: string;
    entityId: string;
}

const ACTION_BADGE_COLORS: Record<string, string> = {
    create: "bg-green-900 text-green-200",
    update: "bg-blue-900 text-blue-200",
    delete: "bg-red-900 text-red-200",
    deploy: "bg-purple-900 text-purple-200",
    return: "bg-amber-900 text-amber-200",
    batch_update: "bg-indigo-900 text-indigo-200",
};

const ACTION_LABELS: Record<string, string> = {
    create: "Created",
    update: "Updated",
    delete: "Deleted",
    deploy: "Deployed",
    return: "Returned",
    batch_update: "Batch Update",
};

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

function formatFieldName(field: string): string {
    return field
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase())
        .trim();
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return "empty";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "string" && value.length > 60) return value.slice(0, 60) + "...";
    return String(value);
}

function DiffEntry({ field, oldVal, newVal }: { field: string; oldVal: unknown; newVal: unknown }) {
    return (
        <div className="flex items-start gap-2 text-xs py-0.5">
            <span className="text-muted-foreground min-w-[100px] shrink-0">
                {formatFieldName(field)}
            </span>
            <span className="text-red-400 line-through">{formatValue(oldVal)}</span>
            <span className="text-muted-foreground">&rarr;</span>
            <span className="text-green-400">{formatValue(newVal)}</span>
        </div>
    );
}

function AuditLogItem({ log }: { log: AuditLogEntry }) {
    const [expanded, setExpanded] = useState(false);
    const hasDiff = log.changeData && Object.keys(log.changeData).length > 0;

    return (
        <div className="py-2.5">
            <div className="flex items-start gap-2">
                <Badge
                    className={`text-[9px] shrink-0 ${ACTION_BADGE_COLORS[log.action] ?? "bg-gray-800 text-gray-300"}`}
                >
                    {ACTION_LABELS[log.action] ?? log.action}
                </Badge>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-tight">
                        {log.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(log.createdAt)}
                        </span>
                        {log.changedBy && (
                            <span className="text-[10px] text-muted-foreground">
                                by {log.changedBy}
                            </span>
                        )}
                    </div>
                </div>
                {hasDiff && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? (
                            <ChevronDown className="h-3 w-3" />
                        ) : (
                            <ChevronRight className="h-3 w-3" />
                        )}
                    </Button>
                )}
            </div>

            {expanded && hasDiff && (
                <div className="mt-2 ml-1 pl-3 border-l-2 border-muted space-y-0.5">
                    {Object.entries(log.changeData!).map(([field, { old: oldVal, new: newVal }]) => (
                        <DiffEntry key={field} field={field} oldVal={oldVal} newVal={newVal} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function ActivityHistory({ entityType, entityId }: ActivityHistoryProps) {
    const [open, setOpen] = useState(false);
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [prevEntityKey, setPrevEntityKey] = useState(`${entityType}:${entityId}`);

    const ITEMS_PER_LOAD = 10;

    // Reset when entity changes — "adjusting state during render" pattern
    const entityKey = `${entityType}:${entityId}`;
    if (entityKey !== prevEntityKey) {
        setPrevEntityKey(entityKey);
        setLogs([]);
        setTotal(0);
        setLoaded(false);
        setOpen(false);
    }

    function handleToggle(isOpen: boolean) {
        setOpen(isOpen);
        if (isOpen && !loaded) {
            loadLogs(0);
        }
    }

    function loadLogs(offset: number) {
        startTransition(async () => {
            const result = await fetchEntityAuditLogs({
                entityType,
                entityId,
                limit: ITEMS_PER_LOAD,
                offset,
            });
            if (offset === 0) {
                setLogs(result.logs);
            } else {
                setLogs((prev) => [...prev, ...result.logs]);
            }
            setTotal(result.total);
            setLoaded(true);
        });
    }

    function handleLoadMore() {
        loadLogs(logs.length);
    }

    const hasMore = logs.length < total;

    return (
        <div>
            <Separator />
            <Collapsible open={open} onOpenChange={handleToggle}>
                <CollapsibleTrigger asChild>
                    <button className="flex items-center gap-2 mt-4 mb-2 w-full text-left">
                        <History className="h-3.5 w-3.5 text-muted-foreground" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Activity History
                        </h3>
                        {total > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                                ({total})
                            </span>
                        )}
                        <span className="ml-auto">
                            {open ? (
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                        </span>
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    {isPending && logs.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2">Loading...</p>
                    ) : logs.length === 0 ? (
                        <p className="text-xs text-muted-foreground/60 py-2">
                            No activity recorded yet.
                        </p>
                    ) : (
                        <div className="divide-y divide-border">
                            {logs.map((log) => (
                                <AuditLogItem key={log.id} log={log} />
                            ))}
                        </div>
                    )}
                    {hasMore && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs mt-1"
                            onClick={handleLoadMore}
                            disabled={isPending}
                        >
                            {isPending ? "Loading..." : `Load more (${total - logs.length} remaining)`}
                        </Button>
                    )}
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
