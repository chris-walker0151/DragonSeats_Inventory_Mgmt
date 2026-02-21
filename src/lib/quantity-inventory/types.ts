/**
 * TypeScript types for the Quantity Inventory page.
 * Mirrors database schema for quantity_inventory table.
 */

import type { WarehouseLocation } from "@/generated/prisma";

export type LocationFilter = WarehouseLocation | "all";

export interface QuantityInventoryListItem {
    id: string;
    itemCategory: string;
    itemVariant: string | null;
    location: WarehouseLocation;
    quantityOnHand: number;
    reorderLevel: number;
    lastCountDate: Date | null;
    responsiblePerson: string | null;
    createdAt: Date;
    updatedAt: Date;
}
