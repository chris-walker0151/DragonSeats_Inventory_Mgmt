"use server";

import { fetchAuditLogs } from "./log";
import type { FetchAuditLogsResult } from "./types";

/**
 * Server action to fetch audit logs for a specific entity.
 * Used by the ActivityHistory component in detail sheets.
 */
export async function fetchEntityAuditLogs(params: {
    entityType: string;
    entityId: string;
    limit?: number;
    offset?: number;
}): Promise<FetchAuditLogsResult> {
    return fetchAuditLogs(params);
}

/**
 * Server action to fetch audit logs for the global activity log page.
 */
export async function fetchGlobalAuditLogs(params: {
    entityType?: string;
    limit?: number;
    offset?: number;
}): Promise<FetchAuditLogsResult> {
    return fetchAuditLogs(params);
}
