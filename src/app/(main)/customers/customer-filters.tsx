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
    LEAGUE_LABELS,
    CUSTOMER_STATUS_LABELS,
    ALL_LEAGUES,
    ALL_CUSTOMER_STATUSES,
} from "@/lib/customers/constants";
import type { LeagueFilter, StatusFilter } from "@/lib/customers/types";
import { Search } from "lucide-react";

interface CustomerFiltersProps {
    leagueFilter: LeagueFilter;
    statusFilter: StatusFilter;
    search: string;
    onLeagueChange: (v: LeagueFilter) => void;
    onStatusChange: (v: StatusFilter) => void;
    onSearchChange: (v: string) => void;
    resultCount: number;
}

export function CustomerFilters({
    leagueFilter,
    statusFilter,
    search,
    onLeagueChange,
    onStatusChange,
    onSearchChange,
    resultCount,
}: CustomerFiltersProps) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search team, contact, stadium..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                        aria-label="Search customers"
                    />
                </div>

                {/* League */}
                <Select
                    value={leagueFilter}
                    onValueChange={(v) => onLeagueChange(v as LeagueFilter)}
                >
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="League" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Leagues</SelectItem>
                        {ALL_LEAGUES.map((league) => (
                            <SelectItem key={league} value={league}>
                                {LEAGUE_LABELS[league]}
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
                        {ALL_CUSTOMER_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                                {CUSTOMER_STATUS_LABELS[status]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <p className="text-xs text-muted-foreground tabular-nums">
                {resultCount} customer{resultCount !== 1 ? "s" : ""}
            </p>
        </div>
    );
}
