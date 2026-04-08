"use client";

import { useState } from "react";
import type { CustomerListItem } from "@/lib/customers/types";
import type { LeagueFilter, StatusFilter } from "@/lib/customers/types";
import { useFilters, usePaginatedFilter } from "@/hooks";
import { CustomerFilters } from "./customer-filters";
import { CustomerTable } from "./customer-table";
import { CustomerDetailSheet } from "./customer-detail-sheet";
import { Pagination } from "@/components/shared";
import { ImportDialog } from "@/components/shared/import-dialog";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { CUSTOMER_COLUMNS } from "@/lib/import/constants";
import { importCustomersAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Upload, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { ExportMenu } from "@/components/shared/export-menu";
import type { ExportColumn } from "@/lib/export/excel-csv";

const EXPORT_COLUMNS: ExportColumn[] = [
    { key: "teamName", label: "Team Name" },
    { key: "league", label: "League" },
    { key: "organizationLegalName", label: "Organization" },
    { key: "primaryContactName", label: "Contact Name" },
    { key: "primaryContactEmail", label: "Contact Email" },
    { key: "primaryContactPhone", label: "Contact Phone" },
    { key: "stadiumName", label: "Stadium" },
    { key: "contractType", label: "Contract Type" },
    { key: "activeStatus", label: "Status" },
    { key: "deployedAssetCount", label: "Deployed Assets" },
];

type CustomerFilters_ = {
    league: string;
    status: string;
};

export function CustomersShell({ customers }: { customers: CustomerListItem[] }) {
    const router = useRouter();
    const { filters, setFilter, search, setSearch } = useFilters<CustomerFilters_>({
        league: "all",
        status: "all",
    });

    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [sheetMode, setSheetMode] = useState<"view" | "create">("view");
    const [importOpen, setImportOpen] = useState(false);

    const { paginated, filtered, page, totalPages, totalFiltered, setPage } =
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

    function handleOpenCreate() {
        setSelectedCustomerId(null);
        setSheetMode("create");
    }

    function handleSelectCustomer(id: string) {
        setSheetMode("view");
        setSelectedCustomerId(id);
    }

    function handleCloseSheet() {
        setSelectedCustomerId(null);
        setSheetMode("view");
    }

    function handleSaved() {
        router.refresh();
    }

    const sheetOpen = selectedCustomerId !== null || sheetMode === "create";

    return (
        <>
            <div className="flex justify-end gap-2">
                <ExportMenu
                    data={filtered as unknown as Record<string, unknown>[]}
                    columns={EXPORT_COLUMNS}
                    filenamePrefix="customers"
                />
                <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                </Button>
                <Button size="sm" onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>

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
                onSelect={handleSelectCustomer}
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
                open={sheetOpen}
                onClose={handleCloseSheet}
                mode={sheetMode}
                onSaved={handleSaved}
            />

            <ImportDialog
                open={importOpen}
                onClose={() => setImportOpen(false)}
                title="Import Customers"
                description="Upload an Excel or CSV file with customer data. Existing customers will be updated by team name."
                columns={CUSTOMER_COLUMNS}
                templateFileName="customers-template.xlsx"
                onImport={importCustomersAction}
            />
        </>
    );
}
