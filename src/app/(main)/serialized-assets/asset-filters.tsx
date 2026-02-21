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
    LIFECYCLE_STATUS_LABELS,
    WAREHOUSE_LOCATION_LABELS,
    BRANDING_STATUS_LABELS,
    ALL_PRODUCT_CATEGORIES,
    ALL_LIFECYCLE_STATUSES,
    ALL_WAREHOUSE_LOCATIONS,
} from "@/lib/serialized-assets/constants";
import type {
    CategoryFilter,
    StatusFilter,
    LocationFilter,
    BrandingFilter,
} from "@/lib/serialized-assets/types";
import type { BrandingStatus } from "@/generated/prisma/client";
import { Search } from "lucide-react";

const ALL_BRANDING_STATUSES: BrandingStatus[] = ["unbranded", "branded"];

interface AssetFiltersProps {
    categoryFilter: CategoryFilter;
    statusFilter: StatusFilter;
    locationFilter: LocationFilter;
    brandingFilter: BrandingFilter;
    search: string;
    onCategoryChange: (v: CategoryFilter) => void;
    onStatusChange: (v: StatusFilter) => void;
    onLocationChange: (v: LocationFilter) => void;
    onBrandingChange: (v: BrandingFilter) => void;
    onSearchChange: (v: string) => void;
    resultCount: number;
}

export function AssetFilters({
    categoryFilter,
    statusFilter,
    locationFilter,
    brandingFilter,
    search,
    onCategoryChange,
    onStatusChange,
    onLocationChange,
    onBrandingChange,
    onSearchChange,
    resultCount,
}: AssetFiltersProps) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search serial #, model, customer..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                        aria-label="Search assets"
                    />
                </div>

                {/* Category */}
                <Select
                    value={categoryFilter}
                    onValueChange={(v) => onCategoryChange(v as CategoryFilter)}
                >
                    <SelectTrigger size="sm">
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

                {/* Status */}
                <Select
                    value={statusFilter}
                    onValueChange={(v) => onStatusChange(v as StatusFilter)}
                >
                    <SelectTrigger size="sm">
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

                {/* Location */}
                <Select
                    value={locationFilter}
                    onValueChange={(v) => onLocationChange(v as LocationFilter)}
                >
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {ALL_WAREHOUSE_LOCATIONS.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                                {WAREHOUSE_LOCATION_LABELS[loc]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Branding */}
                <Select
                    value={brandingFilter}
                    onValueChange={(v) => onBrandingChange(v as BrandingFilter)}
                >
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Branding" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Branding</SelectItem>
                        {ALL_BRANDING_STATUSES.map((b) => (
                            <SelectItem key={b} value={b}>
                                {BRANDING_STATUS_LABELS[b]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <p className="text-xs text-muted-foreground tabular-nums">
                {resultCount} asset{resultCount !== 1 ? "s" : ""}
            </p>
        </div>
    );
}
