"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    exportToExcel,
    exportToCsv,
    type ExportColumn,
} from "@/lib/export/excel-csv";

interface ExportMenuProps<T extends Record<string, unknown>> {
    /** All filtered data (not just the current page). */
    data: T[];
    /** Column definitions mapping data keys to human-readable labels. */
    columns: ExportColumn[];
    /** Filename prefix (without extension). */
    filenamePrefix: string;
}

/**
 * Dropdown menu with Excel and CSV export options.
 * Uses the full filtered dataset, not just the current page.
 */
export function ExportMenu<T extends Record<string, unknown>>({
    data,
    columns,
    filenamePrefix,
}: ExportMenuProps<T>) {
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${filenamePrefix}-${timestamp}`;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => exportToExcel(data, columns, filename)}
                >
                    Export as Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => exportToCsv(data, columns, filename)}
                >
                    Export as CSV (.csv)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
