/**
 * Server-side Prisma queries for the Transfers page.
 * These run in server components and server actions only.
 */

import { prisma } from "@/lib/db";
import type { WarehouseLocation } from "@/generated/prisma/client";
import type { TransferListItem } from "./types";

/* ── Create / Update ────────────────────────────────────────────────────────── */

export interface TransferCreateInput {
    assetId?: string | null;
    itemId?: string | null;
    quantity?: number | null;
    originLocation: WarehouseLocation;
    destinationLocation: WarehouseLocation;
    transferDate: Date;
    transferInitiatedBy?: string | null;
    notes?: string | null;
}

export async function createTransfer(input: TransferCreateInput) {
    return prisma.transfer.create({
        data: {
            assetId: input.assetId ?? null,
            itemId: input.itemId ?? null,
            quantity: input.quantity ?? null,
            originLocation: input.originLocation,
            destinationLocation: input.destinationLocation,
            transferDate: input.transferDate,
            transferInitiatedBy: input.transferInitiatedBy ?? null,
            transferStatus: "initiated",
            notes: input.notes ?? null,
        },
    });
}

export async function updateTransferStatus(
    id: string,
    status: "in_transit" | "received" | "cancelled",
    receivedBy?: string | null,
) {
    const transfer = await prisma.transfer.update({
        where: { id },
        data: {
            transferStatus: status,
            transferReceivedBy: status === "received" ? (receivedBy ?? null) : undefined,
        },
        include: { asset: { select: { id: true } } },
    });

    // When received, update the asset's warehouse location
    if (status === "received" && transfer.asset) {
        await prisma.serializedAsset.update({
            where: { id: transfer.asset.id },
            data: { currentLocation: transfer.destinationLocation },
        });
    }

    return transfer;
}

/* ── Lookups for transfer creation form ──────────────────────────────────────── */

export async function fetchAssetsForTransfer(search: string) {
    if (!search.trim()) return [];
    return prisma.serializedAsset.findMany({
        where: {
            serialNumber: { contains: search.trim(), mode: "insensitive" },
            lifecycleStatus: { not: "retired" },
        },
        select: {
            id: true,
            serialNumber: true,
            productCategory: true,
            currentLocation: true,
        },
        take: 10,
        orderBy: { serialNumber: "asc" },
    });
}

export async function fetchQuantityItemsForTransfer() {
    return prisma.quantityInventory.findMany({
        select: {
            id: true,
            itemCategory: true,
            itemVariant: true,
            location: true,
            quantityOnHand: true,
        },
        orderBy: [{ itemCategory: "asc" }, { location: "asc" }],
    });
}

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
