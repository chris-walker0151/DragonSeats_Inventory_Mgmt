"use server";

import { revalidatePath } from "next/cache";
import { fetchMaintenanceDetail, updateMaintenanceInfo } from "@/lib/maintenance/queries";
import type { MaintenanceAssetDetail } from "@/lib/maintenance/types";
import { logActivity } from "@/lib/activity-log/queries";
import { prisma } from "@/lib/db";

export async function fetchMaintenanceDetailAction(
    id: string,
): Promise<MaintenanceAssetDetail | null> {
    return fetchMaintenanceDetail(id);
}

export async function updateMaintenanceInfoAction(input: {
    id: string;
    maintenanceNotes: string | null;
    lastRefurbishedDate: string | null;
}) {
    const before = await prisma.serializedAsset.findUnique({
        where: { id: input.id },
        select: { serialNumber: true, maintenanceNotes: true, lastRefurbishedDate: true },
    });

    await updateMaintenanceInfo(input.id, {
        maintenanceNotes: input.maintenanceNotes,
        lastRefurbishedDate: input.lastRefurbishedDate
            ? new Date(input.lastRefurbishedDate)
            : null,
    });

    if (before) {
        await logActivity({
            recordId: input.id,
            collectionName: "serialized-assets",
            summary: `Updated maintenance info on ${before.serialNumber}`,
        });
    }

    revalidatePath("/maintenance");
    revalidatePath("/serialized-assets");
    revalidatePath("/deployments");
    revalidatePath("/");
}
