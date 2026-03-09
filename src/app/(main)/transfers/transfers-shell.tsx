"use client";

import { useState } from "react";
import type { TransferListItem } from "@/lib/transfers/types";
import type { TransferStatus, WarehouseLocation } from "@/generated/prisma/client";
import { useFilters, usePaginatedFilter } from "@/hooks";
import { TransferFilters } from "./transfer-filters";
import { TransferTable } from "./transfer-table";
import { TransferDetailSheet } from "./transfer-detail-sheet";
import { NewTransferDialog } from "./new-transfer-dialog";
import { Pagination } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { Plus } from "lucide-react";

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

    const { paginated, page, totalPages, totalFiltered, setPage } =
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

    // Detail sheet state
    const [selectedTransfer, setSelectedTransfer] = useState<TransferListItem | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // New transfer dialog state
    const [newDialogOpen, setNewDialogOpen] = useState(false);

    function handleRowClick(transfer: TransferListItem) {
        setSelectedTransfer(transfer);
        setDetailOpen(true);
    }

    return (
        <>
            <div className="flex items-center justify-between">
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
                <Button
                    size="sm"
                    onClick={() => setNewDialogOpen(true)}
                >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    New Transfer
                </Button>
            </div>

            <TransferTable transfers={paginated} onRowClick={handleRowClick} />

            <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalFiltered}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setPage}
            />

            <TransferDetailSheet
                transfer={selectedTransfer}
                open={detailOpen}
                onClose={() => {
                    setDetailOpen(false);
                    setSelectedTransfer(null);
                }}
            />

            <NewTransferDialog
                open={newDialogOpen}
                onClose={() => setNewDialogOpen(false)}
            />
        </>
    );
}
