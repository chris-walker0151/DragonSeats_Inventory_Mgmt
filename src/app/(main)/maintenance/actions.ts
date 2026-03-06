"use server";

import { revalidatePath } from "next/cache";
import { fetchMaintenanceDetail, updateMaintenanceInfo } from "@/lib/maintenance/queries";
import type { MaintenanceAssetDetail } from "@/lib/maintenance/types";

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
    await updateMaintenanceInfo(input.id, {
        maintenanceNotes: input.maintenanceNotes,
        lastRefurbishedDate: input.lastRefurbishedDate
            ? new Date(input.lastRefurbishedDate)
            : null,
    });
    revalidatePath("/maintenance");
    revalidatePath("/serialized-assets");
    revalidatePath("/deployments");
    revalidatePath("/");
}
