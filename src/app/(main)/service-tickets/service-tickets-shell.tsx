"use client";

import { useState, useMemo } from "react";
import type {
    DownedAssetListItem,
    DownedEquipmentSummary,
} from "@/lib/service-tickets/types";
import { useFilters, usePaginatedFilter } from "@/hooks";
import { TicketSummaryCards } from "./ticket-summary-cards";
import type { TileFilter } from "./ticket-summary-cards";
import { TicketFilters } from "./ticket-filters";
import type { DownedFilterOptions } from "./ticket-filters";
import { TicketTable } from "./ticket-table";
import { TicketDetailSheet } from "./ticket-detail-sheet";
import { Pagination } from "@/components/shared";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

type DownedFilters_ = {
    location: string;
    benchStatus: string;
    condition: string;
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

export function ServiceTicketsShell({
    downedAssets,
    summary,
}: {
    downedAssets: DownedAssetListItem[];
    summary: DownedEquipmentSummary;
}) {
    const router = useRouter();
    const { filters, setFilter, search, setSearch } = useFilters<DownedFilters_>({
        location: "all",
        benchStatus: "all",
        condition: "all",
    });

    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [sheetMode, setSheetMode] = useState<"view" | "create">("view");
    const [activeTile, setActiveTile] = useState<TileFilter>("all");

    const tileFiltered = useMemo(() => {
        if (activeTile === "30plus") {
            return downedAssets.filter((a) => a.daysDown != null && a.daysDown >= 30);
        }
        return downedAssets;
    }, [downedAssets, activeTile]);

    const filterOptions: DownedFilterOptions = useMemo(() => ({
        benchStatus: uniqueSorted(tileFiltered, "benchStatus"),
        condition: uniqueSorted(tileFiltered, "condition"),
    }), [tileFiltered]);

    const { paginated, page, totalPages, totalFiltered, setPage } =
        usePaginatedFilter({
            items: tileFiltered,
            filters,
            searchQuery: search,
            searchFields: [
                "serialNumber",
                "productTypeModel",
                "benchStatus",
                "assignedTechnician",
            ],
            filterPredicates: {
                location: (item, val) => item.currentLocation === val,
                benchStatus: (item, val) => item.benchStatus === val,
                condition: (item, val) => item.condition === val,
            },
        });

    function handleOpenCreate() {
        setSelectedTicketId(null);
        setSheetMode("create");
    }

    function handleSelectAsset(id: string) {
        setSheetMode("view");
        setSelectedTicketId(id);
    }

    function handleCloseSheet() {
        setSelectedTicketId(null);
        setSheetMode("view");
    }

    function handleSaved() {
        router.refresh();
    }

    const sheetOpen = selectedTicketId !== null || sheetMode === "create";

    return (
        <>
            <TicketSummaryCards
                summary={summary}
                activeTile={activeTile}
                onTileClick={setActiveTile}
            />

            <div className="flex justify-end gap-2">
                <Button size="sm" onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Ticket
                </Button>
            </div>

            <TicketFilters
                locationFilter={filters.location}
                benchStatusFilter={filters.benchStatus}
                conditionFilter={filters.condition}
                search={search}
                filterOptions={filterOptions}
                onLocationChange={(v) => setFilter("location", v)}
                onBenchStatusChange={(v) => setFilter("benchStatus", v)}
                onConditionChange={(v) => setFilter("condition", v)}
                onSearchChange={setSearch}
                resultCount={totalFiltered}
            />

            <TicketTable assets={paginated} onSelect={handleSelectAsset} />

            <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalFiltered}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setPage}
            />

            <TicketDetailSheet
                ticketId={selectedTicketId}
                open={sheetOpen}
                onClose={handleCloseSheet}
                mode={sheetMode}
                onSaved={handleSaved}
            />
        </>
    );
}
