/**
 * TypeScript types for the audit trail system.
 */

export interface AuditLogEntry {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    changedBy: string | null;
    changeData: Record<string, { old: unknown; new: unknown }> | null;
    summary: string | null;
    createdAt: Date;
}

export interface LogChangeParams {
    entityType: string;
    entityId: string;
    action: string;
    changedBy?: string;
    oldData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
    summary?: string;
}

export interface FetchAuditLogsParams {
    entityType?: string;
    entityId?: string;
    limit?: number;
    offset?: number;
}

export interface FetchAuditLogsResult {
    logs: AuditLogEntry[];
    total: number;
}
