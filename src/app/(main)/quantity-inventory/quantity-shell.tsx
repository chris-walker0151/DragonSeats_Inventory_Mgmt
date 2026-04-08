"use client";

import { useMemo, useState } from "react";
import type { QuantityInventoryListItem, LocationFilter } from "@/lib/quantity-inventory/types";
import { useFilters, usePaginatedFilter } from "@/hooks";
import { QuantityFilters } from "./quantity-filters";
import { QuantityTable } from "./quantity-table";
import { QuantityDetailSheet } from "./quantity-detail-sheet";
import { Pagination } from "@/components/shared";
import { ImportDialog } from "@/components/shared/import-dialog";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { QUANTITY_INVENTORY_COLUMNS } from "@/lib/import/constants";
import { importQuantityInventoryAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Upload, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { ExportMenu } from "@/components/shared/export-menu";
import type { ExportColumn } from "@/lib/export/excel-csv";

const EXPORT_COLUMNS: ExportColumn[] = [
    { key: "itemCategory", label: "Category" },
    { key: "itemVariant", label: "Variant" },
    { key: "location", label: "Location" },
    { key: "quantityOnHand", label: "Qty on Hand" },
    { key: "reorderLevel", label: "Reorder Level" },
    { key: "lastCountDate", label: "Last Count Date" },
    { key: "responsiblePerson", label: "Responsible Person" },
];

type QuantityFilters_ = {
    location: string;
    category: string;
};

export function QuantityShell({ items }: { items: QuantityInventoryListItem[] }) {
    const router = useRouter();
    const { filters, setFilter, search, setSearch } = useFilters<QuantityFilters_>({
        location: "all",
        category: "all",
    });

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [sheetMode, setSheetMode] = useState<"view" | "create">("view");
    const [importOpen, setImportOpen] = useState(false);

    const { paginated, page, totalPages, totalFiltered, filtered, setPage } =
        usePaginatedFilter({
            items,
            filters,
            searchQuery: search,
            searchFields: ["itemCategory", "itemVariant", "responsiblePerson"],
            filterPredicates: {
                location: (item, val) => item.location === val,
                category: (item, val) => item.itemCategory === val,
            },
        });

    // Extract unique categories from the data
    const uniqueCategories = useMemo(() => {
        const cats = new Set(items.map((i) => i.itemCategory));
        return Array.from(cats).sort();
    }, [items]);

    // Low-stock items (computed from filtered, not paginated)
    const lowStockCount = filtered.filter(
        (i) => i.quantityOnHand <= i.reorderLevel,
    ).length;

    function handleOpenCreate() {
        setSelectedItemId(null);
        setSheetMode("create");
    }

    function handleSelectItem(item: QuantityInventoryListItem) {
        setSheetMode("view");
        setSelectedItemId(item.id);
    }

    function handleCloseSheet() {
        setSelectedItemId(null);
        setSheetMode("view");
    }

    function handleSaved() {
        router.refresh();
    }

    const sheetOpen = selectedItemId !== null || sheetMode === "create";

    return (
        <>
            <div className="flex justify-end gap-2">
                <ExportMenu
                    data={filtered as unknown as Record<string, unknown>[]}
                    columns={EXPORT_COLUMNS}
                    filenamePrefix="bulk-inventory"
                />
                <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                </Button>
                <Button size="sm" onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>

            <QuantityFilters
                locationFilter={filters.location as LocationFilter}
                categoryFilter={filters.category}
                search={search}
                onLocationChange={(v) => setFilter("location", v)}
                onCategoryChange={(v) => setFilter("category", v)}
                onSearchChange={setSearch}
                categories={uniqueCategories}
                resultCount={totalFiltered}
                lowStockCount={lowStockCount}
            />

            <QuantityTable
                items={paginated}
                onSelect={handleSelectItem}
            />

            <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalFiltered}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setPage}
            />

            <QuantityDetailSheet
                itemId={selectedItemId}
                open={sheetOpen}
                onClose={handleCloseSheet}
                mode={sheetMode}
                onSaved={handleSaved}
            />

            <ImportDialog
                open={importOpen}
                onClose={() => setImportOpen(false)}
                title="Import Quantity Inventory"
                description="Upload an Excel or CSV file with inventory data. Existing items will be updated by category, variant, and location."
                columns={QUANTITY_INVENTORY_COLUMNS}
                templateFileName="quantity-inventory-template.xlsx"
                onImport={importQuantityInventoryAction}
            />
        </>
    );
}
