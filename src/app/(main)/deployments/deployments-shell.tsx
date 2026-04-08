"use client";

import { useState } from "react";
import type { DeploymentAssetItem, AvailabilitySummary, AvailabilityTileFilter } from "@/lib/deployments/types";
import type { AssetAvailability, ProductCategory } from "@/generated/prisma/client";

type CategoryFilter = ProductCategory | "all";
type AvailabilityFilter = AssetAvailability | "all";
import { useFilters, usePaginatedFilter } from "@/hooks";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { DEPLOYMENT_ACTIONS } from "@/lib/deployments/action-config";
import type { DeploymentAction } from "@/lib/deployments/action-config";
import { AvailabilitySummaryCards } from "./availability-summary-cards";
import { DeploymentFilters } from "./deployment-filters";
import { DeploymentTable } from "./deployment-table";
import { DeploymentActionDialog } from "./deployment-action-dialog";
import { Pagination } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { ExportMenu } from "@/components/shared/export-menu";
import type { ExportColumn } from "@/lib/export/excel-csv";

const EXPORT_COLUMNS: ExportColumn[] = [
    { key: "serialNumber", label: "Serial Number" },
    { key: "productCategory", label: "Category" },
    { key: "productTypeModel", label: "Product Type" },
    { key: "availability", label: "Availability" },
    { key: "currentLocation", label: "Location" },
    { key: "condition", label: "Condition" },
    { key: "manufacturer", label: "Manufacturer" },
    { key: "customerName", label: "Customer" },
    { key: "deployedLocationName", label: "Deployed Location" },
    { key: "deploymentDate", label: "Deployment Date" },
    { key: "expectedReturnDate", label: "Expected Return" },
];

type DeploymentFilters_ = {
    category: string;
    availability: string;
};

interface DeploymentsShellProps {
    assets: DeploymentAssetItem[];
    summary: AvailabilitySummary;
    customers: { id: string; teamName: string }[];
}

export function DeploymentsShell({
    assets,
    summary,
    customers,
}: DeploymentsShellProps) {
    // ── Filters ──────────────────────────────────────────────────────────
    const { filters, setFilter, search, setSearch } = useFilters<DeploymentFilters_>({
        category: "all",
        availability: "all",
    });

    // Tile filter (summary card click)
    const [tileFilter, setTileFilter] = useState<AvailabilityTileFilter>("all");

    const { paginated, filtered, page, totalPages, totalFiltered, setPage } =
        usePaginatedFilter({
            items: assets,
            filters: {
                ...filters,
                tileAvailability: tileFilter,
            },
            searchQuery: search,
            searchFields: ["serialNumber", "customerName", "deployedLocationName"],
            filterPredicates: {
                category: (item, val) => item.productCategory === val,
                availability: (item, val) => item.availability === val,
                tileAvailability: (item, val) => item.availability === val,
            },
        });

    // ── Selection ────────────────────────────────────────────────────────
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [batchAction, setBatchAction] = useState<DeploymentAction | null>(null);
    const [batchDialogOpen, setBatchDialogOpen] = useState(false);

    // Only count selected IDs that exist on the current page
    const pageIds = new Set(paginated.map((a) => a.id));
    const validSelectedIds = new Set(
        [...selectedIds].filter((id) => pageIds.has(id)),
    );
    const hasSelection = validSelectedIds.size > 0;

    function handleToggleSelect(id: string) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    function handleToggleAll() {
        const allOnPageSelected = paginated.every((a) => selectedIds.has(a.id));
        if (allOnPageSelected) {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                for (const a of paginated) next.delete(a.id);
                return next;
            });
        } else {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                for (const a of paginated) next.add(a.id);
                return next;
            });
        }
    }

    // ── Action enablement ────────────────────────────────────────────────
    // An action is enabled only if ALL selected assets' availability
    // is in that action's allowedFrom array
    function isActionAllowed(actionKey: DeploymentAction): boolean {
        if (!hasSelection) return false;
        const config = DEPLOYMENT_ACTIONS.find((a) => a.key === actionKey);
        if (!config) return false;

        const selectedAssets = assets.filter((a) => validSelectedIds.has(a.id));
        return selectedAssets.every((a) =>
            config.allowedFrom.includes(a.availability as AssetAvailability),
        );
    }

    function handleBatchAction(actionKey: DeploymentAction) {
        setBatchAction(actionKey);
        setBatchDialogOpen(true);
    }

    function handleBatchComplete() {
        setBatchDialogOpen(false);
        setBatchAction(null);
        setSelectedIds(new Set());
    }

    function handleBatchClose() {
        setBatchDialogOpen(false);
        setBatchAction(null);
    }

    // Sync tile filter with dropdown when tile clicked
    function handleTileChange(filter: AvailabilityTileFilter) {
        setTileFilter(filter);
        // Reset dropdown to match
        if (filter !== "all") {
            setFilter("availability", filter);
        } else {
            setFilter("availability", "all");
        }
        setPage(1);
    }

    // Sync tile when dropdown changes
    function handleAvailabilityFilterChange(val: string) {
        setFilter("availability", val);
        setTileFilter(val as AvailabilityTileFilter);
        setPage(1);
    }

    return (
        <>
            <AvailabilitySummaryCards
                summary={summary}
                activeFilter={tileFilter}
                onFilterChange={handleTileChange}
            />

            <div className="flex items-center justify-between gap-3">
                <ExportMenu
                    data={filtered as unknown as Record<string, unknown>[]}
                    columns={EXPORT_COLUMNS}
                    filenamePrefix="deployments"
                />
                <DeploymentFilters
                    categoryFilter={filters.category as CategoryFilter}
                    availabilityFilter={filters.availability as AvailabilityFilter}
                    search={search}
                    onCategoryChange={(v) => { setFilter("category", v); setPage(1); }}
                    onAvailabilityChange={handleAvailabilityFilterChange}
                    onSearchChange={setSearch}
                    resultCount={totalFiltered}
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            variant={hasSelection ? "default" : "outline"}
                            disabled={!hasSelection}
                            className="shrink-0"
                        >
                            Action
                            {hasSelection && (
                                <span className="ml-1 rounded-full bg-primary-foreground/20 px-1.5 text-xs">
                                    {validSelectedIds.size}
                                </span>
                            )}
                            <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {DEPLOYMENT_ACTIONS.map((cfg) => {
                            const Icon = cfg.icon;
                            const allowed = isActionAllowed(cfg.key);
                            return (
                                <DropdownMenuItem
                                    key={cfg.key}
                                    disabled={!allowed}
                                    onClick={() => handleBatchAction(cfg.key)}
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    {cfg.label}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <DeploymentTable
                assets={paginated}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleAll={handleToggleAll}
            />

            <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalFiltered}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setPage}
            />

            <DeploymentActionDialog
                open={batchDialogOpen}
                action={batchAction}
                assetIds={Array.from(validSelectedIds)}
                customers={customers}
                onClose={handleBatchClose}
                onComplete={handleBatchComplete}
            />
        </>
    );
}
