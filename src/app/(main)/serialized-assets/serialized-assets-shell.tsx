"use client";

import { useState, useMemo } from "react";
import type { SerializedAssetListItem } from "@/lib/serialized-assets/types";
import type { LocationFilter } from "@/lib/serialized-assets/types";
import { useFilters, usePaginatedFilter } from "@/hooks";
import { AssetFilters } from "./asset-filters";
import type { FilterOptions } from "./asset-filters";
import { AssetTable } from "./asset-table";
import { AssetDetailSheet } from "./asset-detail-sheet";
import { Pagination } from "@/components/shared";
import { ImportDialog } from "@/components/shared/import-dialog";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { SERIALIZED_ASSET_COLUMNS } from "@/lib/import/constants";
import { importSerializedAssetsAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Upload, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

type AssetFilters_ = {
    location: string;
    manufacturer: string;
    condition: string;
    benchStatus: string;
    manifoldStyle: string;
    deckType: string;
    seatType: string;
    wheelType: string;
};

/** Extract unique non-null values from a field, sorted alphabetically. */
function uniqueSorted<T>(items: T[], field: keyof T): string[] {
    const set = new Set<string>();
    for (const item of items) {
        const val = item[field];
        if (val != null && String(val).trim() !== "") {
            set.add(String(val));
        }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function SerializedAssetsShell({ assets }: { assets: SerializedAssetListItem[] }) {
    const router = useRouter();
    const { filters, setFilter, search, setSearch } = useFilters<AssetFilters_>({
        location: "all",
        manufacturer: "all",
        condition: "all",
        benchStatus: "all",
        manifoldStyle: "all",
        deckType: "all",
        seatType: "all",
        wheelType: "all",
    });

    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [sheetMode, setSheetMode] = useState<"view" | "create">("view");
    const [importOpen, setImportOpen] = useState(false);

    // Compute dynamic filter options from the full asset list
    const filterOptions: FilterOptions = useMemo(() => ({
        manufacturer: uniqueSorted(assets, "manufacturer"),
        condition: uniqueSorted(assets, "condition"),
        benchStatus: uniqueSorted(assets, "benchStatus"),
        manifoldStyle: uniqueSorted(assets, "manifoldStyle"),
        deckType: uniqueSorted(assets, "deckType"),
        seatType: uniqueSorted(assets, "seatType"),
        wheelType: uniqueSorted(assets, "wheelType"),
    }), [assets]);

    const { paginated, page, totalPages, totalFiltered, setPage } =
        usePaginatedFilter({
            items: assets,
            filters,
            searchQuery: search,
            searchFields: ["serialNumber", "productTypeModel", "manufacturer", "benchStatus", "manifoldStyle", "deckType", "seatType", "wheelType", "deployedLocationName"],
            filterPredicates: {
                location: (item, val) => item.currentLocation === val,
                manufacturer: (item, val) => item.manufacturer === val,
                condition: (item, val) => item.condition === val,
                benchStatus: (item, val) => item.benchStatus === val,
                manifoldStyle: (item, val) => item.manifoldStyle === val,
                deckType: (item, val) => item.deckType === val,
                seatType: (item, val) => item.seatType === val,
                wheelType: (item, val) => item.wheelType === val,
            },
        });

    function handleOpenCreate() {
        setSelectedAssetId(null);
        setSheetMode("create");
    }

    function handleSelectAsset(id: string) {
        setSheetMode("view");
        setSelectedAssetId(id);
    }

    function handleCloseSheet() {
        setSelectedAssetId(null);
        setSheetMode("view");
    }

    function handleSaved() {
        router.refresh();
    }

    const sheetOpen = selectedAssetId !== null || sheetMode === "create";

    return (
        <>
            <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                </Button>
                <Button size="sm" onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>

            <AssetFilters
                locationFilter={filters.location as LocationFilter}
                manufacturerFilter={filters.manufacturer}
                conditionFilter={filters.condition}
                benchStatusFilter={filters.benchStatus}
                manifoldStyleFilter={filters.manifoldStyle}
                deckTypeFilter={filters.deckType}
                seatTypeFilter={filters.seatType}
                wheelTypeFilter={filters.wheelType}
                search={search}
                filterOptions={filterOptions}
                onLocationChange={(v) => setFilter("location", v)}
                onManufacturerChange={(v) => setFilter("manufacturer", v)}
                onConditionChange={(v) => setFilter("condition", v)}
                onBenchStatusChange={(v) => setFilter("benchStatus", v)}
                onManifoldStyleChange={(v) => setFilter("manifoldStyle", v)}
                onDeckTypeChange={(v) => setFilter("deckType", v)}
                onSeatTypeChange={(v) => setFilter("seatType", v)}
                onWheelTypeChange={(v) => setFilter("wheelType", v)}
                onSearchChange={setSearch}
                resultCount={totalFiltered}
            />

            <AssetTable
                assets={paginated}
                onSelect={handleSelectAsset}
            />

            <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalFiltered}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setPage}
            />

            <AssetDetailSheet
                assetId={selectedAssetId}
                open={sheetOpen}
                onClose={handleCloseSheet}
                mode={sheetMode}
                onSaved={handleSaved}
            />

            <ImportDialog
                open={importOpen}
                onClose={() => setImportOpen(false)}
                title="Import Serialized Assets"
                description="Upload an Excel or CSV file with asset data. Existing assets will be updated by serial number."
                columns={SERIALIZED_ASSET_COLUMNS}
                templateFileName="serialized-assets-template.xlsx"
                onImport={importSerializedAssetsAction}
            />
        </>
    );
}
