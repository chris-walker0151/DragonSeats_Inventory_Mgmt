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
import { Search } from "lucide-react";

export interface DownedFilterOptions {
    benchStatus: string[];
    condition: string[];
}

interface TicketFiltersProps {
    locationFilter: string;
    benchStatusFilter: string;
    conditionFilter: string;
    search: string;
    filterOptions: DownedFilterOptions;
    onLocationChange: (v: string) => void;
    onBenchStatusChange: (v: string) => void;
    onConditionChange: (v: string) => void;
    onSearchChange: (v: string) => void;
    resultCount: number;
}

export function TicketFilters({
    locationFilter,
    benchStatusFilter,
    conditionFilter,
    search,
    filterOptions,
    onLocationChange,
    onBenchStatusChange,
    onConditionChange,
    onSearchChange,
    resultCount,
}: TicketFiltersProps) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search asset #, technician, status..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                        aria-label="Search downed assets"
                    />
                </div>

                {/* Location */}
                <Select value={locationFilter} onValueChange={onLocationChange}>
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

                {/* Status */}
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
            </div>

            <p className="text-xs text-muted-foreground tabular-nums">
                {resultCount} asset{resultCount !== 1 ? "s" : ""}
            </p>
        </div>
    );
}
