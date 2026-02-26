/**
 * Server-side Prisma queries for the Quantity Inventory page.
 * These run in server components and server actions only.
 */

import { prisma } from "@/lib/db";
import type { WarehouseLocation } from "@/generated/prisma/client";
import type { QuantityInventoryListItem } from "./types";

export interface QuantityItemCreateInput {
    itemCategory: string;
    itemVariant?: string | null;
    location: WarehouseLocation;
    quantityOnHand: number;
    reorderLevel?: number;
    responsiblePerson?: string | null;
}

export type QuantityItemUpdateInput = Partial<QuantityItemCreateInput>;

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

/**
 * Fetch a single quantity inventory item by ID.
 */
export async function fetchQuantityItemDetail(id: string): Promise<QuantityInventoryListItem | null> {
    const item = await prisma.quantityInventory.findUnique({ where: { id } });
    if (!item) return null;
    return {
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
    };
}

/**
 * Create a new quantity inventory item.
 */
export async function createQuantityItem(input: QuantityItemCreateInput) {
    return prisma.quantityInventory.create({ data: input });
}

/**
 * Update an existing quantity inventory item.
 */
export async function updateQuantityItem(id: string, input: QuantityItemUpdateInput) {
    return prisma.quantityInventory.update({ where: { id }, data: input });
}
