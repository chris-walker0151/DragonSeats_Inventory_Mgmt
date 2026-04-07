"use server";

import { fetchActivityForRecord } from "@/lib/activity-log/queries";
import type { ActivityLogEntry } from "@/lib/activity-log/types";

/**
 * Fetch activity log entries for any record.
 * Shared across all detail sheets.
 */
export async function fetchActivityForRecordAction(
    recordId: string,
    collectionName: string,
): Promise<ActivityLogEntry[]> {
    return fetchActivityForRecord(recordId, collectionName);
}
