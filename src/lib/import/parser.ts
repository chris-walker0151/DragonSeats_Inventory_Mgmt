"use client";

import * as XLSX from "xlsx";
import type { ImportColumnMapping, ImportPreviewRow, ImportValidationError } from "./types";
import {
    validateProductCategory,
    validateLifecycleStatus,
    validateWarehouseLocation,
    validateLeagueType,
    validateContractType,
    validateCustomerStatus,
    validateBrandingStatus,
} from "./validators";

/**
 * Parse an uploaded Excel or CSV file into raw row objects.
 * Returns the sheet's data as an array of key-value objects (keys = column headers).
 */
export function parseSpreadsheet(file: File): Promise<Record<string, unknown>[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
                    defval: "",
                });
                resolve(rows);
            } catch (err) {
                reject(new Error(`Failed to parse file: ${err instanceof Error ? err.message : "unknown error"}`));
            }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsArrayBuffer(file);
    });
}

// Map of targetField to validator function for enum fields
const ENUM_VALIDATORS: Record<string, (value: unknown) => string | null> = {
    productCategory: validateProductCategory,
    lifecycleStatus: validateLifecycleStatus,
    currentLocation: validateWarehouseLocation,
    location: validateWarehouseLocation,
    league: validateLeagueType,
    contractType: validateContractType,
    activeStatus: validateCustomerStatus,
    brandingStatus: validateBrandingStatus,
};

/**
 * Map raw spreadsheet rows to the target field names using column mappings,
 * and validate required fields and enum values.
 */
export function validateAndMapRows(
    rawRows: Record<string, unknown>[],
    columns: ImportColumnMapping[],
): ImportPreviewRow[] {
    return rawRows.map((raw, index) => {
        const data: Record<string, unknown> = {};
        const errors: ImportValidationError[] = [];

        for (const col of columns) {
            const rawValue = raw[col.sourceColumn];
            const value = rawValue === undefined || rawValue === "" ? null : rawValue;
            data[col.targetField] = value;

            // Required field check
            if (col.required && (value === null || value === undefined)) {
                errors.push({
                    row: index + 1,
                    column: col.sourceColumn,
                    message: `"${col.sourceColumn}" is required`,
                });
            }

            // Enum validation
            if (value !== null && value !== undefined && ENUM_VALIDATORS[col.targetField]) {
                const err = ENUM_VALIDATORS[col.targetField](value);
                if (err) {
                    errors.push({
                        row: index + 1,
                        column: col.sourceColumn,
                        message: err,
                    });
                }
            }

            // Number validation for numeric fields
            if (value !== null && value !== undefined) {
                if (
                    col.targetField === "yearManufactured" ||
                    col.targetField === "btuRating" ||
                    col.targetField === "amps" ||
                    col.targetField === "quantityOnHand" ||
                    col.targetField === "reorderLevel"
                ) {
                    const num = Number(value);
                    if (isNaN(num)) {
                        errors.push({
                            row: index + 1,
                            column: col.sourceColumn,
                            message: `"${col.sourceColumn}" must be a number`,
                        });
                    }
                }
            }
        }

        return { rowNumber: index + 1, data, errors };
    });
}

/**
 * Count how many rows have validation errors.
 */
export function countErrors(rows: ImportPreviewRow[]): { valid: number; invalid: number } {
    const invalid = rows.filter((r) => r.errors.length > 0).length;
    return { valid: rows.length - invalid, invalid };
}
