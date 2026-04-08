"use client";

import { useFilters, usePaginatedFilter } from "@/hooks";
import { AuditLogTable } from "./audit-log-table";
import { AuditLogFilters } from "./audit-log-filters";
import { Pagination } from "@/components/shared";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { ActivityLogListItem } from "@/lib/activity-log/types";

const COLLECTION_OPTIONS = [
    "serialized-assets",
    "customers",
    "service-tickets",
    "quantity-inventory",
];

const METHOD_OPTIONS = ["Manual / Web", "Import"];

type AuditLogFilters_ = {
    collection: string;
    method: string;
};

export function AuditLogShell({
    entries,
}: {
    entries: ActivityLogListItem[];
    total: number;
}) {
    const { filters, setFilter, search, setSearch } =
        useFilters<AuditLogFilters_>({
            collection: "all",
            method: "all",
        });

    const { paginated, page, totalPages, totalFiltered, setPage } =
        usePaginatedFilter({
            items: entries,
            filters,
            searchQuery: search,
            searchFields: ["summary", "userId", "fieldChanged", "recordId"],
            filterPredicates: {
                collection: (item, val) => item.collectionName === val,
                method: (item, val) => item.method === val,
            },
        });

    return (
        <>
            <AuditLogFilters
                collectionFilter={filters.collection}
                methodFilter={filters.method}
                search={search}
                collectionOptions={COLLECTION_OPTIONS}
                methodOptions={METHOD_OPTIONS}
                onCollectionChange={(v) => setFilter("collection", v)}
                onMethodChange={(v) => setFilter("method", v)}
                onSearchChange={setSearch}
                resultCount={totalFiltered}
            />

            <AuditLogTable entries={paginated} />

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
