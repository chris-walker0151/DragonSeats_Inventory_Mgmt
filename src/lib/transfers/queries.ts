/**
 * Server-side Prisma queries for the Transfers page.
 * These run in server components and server actions only.
 */

import { prisma } from "@/lib/db";
import type { TransferListItem } from "./types";

/**
 * Fetch all transfers with related asset and quantity item info.
 */
export async function fetchTransfersList(): Promise<TransferListItem[]> {
    const transfers = await prisma.transfer.findMany({
        include: {
            asset: {
                select: {
                    serialNumber: true,
                    productCategory: true,
                },
            },
            quantityItem: {
                select: {
                    itemCategory: true,
                },
            },
        },
        orderBy: { transferDate: "desc" },
    });

    return transfers.map((t) => ({
        id: t.id,
        assetId: t.assetId,
        itemId: t.itemId,
        quantity: t.quantity,
        originLocation: t.originLocation,
        destinationLocation: t.destinationLocation,
        transferDate: t.transferDate,
        transferInitiatedBy: t.transferInitiatedBy,
        transferReceivedBy: t.transferReceivedBy,
        transferStatus: t.transferStatus,
        notes: t.notes,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        assetSerialNumber: t.asset?.serialNumber ?? null,
        assetProductCategory: t.asset?.productCategory ?? null,
        quantityItemCategory: t.quantityItem?.itemCategory ?? null,
    }));
}
