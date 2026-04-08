"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

const COLLECTION_LABELS: Record<string, string> = {
    "serialized-assets": "Serialized Assets",
    customers: "Customers",
    "service-tickets": "Service Tickets",
    "quantity-inventory": "Bulk Inventory",
};

interface AuditLogFiltersProps {
    collectionFilter: string;
    methodFilter: string;
    search: string;
    collectionOptions: string[];
    methodOptions: string[];
    onCollectionChange: (v: string) => void;
    onMethodChange: (v: string) => void;
    onSearchChange: (v: string) => void;
    resultCount: number;
}

export function AuditLogFilters({
    collectionFilter,
    methodFilter,
    search,
    collectionOptions,
    methodOptions,
    onCollectionChange,
    onMethodChange,
    onSearchChange,
    resultCount,
}: AuditLogFiltersProps) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search changes..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                        aria-label="Search audit log"
                    />
                </div>

                <Select
                    value={collectionFilter}
                    onValueChange={onCollectionChange}
                >
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Collection" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Collections</SelectItem>
                        {collectionOptions.map((c) => (
                            <SelectItem key={c} value={c}>
                                {COLLECTION_LABELS[c] ?? c}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={methodFilter}
                    onValueChange={onMethodChange}
                >
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        {methodOptions.map((m) => (
                            <SelectItem key={m} value={m}>
                                {m}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <p className="text-xs text-muted-foreground tabular-nums">
                {resultCount} change{resultCount !== 1 ? "s" : ""}
            </p>
        </div>
    );
}
