"use client";

import { useState } from "react";
import type { SerializedAssetListItem } from "@/lib/serialized-assets/types";
import type { CategoryFilter, StatusFilter, LocationFilter, BrandingFilter } from "@/lib/serialized-assets/types";
import { useFilters, usePaginatedFilter } from "@/hooks";
import { AssetFilters } from "./asset-filters";
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
    category: string;
    status: string;
    location: string;
    branding: string;
};

export function SerializedAssetsShell({ assets }: { assets: SerializedAssetListItem[] }) {
    const router = useRouter();
    const { filters, setFilter, search, setSearch } = useFilters<AssetFilters_>({
        category: "all",
        status: "all",
        location: "all",
        branding: "all",
    });

    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [sheetMode, setSheetMode] = useState<"view" | "create">("view");
    const [importOpen, setImportOpen] = useState(false);

    const { paginated, page, totalPages, totalFiltered, setPage } =
        usePaginatedFilter({
            items: assets,
            filters,
            searchQuery: search,
            searchFields: ["serialNumber", "productTypeModel", "customerName", "skuCode"],
            filterPredicates: {
                category: (item, val) => item.productCategory === val,
                status: (item, val) => item.lifecycleStatus === val,
                location: (item, val) => item.currentLocation === val,
                branding: (item, val) => item.brandingStatus === val,
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
                categoryFilter={filters.category as CategoryFilter}
                statusFilter={filters.status as StatusFilter}
                locationFilter={filters.location as LocationFilter}
                brandingFilter={filters.branding as BrandingFilter}
                search={search}
                onCategoryChange={(v) => setFilter("category", v)}
                onStatusChange={(v) => setFilter("status", v)}
                onLocationChange={(v) => setFilter("location", v)}
                onBrandingChange={(v) => setFilter("branding", v)}
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
