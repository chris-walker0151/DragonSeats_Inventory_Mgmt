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
} from "@/lib/serialized-assets/constants";
import type { ProductCategory } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { Search, Truck } from "lucide-react";

type CategoryFilter = ProductCategory | "all";
type ActiveFilter = "all" | "active" | "returned";

interface DeploymentFiltersProps {
    categoryFilter: CategoryFilter;
    activeFilter: ActiveFilter;
    search: string;
    onCategoryChange: (v: CategoryFilter) => void;
    onActiveChange: (v: ActiveFilter) => void;
    onSearchChange: (v: string) => void;
    resultCount: number;
    activeCount: number;
}

export function DeploymentFilters({
    categoryFilter,
    activeFilter,
    search,
    onCategoryChange,
    onActiveChange,
    onSearchChange,
    resultCount,
    activeCount,
}: DeploymentFiltersProps) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search asset, customer, notes..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                        aria-label="Search deployments"
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
                    value={activeFilter}
                    onValueChange={(v) => onActiveChange(v as ActiveFilter)}
                >
                    <SelectTrigger size="sm">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Deployments</SelectItem>
                        <SelectItem value="active">Active (Not Returned)</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground tabular-nums">
                    {resultCount} deployment{resultCount !== 1 ? "s" : ""}
                </p>
                <Badge variant="info" className="text-[10px] gap-1">
                    <Truck className="h-3 w-3" />
                    {activeCount} currently active
                </Badge>
            </div>
        </div>
    );
}
