/**
 * Client-side Excel and CSV export using the xlsx library.
 *
 * Uses the `filtered` array from usePaginatedFilter so exports
 * contain all items matching the current filters, not just the
 * visible page.
 */

import * as XLSX from "xlsx";

export interface ExportColumn {
    key: string;
    label: string;
}

/**
 * Export data as an Excel (.xlsx) file and trigger a browser download.
 */
export function exportToExcel<T extends Record<string, unknown>>(
    data: T[],
    columns: ExportColumn[],
    filename: string,
) {
    const rows = mapDataToRows(data, columns);
    const ws = XLSX.utils.json_to_sheet(rows);

    // Set column widths based on header length
    ws["!cols"] = columns.map((col) => ({
        wch: Math.max(col.label.length + 2, 14),
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Export");
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export data as a CSV file and trigger a browser download.
 */
export function exportToCsv<T extends Record<string, unknown>>(
    data: T[],
    columns: ExportColumn[],
    filename: string,
) {
    const rows = mapDataToRows(data, columns);
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Map raw data objects to export rows using the column definitions.
 * Applies column labels as headers and formats values.
 */
function mapDataToRows<T extends Record<string, unknown>>(
    data: T[],
    columns: ExportColumn[],
): Record<string, unknown>[] {
    return data.map((item) => {
        const row: Record<string, unknown> = {};
        for (const col of columns) {
            const val = item[col.key];
            row[col.label] = formatValue(val);
        }
        return row;
    });
}

function formatValue(val: unknown): string {
    if (val == null) return "";
    if (val instanceof Date) return val.toLocaleDateString();
    return String(val);
}
