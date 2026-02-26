"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    PRODUCT_CATEGORY_LABELS,
    ALL_PRODUCT_CATEGORIES,
    LIFECYCLE_STATUS_LABELS,
    ALL_LIFECYCLE_STATUSES,
} from "@/lib/maintenance/constants";
import type { MaintenanceSortField } from "@/lib/maintenance/types";

interface MaintenanceFiltersProps {
    categoryFilter: string;
    statusFilter: string;
    search: string;
    sortField: MaintenanceSortField;
    onCategoryChange: (v: string) => void;
    onStatusChange: (v: string) => void;
    onSearchChange: (v: string) => void;
    onSortChange: (v: MaintenanceSortField) => void;
    resultCount: number;
}

const SORT_OPTIONS: { value: MaintenanceSortField; label: string }[] = [
    { value: "yearManufactured", label: "Year Manufactured" },
    { value: "lastRefurbishedDate", label: "Last Refurbished" },
    { value: "lifecycleStatus", label: "Status" },
    { value: "serialNumber", label: "Serial #" },
];

export function MaintenanceFilters({
    categoryFilter,
    statusFilter,
    search,
    sortField,
    onCategoryChange,
    onStatusChange,
    onSearchChange,
    onSortChange,
    resultCount,
}: MaintenanceFiltersProps) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Input
                placeholder="Search serial, model, customer, notes..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full sm:w-64"
                aria-label="Search maintenance assets"
            />

            <Select value={categoryFilter} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {ALL_PRODUCT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                            {PRODUCT_CATEGORY_LABELS[cat]}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {ALL_LIFECYCLE_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                            {LIFECYCLE_STATUS_LABELS[s]}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={sortField} onValueChange={(v) => onSortChange(v as MaintenanceSortField)}>
                <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                {resultCount} assets
            </span>
        </div>
    );
}
