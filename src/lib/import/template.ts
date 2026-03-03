"use client";

import * as XLSX from "xlsx";
import type { ImportColumnMapping } from "./types";
import {
    VALID_WAREHOUSE_LOCATIONS,
    VALID_LEAGUE_TYPES,
    VALID_CONTRACT_TYPES,
    VALID_CUSTOMER_STATUSES,
} from "./validators";

/** Map targetField → hint string for the hints row. */
const FIELD_HINTS: Record<string, string> = {
    // Serialized assets
    serialNumber: "REQUIRED. e.g. BEN-001",
    productTypeModel: "e.g. DS Bench, DS Mini Bench",
    manufacturer: "e.g. SND, CMM, ZRC, MFG",
    dsPlateNumber: "DS plate identifier",
    condition: "e.g. Excellent, New Build, Poor",
    benchStatus: "e.g. NEED INPUT, Checked Out, Ready",
    warehouseLocation: "REQUIRED. e.g. Cleveland, Kansas City, Jacksonville, or deployed location name",
    manifoldStyle: "e.g. Sandy New, Original, Short Manifold",
    deckType: "e.g. OG Deck, Redesign, Mini Bench",
    seatType: "e.g. Standard, New Design, Mini Bench",
    wheelType: "e.g. New Wheels, Original, Mini Bench",
    compressorHoles: "e.g. Yes, No",
    acHoles: "e.g. Yes, No",
    teamAllocated2024: "Team name for 2024 season",
    teamAllocated2025: "Team name for 2025 season",
    // Customers
    teamName: "REQUIRED. Unique team name",
    league: `REQUIRED. ${[...VALID_LEAGUE_TYPES].join(" | ")}`,
    organizationLegalName: "REQUIRED. Legal entity name",
    contractType: `REQUIRED. ${[...VALID_CONTRACT_TYPES].join(" | ")}`,
    activeStatus: `${[...VALID_CUSTOMER_STATUSES].join(" | ")}`,
    // Quantity inventory
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
