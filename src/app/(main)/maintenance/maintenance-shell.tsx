"use client";

import { useState, useMemo } from "react";
import type { MaintenanceListItem, MaintenanceSortField } from "@/lib/maintenance/types";
import { useFilters, usePaginatedFilter } from "@/hooks";
import { MaintenanceFilters } from "./maintenance-filters";
import { MaintenanceTable } from "./maintenance-table";
import { MaintenanceDetailSheet } from "./maintenance-detail-sheet";
import { Pagination } from "@/components/shared";
import { ITEMS_PER_PAGE } from "@/lib/constants";

type MaintFilters_ = {
    category: string;
    status: string;
};

export function MaintenanceShell({ assets }: { assets: MaintenanceListItem[] }) {
    const { filters, setFilter, search, setSearch } = useFilters<MaintFilters_>({
        category: "all",
        status: "all",
    });

    const [sortField, setSortField] = useState<MaintenanceSortField>("yearManufactured");
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

    const { paginated, page, totalPages, totalFiltered, setPage } =
        usePaginatedFilter({
            items: assets,
            filters,
            searchQuery: search,
            searchFields: ["serialNumber", "productTypeModel", "customerName", "maintenanceNotes"],
            filterPredicates: {
                category: (item, val) => item.productCategory === val,
                status: (item, val) => item.lifecycleStatus === val,
            },
        });

    const sorted = useMemo(() => {
        const list = [...paginated];
        list.sort((a, b) => {
            switch (sortField) {
                case "yearManufactured":
                    return (a.yearManufactured ?? 9999) - (b.yearManufactured ?? 9999);
                case "lastRefurbishedDate": {
                    const aDate = a.lastRefurbishedDate ? new Date(a.lastRefurbishedDate).getTime() : 0;
                    const bDate = b.lastRefurbishedDate ? new Date(b.lastRefurbishedDate).getTime() : 0;
                    return aDate - bDate;
                }
                case "lifecycleStatus":
                    return a.lifecycleStatus.localeCompare(b.lifecycleStatus);
                case "serialNumber":
                    return a.serialNumber.localeCompare(b.serialNumber);
                default:
                    return 0;
            }
        });
        return list;
    }, [paginated, sortField]);

    return (
        <>
            <MaintenanceFilters
                categoryFilter={filters.category}
                statusFilter={filters.status}
                search={search}
                sortField={sortField}
                onCategoryChange={(v) => setFilter("category", v)}
                onStatusChange={(v) => setFilter("status", v)}
                onSearchChange={setSearch}
                onSortChange={setSortField}
                resultCount={totalFiltered}
            />

            <MaintenanceTable
                assets={sorted}
                onSelect={(id) => setSelectedAssetId(id)}
            />

            <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalFiltered}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setPage}
            />

            <MaintenanceDetailSheet
                assetId={selectedAssetId}
                open={selectedAssetId !== null}
                onClose={() => setSelectedAssetId(null)}
            />
        </>
    );
}
