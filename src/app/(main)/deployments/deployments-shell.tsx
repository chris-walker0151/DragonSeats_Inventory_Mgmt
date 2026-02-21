"use client";

import type { DeploymentListItem } from "@/lib/deployments/types";
import type { ProductCategory } from "@/generated/prisma";
import { useFilters, usePaginatedFilter } from "@/hooks";
import { DeploymentFilters } from "./deployment-filters";
import { DeploymentTable } from "./deployment-table";
import { Pagination } from "@/components/shared";
import { ITEMS_PER_PAGE } from "@/lib/constants";

type CategoryFilter = ProductCategory | "all";
type ActiveFilter = "all" | "active" | "returned";

type DeploymentFilters_ = {
    category: string;
    active: string;
};

export function DeploymentsShell({ deployments }: { deployments: DeploymentListItem[] }) {
    const { filters, setFilter, search, setSearch } = useFilters<DeploymentFilters_>({
        category: "all",
        active: "all",
    });

    const { paginated, page, totalPages, totalFiltered, setPage } =
        usePaginatedFilter({
            items: deployments,
            filters,
            searchQuery: search,
            searchFields: ["assetSerialNumber", "customerName", "deploymentNotes"],
            filterPredicates: {
                category: (item, val) => item.assetProductCategory === val,
                active: (item, val) => {
                    if (val === "active") return item.actualReturnDate === null;
                    if (val === "returned") return item.actualReturnDate !== null;
                    return true;
                },
            },
        });

    // Summary counts (from full list, not filtered)
    const activeCount = deployments.filter((d) => d.actualReturnDate === null).length;

    return (
        <>
            <DeploymentFilters
                categoryFilter={filters.category as CategoryFilter}
                activeFilter={filters.active as ActiveFilter}
                search={search}
                onCategoryChange={(v) => setFilter("category", v)}
                onActiveChange={(v) => setFilter("active", v)}
                onSearchChange={setSearch}
                resultCount={totalFiltered}
                activeCount={activeCount}
            />

            <DeploymentTable deployments={paginated} />

            <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalFiltered}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setPage}
            />
        </>
    );
}
