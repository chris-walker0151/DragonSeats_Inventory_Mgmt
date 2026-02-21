/**
 * TypeScript types for the Transfers page.
 * Mirrors database schema for transfers table.
 */

import type {
    WarehouseLocation,
    TransferStatus,
    ProductCategory,
} from "@/generated/prisma/client";

export interface TransferListItem {
    id: string;
    assetId: string | null;
    itemId: string | null;
    quantity: number | null;
    originLocation: WarehouseLocation;
    destinationLocation: WarehouseLocation;
    transferDate: Date;
    transferInitiatedBy: string | null;
    transferReceivedBy: string | null;
    transferStatus: TransferStatus;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    assetSerialNumber: string | null;
    assetProductCategory: ProductCategory | null;
    quantityItemCategory: string | null;
}
