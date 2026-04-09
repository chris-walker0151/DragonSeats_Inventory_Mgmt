/**
 * TypeScript types for the Activity Log / Audit Trail.
 */

export interface ActivityLogEntry {
    id: string;
    recordId: string;
    collectionName: string;
    userId: string | null;
    method: string;
    summary: string;
    fieldChanged: string | null;
    oldValue: string | null;
    newValue: string | null;
    createdAt: Date;
}

export interface ActivityLogListItem {
    id: string;
    recordId: string;
    collectionName: string;
    userId: string | null;
    method: string;
    summary: string;
    fieldChanged: string | null;
    oldValue: string | null;
    newValue: string | null;
    createdAt: Date;
}

/** Input for logging a single activity entry. */
export interface LogActivityInput {
    recordId: string;
    collectionName: string;
    userId?: string;
    method?: string;
    summary: string;
    fieldChanged?: string;
    oldValue?: string;
    newValue?: string;
}

/** A single field change detected by diffFields(). */
export interface FieldChange {
    fieldName: string;
    oldValue: string | null;
    newValue: string | null;
}
