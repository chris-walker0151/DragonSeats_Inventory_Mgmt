"use server";

import { revalidatePath } from "next/cache";
import type { WarehouseLocation } from "@/generated/prisma/client";
import {
    createTransfer,
    updateTransferStatus,
    fetchAssetsForTransfer,
    fetchQuantityItemsForTransfer,
} from "@/lib/transfers/queries";

export async function createTransferAction(input: {
    assetId?: string | null;
    itemId?: string | null;
    quantity?: number | null;
    originLocation: WarehouseLocation;
    destinationLocation: WarehouseLocation;
    transferDate: string;
    transferInitiatedBy?: string | null;
    notes?: string | null;
}) {
    if (input.originLocation === input.destinationLocation) {
        throw new Error("Origin and destination must be different");
    }

    await createTransfer({
        ...input,
        transferDate: new Date(input.transferDate),
    });

    revalidatePath("/transfers");
    revalidatePath("/serialized-assets");
    revalidatePath("/quantity-inventory");
    revalidatePath("/dashboard");
}

export async function updateTransferStatusAction(input: {
    id: string;
    status: "in_transit" | "received" | "cancelled";
    receivedBy?: string | null;
}) {
    await updateTransferStatus(input.id, input.status, input.receivedBy);

    revalidatePath("/transfers");
    revalidatePath("/serialized-assets");
    revalidatePath("/quantity-inventory");
    revalidatePath("/dashboard");
}

export async function searchAssetsAction(search: string) {
    return fetchAssetsForTransfer(search);
}

export async function fetchQuantityItemsAction() {
    return fetchQuantityItemsForTransfer();
}
