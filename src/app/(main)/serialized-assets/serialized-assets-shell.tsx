"use client";

import { useState } from "react";
import type { SerializedAssetListItem } from "@/lib/serialized-assets/types";
import type { CategoryFilter, StatusFilter, LocationFilter, BrandingFilter } from "@/lib/serialized-assets/types";
import { useFilters, usePaginatedFilter } from "@/hooks";
import { AssetFilters } from "./asset-filters";
import { AssetTable } from "./asset-table";
import { AssetDetailSheet } from "./asset-detail-sheet";
import { Pagination } from "@/components/shared";
import { ITEMS_PER_PAGE } from "@/lib/constants";

type AssetFilters_ = {
    category: string;
    status: string;
    location: string;
    branding: string;
};

export function SerializedAssetsShell({ assets }: { assets: SerializedAssetListItem[] }) {
    const { filters, setFilter, search, setSearch } = useFilters<AssetFilters_>({
        category: "all",
        status: "all",
        location: "all",
        branding: "all",
    });

    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

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

    return (
        <>
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
                onSelect={(id) => setSelectedAssetId(id)}
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
                open={selectedAssetId !== null}
                onClose={() => setSelectedAssetId(null)}
            />
        </>
    );
}
