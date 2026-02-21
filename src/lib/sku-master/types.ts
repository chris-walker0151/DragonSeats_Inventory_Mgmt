/**
 * TypeScript types for the SKU Master page.
 * Mirrors database schema for sku_master table.
 */

import type { ProductCategory } from "@/generated/prisma/client";

export interface SkuListItem {
    id: string;
    sku: string;
    productCategory: ProductCategory;
    productDescription: string;
    isSerialized: boolean;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    assetCount: number;
}
