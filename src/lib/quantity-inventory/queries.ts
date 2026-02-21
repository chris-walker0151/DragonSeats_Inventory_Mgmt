/**
 * Server-side Prisma queries for the Quantity Inventory page.
 * These run in server components and server actions only.
 */

import { prisma } from "@/lib/db";
import type { QuantityInventoryListItem } from "./types";

/**
 * Fetch all quantity inventory items ordered by category then location.
 */
export async function fetchQuantityInventoryList(): Promise<QuantityInventoryListItem[]> {
    const items = await prisma.quantityInventory.findMany({
        orderBy: [
            { itemCategory: "asc" },
            { location: "asc" },
        ],
    });

    return items.map((item) => ({
        id: item.id,
        itemCategory: item.itemCategory,
        itemVariant: item.itemVariant,
        location: item.location,
        quantityOnHand: item.quantityOnHand,
        reorderLevel: item.reorderLevel,
        lastCountDate: item.lastCountDate,
        responsiblePerson: item.responsiblePerson,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
    }));
}
