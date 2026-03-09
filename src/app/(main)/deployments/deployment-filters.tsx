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
    AVAILABILITY_LABELS,
    ALL_AVAILABILITIES,
} from "@/lib/deployments/constants";
import type { ProductCategory, AssetAvailability } from "@/generated/prisma/client";
import { Search } from "lucide-react";

type CategoryFilter = ProductCategory | "all";
type AvailabilityFilter = AssetAvailability | "all";

interface DeploymentFiltersProps {
    categoryFilter: CategoryFilter;
    availabilityFilter: AvailabilityFilter;
    search: string;
    onCategoryChange: (v: CategoryFilter) => void;
    onAvailabilityChange: (v: AvailabilityFilter) => void;
    onSearchChange: (v: string) => void;
    resultCount: number;
}

export function DeploymentFilters({
    categoryFilter,
    availabilityFilter,
    search,
    onCategoryChange,
    onAvailabilityChange,
    onSearchChange,
    resultCount,
}: DeploymentFiltersProps) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search asset, customer, location..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                        aria-label="Search assets"
                    />
                </div>

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

                <Select
                    value={availabilityFilter}
                    onValueChange={(v) => onAvailabilityChange(v as AvailabilityFilter)}
                >
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Availability</SelectItem>
                        {ALL_AVAILABILITIES.map((avail) => (
                            <SelectItem key={avail} value={avail}>
                                {AVAILABILITY_LABELS[avail]}
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
