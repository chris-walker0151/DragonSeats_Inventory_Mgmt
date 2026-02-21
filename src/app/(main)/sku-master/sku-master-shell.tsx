"use client";

import { useState, useMemo } from "react";
import type { SkuListItem } from "@/lib/sku-master/types";
import type { ProductCategory } from "@/generated/prisma/client";
import { SkuTable } from "./sku-table";
import { SkuConventionCard } from "./sku-convention-card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

type CategoryFilter = ProductCategory | "all";

export function SkuMasterShell({ skus }: { skus: SkuListItem[] }) {
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        let result = skus;

        if (categoryFilter !== "all") {
            result = result.filter((s) => s.productCategory === categoryFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (s) =>
                    s.sku.toLowerCase().includes(q) ||
                    s.productDescription.toLowerCase().includes(q) ||
                    s.notes?.toLowerCase().includes(q),
            );
        }

        return result;
    }, [skus, categoryFilter, search]);

    return (
        <Tabs defaultValue="catalog" className="space-y-4">
            <TabsList>
                <TabsTrigger value="catalog">Catalog ({skus.length})</TabsTrigger>
                <TabsTrigger value="convention">SKU Convention</TabsTrigger>
            </TabsList>

            <TabsContent value="catalog" className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search SKU, description..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); }}
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={categoryFilter}
                        onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}
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
                </div>
                <p className="text-xs text-muted-foreground tabular-nums">
                    {filtered.length} SKU{filtered.length !== 1 ? "s" : ""}
                </p>
                <SkuTable skus={filtered} />
            </TabsContent>

            <TabsContent value="convention">
                <SkuConventionCard />
            </TabsContent>
        </Tabs>
    );
}
