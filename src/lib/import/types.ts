export type ImportTargetTable = "serialized_assets" | "quantity_inventory" | "customers";

export interface ImportColumnMapping {
    sourceColumn: string;
    targetField: string;
    required: boolean;
}

export interface ImportValidationError {
    row: number;
    column: string;
    message: string;
}

export interface ImportPreviewRow {
    rowNumber: number;
    data: Record<string, unknown>;
    errors: ImportValidationError[];
}

export interface ImportResult {
    created: number;
    updated: number;
    skipped: number;
    errors: ImportValidationError[];
}
