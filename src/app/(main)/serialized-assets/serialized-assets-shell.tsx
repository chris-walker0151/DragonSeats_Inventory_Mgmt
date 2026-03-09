"use client";

import { useState, useMemo, useCallback } from "react";
import type { SerializedAssetListItem } from "@/lib/serialized-assets/types";
import type { LocationFilter } from "@/lib/serialized-assets/types";
import { useFilters, usePaginatedFilter } from "@/hooks";
import { AssetFilters } from "./asset-filters";
import type { FilterOptions } from "./asset-filters";
import { AssetTable } from "./asset-table";
import { AssetDetailSheet } from "./asset-detail-sheet";
import { BatchActionDialog } from "./batch-action-dialog";
import { Pagination } from "@/components/shared";
import { ImportDialog } from "@/components/shared/import-dialog";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { SERIALIZED_ASSET_COLUMNS } from "@/lib/import/constants";
import { importSerializedAssetsAction } from "./actions";
import type { BatchAction } from "./actions";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Upload, Plus, ChevronDown, Bookmark, Truck, Wrench, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type AssetFilters_ = {
    location: string;
    manufacturer: string;
    condition: string;
    benchStatus: string;
    availability: string;
    manifoldStyle: string;
    deckType: string;
    seatType: string;
    wheelType: string;
};

/** Extract unique non-null values from a field, sorted alphabetically. Includes "Blank" if any items have null/empty values. */
function uniqueSorted<T>(items: T[], field: keyof T): string[] {
    const set = new Set<string>();
    let hasBlank = false;
    for (const item of items) {
        const val = item[field];
        if (val == null || String(val).trim() === "") {
            hasBlank = true;
        } else {
            set.add(String(val));
        }
    }
    const sorted = Array.from(set).sort((a, b) => a.localeCompare(b));
    if (hasBlank) sorted.push("Blank");
    return sorted;
}

export function SerializedAssetsShell({ assets }: { assets: SerializedAssetListItem[] }) {
    const router = useRouter();
    const { filters, setFilter, search, setSearch } = useFilters<AssetFilters_>({
        location: "all",
        manufacturer: "all",
        condition: "all",
        benchStatus: "all",
        availability: "all",
        manifoldStyle: "all",
        deckType: "all",
        seatType: "all",
        wheelType: "all",
    });

    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [sheetMode, setSheetMode] = useState<"view" | "create">("view");
    const [importOpen, setImportOpen] = useState(false);

    // Batch action state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [batchAction, setBatchAction] = useState<BatchAction | null>(null);
    const [batchDialogOpen, setBatchDialogOpen] = useState(false);

    // Compute dynamic filter options from the full asset list
    const filterOptions: FilterOptions = useMemo(() => ({
        manufacturer: uniqueSorted(assets, "manufacturer"),
        condition: uniqueSorted(assets, "condition"),
        benchStatus: uniqueSorted(assets, "benchStatus"),
        availability: uniqueSorted(assets, "availability"),
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
                manufacturer: (item, val) => val === "Blank" ? !item.manufacturer : item.manufacturer === val,
                condition: (item, val) => val === "Blank" ? !item.condition : item.condition === val,
                benchStatus: (item, val) => val === "Blank" ? !item.benchStatus : item.benchStatus === val,
                availability: (item, val) => val === "Blank" ? !item.availability : item.availability === val,
                manifoldStyle: (item, val) => val === "Blank" ? !item.manifoldStyle : item.manifoldStyle === val,
                deckType: (item, val) => val === "Blank" ? !item.deckType : item.deckType === val,
                seatType: (item, val) => val === "Blank" ? !item.seatType : item.seatType === val,
                wheelType: (item, val) => val === "Blank" ? !item.wheelType : item.wheelType === val,
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

    // Derive valid selection: only keep IDs that are on the current page
    const paginatedIds = useMemo(() => new Set(paginated.map((a) => a.id)), [paginated]);
    const validSelectedIds = useMemo(() => {
        const valid = new Set<string>();
        for (const id of selectedIds) {
            if (paginatedIds.has(id)) valid.add(id);
        }
        return valid;
    }, [selectedIds, paginatedIds]);

    const handleToggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleToggleAll = useCallback(() => {
        setSelectedIds((prev) => {
            const allSelected = paginated.every((a) => prev.has(a.id));
            if (allSelected) {
                return new Set();
            }
            return new Set(paginated.map((a) => a.id));
        });
    }, [paginated]);

    function handleBatchAction(action: BatchAction) {
        setBatchAction(action);
        setBatchDialogOpen(true);
    }

    function handleBatchComplete() {
        setBatchDialogOpen(false);
        setBatchAction(null);
        setSelectedIds(new Set());
        router.refresh();
    }

    function handleBatchClose() {
        setBatchDialogOpen(false);
        setBatchAction(null);
    }

    const hasSelection = validSelectedIds.size > 0;
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            variant={hasSelection ? "default" : "outline"}
                            disabled={!hasSelection}
                        >
                            Action
                            {hasSelection && (
                                <span className="ml-1.5 rounded-full bg-primary-foreground/20 px-1.5 text-xs">
                                    {validSelectedIds.size}
                                </span>
                            )}
                            <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleBatchAction("reserve")}>
                            <Bookmark className="mr-2 h-4 w-4" />
                            Reserve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBatchAction("deploy")}>
                            <Truck className="mr-2 h-4 w-4" />
                            Deploy
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBatchAction("refurbish")}>
                            <Wrench className="mr-2 h-4 w-4" />
                            Refurbish
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleBatchAction("retire")}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Retire
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <AssetFilters
                locationFilter={filters.location as LocationFilter}
                manufacturerFilter={filters.manufacturer}
                conditionFilter={filters.condition}
                benchStatusFilter={filters.benchStatus}
                availabilityFilter={filters.availability}
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
                onAvailabilityChange={(v) => setFilter("availability", v)}
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
                selectedIds={validSelectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleAll={handleToggleAll}
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

            <BatchActionDialog
                open={batchDialogOpen}
                action={batchAction}
                assetIds={Array.from(validSelectedIds)}
                onClose={handleBatchClose}
                onComplete={handleBatchComplete}
            />
        </>
    );
}
