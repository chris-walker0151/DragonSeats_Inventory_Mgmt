"use client";

import * as XLSX from "xlsx";
import type { ImportColumnMapping } from "./types";
import {
    VALID_PRODUCT_CATEGORIES,
    VALID_LIFECYCLE_STATUSES,
    VALID_WAREHOUSE_LOCATIONS,
    VALID_LEAGUE_TYPES,
    VALID_CONTRACT_TYPES,
    VALID_CUSTOMER_STATUSES,
    VALID_BRANDING_STATUSES,
} from "./validators";

/** Map targetField → hint string for the hints row. */
const FIELD_HINTS: Record<string, string> = {
    serialNumber: "REQUIRED. Unique identifier",
    productCategory: `REQUIRED. ${[...VALID_PRODUCT_CATEGORIES].join(" | ")}`,
    lifecycleStatus: `${[...VALID_LIFECYCLE_STATUSES].join(" | ")}`,
    currentLocation: `REQUIRED. ${[...VALID_WAREHOUSE_LOCATIONS].join(" | ")}`,
    customerName: "Customer team name (must match existing customer)",
    yearManufactured: "Number, e.g. 2023",
    skuCode: "SKU code (must match existing SKU)",
    brandingStatus: `${[...VALID_BRANDING_STATUSES].join(" | ")}`,
    btuRating: "Number",
    amps: "Number",
    lastRefurbishedDate: "Date, e.g. 2024-06-15",
    teamName: "REQUIRED. Unique team name",
    league: `REQUIRED. ${[...VALID_LEAGUE_TYPES].join(" | ")}`,
    organizationLegalName: "REQUIRED. Legal entity name",
    contractType: `REQUIRED. ${[...VALID_CONTRACT_TYPES].join(" | ")}`,
    activeStatus: `${[...VALID_CUSTOMER_STATUSES].join(" | ")}`,
    itemCategory: "REQUIRED. e.g. Fasteners, Tubing",
    location: `REQUIRED. ${[...VALID_WAREHOUSE_LOCATIONS].join(" | ")}`,
    quantityOnHand: "REQUIRED. Number",
    reorderLevel: "Number",
};

/**
 * Generate and download an Excel template for the given import columns.
 */
export function downloadImportTemplate(
    columns: ImportColumnMapping[],
    fileName: string,
) {
    const headers = columns.map((c) => c.sourceColumn);
    const hints = columns.map((c) => {
        const hint = FIELD_HINTS[c.targetField];
        if (hint) return hint;
        return c.required ? "REQUIRED" : "Optional";
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, hints]);

    // Set column widths based on content
    ws["!cols"] = columns.map((c) => {
        const hintLen = FIELD_HINTS[c.targetField]?.length ?? 10;
        return { wch: Math.max(c.sourceColumn.length + 2, Math.min(hintLen + 2, 40)) };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, fileName);
}
