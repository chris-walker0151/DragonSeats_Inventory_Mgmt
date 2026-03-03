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
import type { LocationFilter } from "@/lib/serialized-assets/types";
import { Search } from "lucide-react";

export interface FilterOptions {
    manufacturer: string[];
    condition: string[];
    benchStatus: string[];
    manifoldStyle: string[];
    deckType: string[];
    seatType: string[];
    wheelType: string[];
}

interface AssetFiltersProps {
    locationFilter: LocationFilter;
    manufacturerFilter: string;
    conditionFilter: string;
    benchStatusFilter: string;
    manifoldStyleFilter: string;
    deckTypeFilter: string;
    seatTypeFilter: string;
    wheelTypeFilter: string;
    search: string;
    filterOptions: FilterOptions;
    onLocationChange: (v: LocationFilter) => void;
    onManufacturerChange: (v: string) => void;
    onConditionChange: (v: string) => void;
    onBenchStatusChange: (v: string) => void;
    onManifoldStyleChange: (v: string) => void;
    onDeckTypeChange: (v: string) => void;
    onSeatTypeChange: (v: string) => void;
    onWheelTypeChange: (v: string) => void;
    onSearchChange: (v: string) => void;
    resultCount: number;
}

export function AssetFilters({
    locationFilter,
    manufacturerFilter,
    conditionFilter,
    benchStatusFilter,
    manifoldStyleFilter,
    deckTypeFilter,
    seatTypeFilter,
    wheelTypeFilter,
    search,
    filterOptions,
    onLocationChange,
    onManufacturerChange,
    onConditionChange,
    onBenchStatusChange,
    onManifoldStyleChange,
    onDeckTypeChange,
    onSeatTypeChange,
    onWheelTypeChange,
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
                        placeholder="Search asset #, type, manufacturer..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                        aria-label="Search assets"
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
                        {ALL_WAREHOUSE_LOCATIONS.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                                {WAREHOUSE_LOCATION_LABELS[loc]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Manufacturer */}
                <Select value={manufacturerFilter} onValueChange={onManufacturerChange}>
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Manufacturer" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Manufacturers</SelectItem>
                        {filterOptions.manufacturer.map((v) => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Condition */}
                <Select value={conditionFilter} onValueChange={onConditionChange}>
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Conditions</SelectItem>
                        {filterOptions.condition.map((v) => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Bench Status */}
                <Select value={benchStatusFilter} onValueChange={onBenchStatusChange}>
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {filterOptions.benchStatus.map((v) => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Manifold Style */}
                <Select value={manifoldStyleFilter} onValueChange={onManifoldStyleChange}>
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Manifold" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Manifolds</SelectItem>
                        {filterOptions.manifoldStyle.map((v) => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Deck Type */}
                <Select value={deckTypeFilter} onValueChange={onDeckTypeChange}>
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Deck Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Deck Types</SelectItem>
                        {filterOptions.deckType.map((v) => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Seat Type */}
                <Select value={seatTypeFilter} onValueChange={onSeatTypeChange}>
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Seat Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Seat Types</SelectItem>
                        {filterOptions.seatType.map((v) => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Wheel Type */}
                <Select value={wheelTypeFilter} onValueChange={onWheelTypeChange}>
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Wheels" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Wheel Types</SelectItem>
                        {filterOptions.wheelType.map((v) => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
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
