/**
 * Server-side Prisma queries for the SKU Master page.
 * These run in server components and server actions only.
 */

import { prisma } from "@/lib/db";
import type { SkuListItem } from "./types";

/**
 * Fetch all SKUs with count of linked serialized assets.
 */
export async function fetchSkuList(): Promise<SkuListItem[]> {
    const skus = await prisma.skuMaster.findMany({
        include: {
            _count: {
                select: { serializedAssets: true },
            },
        },
        orderBy: { sku: "asc" },
    });

    return skus.map((s) => ({
        id: s.id,
        sku: s.sku,
        productCategory: s.productCategory,
        productDescription: s.productDescription,
        isSerialized: s.isSerialized,
        notes: s.notes,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        assetCount: s._count.serializedAssets,
    }));
}
