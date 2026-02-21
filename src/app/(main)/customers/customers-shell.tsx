"use client";

import { useState } from "react";
import type { CustomerListItem } from "@/lib/customers/types";
import type { LeagueFilter, StatusFilter } from "@/lib/customers/types";
import { useFilters, usePaginatedFilter } from "@/hooks";
import { CustomerFilters } from "./customer-filters";
import { CustomerTable } from "./customer-table";
import { CustomerDetailSheet } from "./customer-detail-sheet";
import { Pagination } from "@/components/shared";
import { ITEMS_PER_PAGE } from "@/lib/constants";

type CustomerFilters_ = {
    league: string;
    status: string;
};

export function CustomersShell({ customers }: { customers: CustomerListItem[] }) {
    const { filters, setFilter, search, setSearch } = useFilters<CustomerFilters_>({
        league: "all",
        status: "all",
    });

    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

    const { paginated, page, totalPages, totalFiltered, setPage } =
        usePaginatedFilter({
            items: customers,
            filters,
            searchQuery: search,
            searchFields: ["teamName", "organizationLegalName", "primaryContactName", "stadiumName"],
            filterPredicates: {
                league: (item, val) => item.league === val,
                status: (item, val) => item.activeStatus === val,
            },
        });

    return (
        <>
            <CustomerFilters
                leagueFilter={filters.league as LeagueFilter}
                statusFilter={filters.status as StatusFilter}
                search={search}
                onLeagueChange={(v) => setFilter("league", v)}
                onStatusChange={(v) => setFilter("status", v)}
                onSearchChange={setSearch}
                resultCount={totalFiltered}
            />

            <CustomerTable
                customers={paginated}
                onSelect={(id) => setSelectedCustomerId(id)}
            />

            <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalFiltered}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setPage}
            />

            <CustomerDetailSheet
                customerId={selectedCustomerId}
                open={selectedCustomerId !== null}
                onClose={() => setSelectedCustomerId(null)}
            />
        </>
    );
}
