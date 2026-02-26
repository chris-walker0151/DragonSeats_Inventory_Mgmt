import { prisma } from "@/lib/db";
import type { MaintenanceListItem, MaintenanceAssetDetail } from "./types";

/**
 * Fetch all serialized assets with maintenance-relevant fields.
 * Queries the same serialized_assets table — no data duplication.
 */
export async function fetchMaintenanceList(): Promise<MaintenanceListItem[]> {
    const assets = await prisma.serializedAsset.findMany({
        include: {
            customer: { select: { teamName: true } },
        },
        orderBy: { yearManufactured: "asc" },
    });

    return assets.map((a) => ({
        id: a.id,
        serialNumber: a.serialNumber,
        productCategory: a.productCategory,
        productTypeModel: a.productTypeModel,
        lifecycleStatus: a.lifecycleStatus,
        currentLocation: a.currentLocation,
        customerName: a.customer?.teamName ?? null,
        yearManufactured: a.yearManufactured,
        dateAcquired: a.dateAcquired,
        lastRefurbishedDate: a.lastRefurbishedDate,
        maintenanceNotes: a.maintenanceNotes,
        manufacturer: a.manufacturer,
    }));
}

/**
 * Fetch detail for a single asset in maintenance context.
 */
export async function fetchMaintenanceDetail(
    id: string,
): Promise<MaintenanceAssetDetail | null> {
    const asset = await prisma.serializedAsset.findUnique({
        where: { id },
        include: {
            customer: { select: { teamName: true } },
        },
    });

    if (!asset) return null;

    return {
        id: asset.id,
        serialNumber: asset.serialNumber,
        productCategory: asset.productCategory,
        productTypeModel: asset.productTypeModel,
        lifecycleStatus: asset.lifecycleStatus,
        currentLocation: asset.currentLocation,
        customerName: asset.customer?.teamName ?? null,
        yearManufactured: asset.yearManufactured,
        dateAcquired: asset.dateAcquired,
        manufacturer: asset.manufacturer,
        lastRefurbishedDate: asset.lastRefurbishedDate,
        maintenanceNotes: asset.maintenanceNotes,
        notes: asset.notes,
    };
}

/**
 * Update maintenance info for an asset.
 */
export async function updateMaintenanceInfo(
    id: string,
    data: {
        maintenanceNotes: string | null;
        lastRefurbishedDate: Date | null;
    },
) {
    return prisma.serializedAsset.update({
        where: { id },
        data: {
            maintenanceNotes: data.maintenanceNotes,
            lastRefurbishedDate: data.lastRefurbishedDate,
        },
    });
}
