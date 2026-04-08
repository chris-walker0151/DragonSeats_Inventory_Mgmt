"use client";

import type { TransferListItem } from "@/lib/transfers/types";
import type { TransferStatus, WarehouseLocation } from "@/generated/prisma/client";
import { useFilters, usePaginatedFilter } from "@/hooks";
import { TransferFilters } from "./transfer-filters";
import { TransferTable } from "./transfer-table";
import { Pagination } from "@/components/shared";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { ExportMenu } from "@/components/shared/export-menu";
import type { ExportColumn } from "@/lib/export/excel-csv";

const EXPORT_COLUMNS: ExportColumn[] = [
    { key: "assetSerialNumber", label: "Serial Number" },
    { key: "assetProductCategory", label: "Category" },
    { key: "quantityItemCategory", label: "Quantity Item" },
    { key: "quantity", label: "Quantity" },
    { key: "originLocation", label: "Origin" },
    { key: "destinationLocation", label: "Destination" },
    { key: "transferDate", label: "Transfer Date" },
    { key: "transferStatus", label: "Status" },
    { key: "transferInitiatedBy", label: "Initiated By" },
    { key: "transferReceivedBy", label: "Received By" },
    { key: "notes", label: "Notes" },
];

type StatusFilter = TransferStatus | "all";
type OriginFilter = WarehouseLocation | "all";

type TransferFilters_ = {
    status: string;
    origin: string;
};

export function TransfersShell({ transfers }: { transfers: TransferListItem[] }) {
    const { filters, setFilter, search, setSearch } = useFilters<TransferFilters_>({
        status: "all",
        origin: "all",
    });

    const { paginated, filtered, page, totalPages, totalFiltered, setPage } =
        usePaginatedFilter({
            items: transfers,
            filters,
            searchQuery: search,
            searchFields: ["assetSerialNumber", "quantityItemCategory", "transferInitiatedBy", "notes"],
            filterPredicates: {
                status: (item, val) => item.transferStatus === val,
                origin: (item, val) => item.originLocation === val,
            },
        });

    const inTransitCount = transfers.filter((t) => t.transferStatus === "in_transit").length;

    return (
        <>
            <div className="flex justify-end gap-2">
                <ExportMenu
                    data={filtered as unknown as Record<string, unknown>[]}
                    columns={EXPORT_COLUMNS}
                    filenamePrefix="transfers"
                />
            </div>

            <TransferFilters
                statusFilter={filters.status as StatusFilter}
                originFilter={filters.origin as OriginFilter}
                search={search}
                onStatusChange={(v) => setFilter("status", v)}
                onOriginChange={(v) => setFilter("origin", v)}
                onSearchChange={setSearch}
                resultCount={totalFiltered}
                inTransitCount={inTransitCount}
            />

            <TransferTable transfers={paginated} />

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
