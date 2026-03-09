/**
 * Audit trail utility for recording entity changes.
 * All mutations (create, update, delete, deploy, return, batch_update)
 * should call logChange() to record an audit entry.
 */

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type {
    LogChangeParams,
    FetchAuditLogsParams,
    FetchAuditLogsResult,
} from "./types";

/**
 * Compute a diff between old and new data objects.
 * Returns only fields that actually changed.
 */
function computeDiff(
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
): Record<string, { old: unknown; new: unknown }> | null {
    const diff: Record<string, { old: unknown; new: unknown }> = {};

    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const key of allKeys) {
        const oldVal = oldData[key] ?? null;
        const newVal = newData[key] ?? null;

        // Normalize dates to ISO strings for comparison
        const oldNorm = oldVal instanceof Date ? oldVal.toISOString() : oldVal;
        const newNorm = newVal instanceof Date ? newVal.toISOString() : newVal;

        if (JSON.stringify(oldNorm) !== JSON.stringify(newNorm)) {
            diff[key] = { old: oldNorm, new: newNorm };
        }
    }

    return Object.keys(diff).length > 0 ? diff : null;
}

/**
 * Generate a human-readable summary from a diff.
 */
function generateSummary(
    action: string,
    changeData: Record<string, { old: unknown; new: unknown }> | null,
): string {
    if (action === "create") return "Created";
    if (action === "delete") return "Deleted";
    if (action === "deploy") return "Deployed to customer";
    if (action === "return") return "Returned to warehouse";
    if (action === "batch_update") return "Updated via batch action";

    if (!changeData) return "Updated";

    const fields = Object.keys(changeData);
    if (fields.length === 0) return "Updated";

    // Build readable field change descriptions (max 3)
    const descriptions = fields.slice(0, 3).map((field) => {
        const { old: oldVal, new: newVal } = changeData[field];
        const label = field
            .replace(/([A-Z])/g, " $1")
            .replace(/_/g, " ")
            .toLowerCase()
            .trim();
        const oldStr = oldVal == null ? "empty" : String(oldVal);
        const newStr = newVal == null ? "empty" : String(newVal);
        return `${label} from ${oldStr} to ${newStr}`;
    });

    const prefix = "Updated ";
    const suffix = fields.length > 3 ? ` and ${fields.length - 3} more` : "";
    return prefix + descriptions.join(", ") + suffix;
}

/**
 * Record an audit log entry for an entity change.
 */
export async function logChange(params: LogChangeParams): Promise<void> {
    const { entityType, entityId, action, changedBy, oldData, newData, summary } = params;

    let changeData: Record<string, { old: unknown; new: unknown }> | null = null;

    if (action === "create" && newData) {
        // For creates, store all new fields
        changeData = {};
        for (const [key, value] of Object.entries(newData)) {
            if (value !== undefined) {
                const normalized = value instanceof Date ? value.toISOString() : value;
                changeData[key] = { old: null, new: normalized };
            }
        }
        if (Object.keys(changeData).length === 0) changeData = null;
    } else if (action === "delete" && oldData) {
        // For deletes, store all old fields
        changeData = {};
        for (const [key, value] of Object.entries(oldData)) {
            if (value !== undefined) {
                const normalized = value instanceof Date ? value.toISOString() : value;
                changeData[key] = { old: normalized, new: null };
            }
        }
        if (Object.keys(changeData).length === 0) changeData = null;
    } else if (oldData && newData) {
        // For updates, compute diff
        changeData = computeDiff(oldData, newData);
    }

    const resolvedSummary = summary ?? generateSummary(action, changeData);

    await prisma.auditLog.create({
        data: {
            entityType,
            entityId,
            action,
            changedBy: changedBy ?? null,
            changeData: changeData
                ? (changeData as unknown as Prisma.InputJsonValue)
                : Prisma.JsonNull,
            summary: resolvedSummary,
        },
    });
}

/**
 * Batch-create audit log entries (for imports and bulk operations).
 */
export async function logChangeBatch(
    entries: LogChangeParams[],
): Promise<void> {
    if (entries.length === 0) return;

    const data = entries.map((params) => {
        const { entityType, entityId, action, changedBy, oldData, newData, summary } = params;

        let changeData: Record<string, { old: unknown; new: unknown }> | null = null;

        if (action === "create" && newData) {
            changeData = {};
            for (const [key, value] of Object.entries(newData)) {
                if (value !== undefined) {
                    const normalized = value instanceof Date ? value.toISOString() : value;
                    changeData[key] = { old: null, new: normalized };
                }
            }
            if (Object.keys(changeData).length === 0) changeData = null;
        } else if (action === "delete" && oldData) {
            changeData = {};
            for (const [key, value] of Object.entries(oldData)) {
                if (value !== undefined) {
                    const normalized = value instanceof Date ? value.toISOString() : value;
                    changeData[key] = { old: normalized, new: null };
                }
            }
            if (Object.keys(changeData).length === 0) changeData = null;
        } else if (oldData && newData) {
            changeData = computeDiff(oldData, newData);
        }

        const resolvedSummary = summary ?? generateSummary(action, changeData);

        return {
            entityType,
            entityId,
            action,
            changedBy: changedBy ?? null,
            changeData: changeData
                ? (changeData as unknown as Prisma.InputJsonValue)
                : Prisma.JsonNull,
            summary: resolvedSummary,
        };
    });

    await prisma.auditLog.createMany({ data });
}

/**
 * Fetch audit log entries with optional filters and pagination.
 */
export async function fetchAuditLogs(
    params: FetchAuditLogsParams,
): Promise<FetchAuditLogsResult> {
    const { entityType, entityId, limit = 50, offset = 0 } = params;

    const where: Record<string, unknown> = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
        }),
        prisma.auditLog.count({ where }),
    ]);

    return {
        logs: logs.map((log) => ({
            id: log.id,
            entityType: log.entityType,
            entityId: log.entityId,
            action: log.action,
            changedBy: log.changedBy,
            changeData: log.changeData as Record<string, { old: unknown; new: unknown }> | null,
            summary: log.summary,
            createdAt: log.createdAt,
        })),
        total,
    };
}
