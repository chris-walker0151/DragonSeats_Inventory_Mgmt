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
    WAREHOUSE_LOCATION_LABELS,
    ALL_WAREHOUSE_LOCATIONS,
} from "@/lib/serialized-assets/constants";
import type { LocationFilter } from "@/lib/quantity-inventory/types";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle } from "lucide-react";

interface QuantityFiltersProps {
    locationFilter: LocationFilter;
    categoryFilter: string;
    search: string;
    onLocationChange: (v: LocationFilter) => void;
    onCategoryChange: (v: string) => void;
    onSearchChange: (v: string) => void;
    categories: string[];
    resultCount: number;
    lowStockCount: number;
}

// Only warehouse locations, not deployed_customer
const WAREHOUSE_ONLY = ALL_WAREHOUSE_LOCATIONS.filter(
    (loc) => loc !== "deployed_customer",
);

export function QuantityFilters({
    locationFilter,
    categoryFilter,
    search,
    onLocationChange,
    onCategoryChange,
    onSearchChange,
    categories,
    resultCount,
    lowStockCount,
}: QuantityFiltersProps) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search category, variant..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                        aria-label="Search inventory items"
                    />
                </div>

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
                        {WAREHOUSE_ONLY.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                                {WAREHOUSE_LOCATION_LABELS[loc]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Category */}
                <Select
                    value={categoryFilter}
                    onValueChange={onCategoryChange}
                >
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground tabular-nums">
                    {resultCount} item{resultCount !== 1 ? "s" : ""}
                </p>
                {lowStockCount > 0 && (
                    <Badge variant="warning" className="text-[10px] gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {lowStockCount} below reorder level
                    </Badge>
                )}
            </div>
        </div>
    );
}
