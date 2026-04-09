/**
 * TypeScript types for the Saved Views feature.
 */

export interface SavedViewRecord {
    id: string;
    collectionSlug: string;
    name: string;
    filters: string | null;
    sortBy: string | null;
    groupBy: string | null;
    visibleColumns: string | null;
    isDefault: boolean;
    createdBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface SavedViewCreateInput {
    collectionSlug: string;
    name: string;
    filters?: Record<string, string>;
    sortBy?: { fieldName: string; direction: "asc" | "desc" }[];
    groupBy?: string;
    visibleColumns?: string[];
    createdBy?: string;
}

/** Parsed filter/sort state ready for use by the UI hooks. */
export interface ParsedSavedView {
    id: string;
    name: string;
    isDefault: boolean;
    filters: Record<string, string>;
    sortBy: { fieldName: string; direction: "asc" | "desc" }[];
    groupBy: string | null;
    visibleColumns: string[];
}
