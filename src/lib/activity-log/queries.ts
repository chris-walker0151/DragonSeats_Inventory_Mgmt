/**
 * Activity log / audit trail query functions.
 *
 * All create/update/delete server actions should call logActivity() or
 * logBulkActivity() to record an audit entry. The diffFields() helper
 * compares before/after snapshots to produce per-field change entries.
 */

import { prisma } from "@/lib/db";
import type {
    LogActivityInput,
    ActivityLogListItem,
    FieldChange,
} from "./types";

// ─── Write helpers ──────────────────────────────────────────────────────────

/** Log a single activity entry. */
export async function logActivity(input: LogActivityInput) {
    await prisma.activityLog.create({
        data: {
            recordId: input.recordId,
            collectionName: input.collectionName,
            userId: input.userId ?? null,
            method: input.method ?? "Manual / Web",
            summary: input.summary,
            fieldChanged: input.fieldChanged ?? null,
            oldValue: input.oldValue ?? null,
            newValue: input.newValue ?? null,
        },
    });
}

/** Log multiple activity entries in a single database call. */
export async function logBulkActivity(entries: LogActivityInput[]) {
    if (entries.length === 0) return;
    await prisma.activityLog.createMany({
        data: entries.map((e) => ({
            recordId: e.recordId,
            collectionName: e.collectionName,
            userId: e.userId ?? null,
            method: e.method ?? "Manual / Web",
            summary: e.summary,
            fieldChanged: e.fieldChanged ?? null,
            oldValue: e.oldValue ?? null,
            newValue: e.newValue ?? null,
        })),
    });
}

// ─── Diff helper ────────────────────────────────────────────────────────────

/**
 * Compare two objects and return a list of field changes.
 *
 * Only keys present in `after` are compared. Values are coerced to strings
 * for comparison. Null/undefined are treated as equivalent.
 *
 * @param before  - The record state before the update
 * @param after   - The new values being applied (partial)
 * @param labels  - Optional map of field names → human-readable labels
 */
export function diffFields(
    before: Record<string, unknown>,
    after: Record<string, unknown>,
    labels?: Record<string, string>,
): FieldChange[] {
    const changes: FieldChange[] = [];

    for (const key of Object.keys(after)) {
        const oldVal = before[key];
        const newVal = after[key];

        // Normalise to string for comparison
        const oldStr = normalise(oldVal);
        const newStr = normalise(newVal);

        if (oldStr !== newStr) {
            changes.push({
                fieldName: labels?.[key] ?? key,
                oldValue: oldStr,
                newValue: newStr,
            });
        }
    }

    return changes;
}

function normalise(val: unknown): string | null {
    if (val == null) return null;
    if (val instanceof Date) return val.toISOString();
    return String(val);
}

// ─── Read queries ───────────────────────────────────────────────────────────

/** Fetch activity log entries for a specific record, newest first. */
export async function fetchActivityForRecord(
    recordId: string,
    collectionName: string,
    limit = 100,
): Promise<ActivityLogListItem[]> {
    const rows = await prisma.activityLog.findMany({
        where: { recordId, collectionName },
        orderBy: { createdAt: "desc" },
        take: limit,
    });
    return rows;
}

/** Fetch recent activity across all collections, newest first. */
export async function fetchRecentActivity(
    options: {
        limit?: number;
        offset?: number;
        collectionName?: string;
    } = {},
): Promise<{ entries: ActivityLogListItem[]; total: number }> {
    const { limit = 100, offset = 0, collectionName } = options;

    const where = collectionName ? { collectionName } : {};

    const [entries, total] = await Promise.all([
        prisma.activityLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
        }),
        prisma.activityLog.count({ where }),
    ]);

    return { entries, total };
}
