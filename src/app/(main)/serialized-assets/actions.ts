"use server";

import { revalidatePath } from "next/cache";
import type { WarehouseLocation } from "@/generated/prisma/client";
import {
    fetchSerializedAssetDetail,
    deployAsset,
    returnAsset,
    fetchActiveCustomersList,
    createSerializedAsset,
    updateSerializedAsset,
} from "@/lib/serialized-assets/queries";
import type { AssetCreateInput, AssetUpdateInput } from "@/lib/serialized-assets/queries";
import type { SerializedAssetDetail } from "@/lib/serialized-assets/types";
import type { ImportResult } from "@/lib/import/types";
import { prisma } from "@/lib/db";

/**
 * Server action to fetch a single serialized asset detail.
 */
export async function fetchAssetDetail(
    id: string,
): Promise<SerializedAssetDetail | null> {
    return fetchSerializedAssetDetail(id);
}

/**
 * Deploy an asset to a customer.
 */
export async function deployAssetAction(input: {
    assetId: string;
    customerId: string;
    deploymentDate: string;
    expectedReturnDate?: string;
    notes?: string;
}) {
    await deployAsset(input);
    revalidatePath("/serialized-assets");
    revalidatePath("/deployments");
    revalidatePath("/dashboard");
}

/**
 * Return an asset from a customer to a warehouse.
 */
export async function returnAssetAction(input: {
    assetId: string;
    returnLocation: WarehouseLocation;
}) {
    await returnAsset(input);
    revalidatePath("/serialized-assets");
    revalidatePath("/deployments");
    revalidatePath("/dashboard");
}

/**
 * Fetch active customers for the deploy dropdown.
 */
export async function fetchActiveCustomersAction() {
    return fetchActiveCustomersList();
}

/**
 * Create a new serialized asset.
 */
export async function createAssetAction(input: AssetCreateInput): Promise<{ id: string }> {
    const asset = await createSerializedAsset(input);
    revalidatePath("/serialized-assets");
    revalidatePath("/maintenance");
    revalidatePath("/dashboard");
    return { id: asset.id };
}

/**
 * Update an existing serialized asset.
 */
export async function updateAssetAction(id: string, input: AssetUpdateInput) {
    await updateSerializedAsset(id, input);
    revalidatePath("/serialized-assets");
    revalidatePath("/maintenance");
    revalidatePath("/dashboard");
}

/** Map a free-text location string to a warehouse enum + deployed location name. */
function resolveLocation(raw: unknown): {
    currentLocation: "cleveland_warehouse" | "kansas_city_warehouse" | "jacksonville_warehouse" | "deployed_customer";
    lifecycleStatus: "in_warehouse_available" | "deployed_customer";
    deployedLocationName: string | null;
} {
    const loc = String(raw ?? "").trim().toLowerCase();
    if (loc.includes("cleveland")) {
        return { currentLocation: "cleveland_warehouse", lifecycleStatus: "in_warehouse_available", deployedLocationName: null };
    }
    if (loc.includes("kansas")) {
        return { currentLocation: "kansas_city_warehouse", lifecycleStatus: "in_warehouse_available", deployedLocationName: null };
    }
    if (loc.includes("jacksonville")) {
        return { currentLocation: "jacksonville_warehouse", lifecycleStatus: "in_warehouse_available", deployedLocationName: null };
    }
    // Any other location is treated as deployed
    return {
        currentLocation: "deployed_customer",
        lifecycleStatus: "deployed_customer",
        deployedLocationName: String(raw ?? "").trim() || null,
    };
}

/**
 * Import serialized assets from a spreadsheet.
 * Upserts by serialNumber (Asset Number). Maps free-text Warehouse Location
 * to currentLocation enum + deployedLocationName.
 */
export async function importSerializedAssetsAction(
    rows: Record<string, unknown>[],
): Promise<ImportResult> {
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: ImportResult["errors"] = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
            const serialNumber = String(row.serialNumber ?? "").trim();
            if (!serialNumber) {
                errors.push({ row: i + 1, column: "Asset Number", message: "Missing asset number" });
                skipped++;
                continue;
            }

            const { currentLocation, lifecycleStatus, deployedLocationName } =
                resolveLocation(row.warehouseLocation);

            const data = {
                productCategory: "bench" as never,
                productTypeModel: row.productTypeModel ? String(row.productTypeModel).trim() : null,
                lifecycleStatus: lifecycleStatus as never,
                currentLocation: currentLocation as never,
                deployedLocationName,
                manufacturer: row.manufacturer ? String(row.manufacturer).trim() : null,
                dsPlateNumber: row.dsPlateNumber ? String(row.dsPlateNumber).trim() : null,
                condition: row.condition ? String(row.condition).trim() : null,
                benchStatus: row.benchStatus ? String(row.benchStatus).trim() : null,
                manifoldStyle: row.manifoldStyle ? String(row.manifoldStyle).trim() : null,
                deckType: row.deckType ? String(row.deckType).trim() : null,
                seatType: row.seatType ? String(row.seatType).trim() : null,
                wheelType: row.wheelType ? String(row.wheelType).trim() : null,
                compressorHoles: row.compressorHoles ? String(row.compressorHoles).trim() : null,
                acHoles: row.acHoles ? String(row.acHoles).trim() : null,
                notes: row.notes ? String(row.notes).trim() : null,
                teamAllocated2024: row.teamAllocated2024 ? String(row.teamAllocated2024).trim() : null,
                teamAllocated2025: row.teamAllocated2025 ? String(row.teamAllocated2025).trim() : null,
            };

            const existing = await prisma.serializedAsset.findFirst({
                where: { serialNumber },
            });

            if (existing) {
                await prisma.serializedAsset.update({
                    where: { id: existing.id },
                    data,
                });
                updated++;
            } else {
                await prisma.serializedAsset.create({
                    data: { serialNumber, ...data },
                });
                created++;
            }
        } catch (err) {
            errors.push({
                row: i + 1,
                column: "",
                message: err instanceof Error ? err.message : "Unknown error",
            });
            skipped++;
        }
    }

    revalidatePath("/serialized-assets");
    revalidatePath("/maintenance");
    revalidatePath("/dashboard");

    return { created, updated, skipped, errors };
}
