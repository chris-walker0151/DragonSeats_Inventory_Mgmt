"use client";

import { useEffect, useState, useTransition } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityLogEntry } from "@/lib/activity-log/types";

interface ActivityTabProps {
    recordId: string;
    collectionName: string;
    fetchAction: (
        recordId: string,
        collectionName: string,
    ) => Promise<ActivityLogEntry[]>;
}

/**
 * Reusable activity log panel for record detail sheets.
 * Shows a chronological list of changes for a specific record.
 */
export function ActivityTab({
    recordId,
    collectionName,
    fetchAction,
}: ActivityTabProps) {
    const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
    const [isPending, startTransition] = useTransition();
    const [loaded, setLoaded] = useState(false);

    // Track prop changes and reload (state-tracking pattern)
    const [prevRecordId, setPrevRecordId] = useState(recordId);
    if (prevRecordId !== recordId) {
        setPrevRecordId(recordId);
        setLoaded(false);
        setEntries([]);
    }

    useEffect(() => {
        if (loaded || !recordId) return;
        startTransition(async () => {
            const data = await fetchAction(recordId, collectionName);
            setEntries(data);
            setLoaded(true);
        });
    }, [recordId, collectionName, fetchAction, loaded]);

    if (isPending && !loaded) {
        return (
            <div className="space-y-3 py-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="py-6 text-center text-sm text-muted-foreground">
                No activity recorded yet.
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {entries.map((entry, i) => (
                <div key={entry.id}>
                    {i > 0 && <Separator className="my-1" />}
                    <div className="py-2 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">
                                {formatDate(entry.createdAt)}
                            </span>
                            <Badge
                                variant="outline"
                                className="text-[10px] font-normal"
                            >
                                {entry.method}
                            </Badge>
                        </div>
                        <p className="text-sm">{entry.summary}</p>
                        {entry.fieldChanged && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-medium">
                                    {entry.fieldChanged}
                                </span>
                                {entry.oldValue != null && (
                                    <>
                                        <span className="line-through">
                                            {truncate(entry.oldValue)}
                                        </span>
                                        <span>&rarr;</span>
                                    </>
                                )}
                                {entry.newValue != null && (
                                    <span className="text-foreground">
                                        {truncate(entry.newValue)}
                                    </span>
                                )}
                            </div>
                        )}
                        {entry.userId && (
                            <p className="text-[10px] text-muted-foreground/60">
                                {entry.userId}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function truncate(val: string, max = 40): string {
    return val.length > max ? val.slice(0, max) + "…" : val;
}
