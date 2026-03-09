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
import { createServiceTicket } from "@/lib/service-tickets/queries";
import type { SerializedAssetDetail } from "@/lib/serialized-assets/types";
import type { ImportResult } from "@/lib/import/types";
import { prisma } from "@/lib/db";

/* ── Valid enum values for import validation ── */
const VALID_PRODUCT_CATEGORIES = new Set(["bench", "heater", "ac_unit", "compressor", "cooling_tower", "shader", "hot_box"]);
const VALID_LIFECYCLE_STATUSES = new Set(["ordered", "in_warehouse_available", "in_warehouse_reserved", "deployed_customer", "retired"]);
const VALID_WAREHOUSE_LOCATIONS = new Set(["cleveland_warehouse", "kansas_city_warehouse", "jacksonville_warehouse", "deployed_customer"]);
const VALID_BRANDING_STATUSES = new Set(["unbranded", "branded"]);
const VALID_BRANDING_TYPES = new Set(["team", "one_off_event", "other"]);

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
    revalidatePath("/service-tickets");
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
    revalidatePath("/service-tickets");
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
 * Auto-creates a service ticket when condition changes to "Down"
 * or lifecycleStatus changes to "in_warehouse_reserved" (pickup order).
 */
export async function updateAssetAction(id: string, input: AssetUpdateInput) {
    // Fetch current asset state to detect transitions
    const currentAsset = await prisma.serializedAsset.findUnique({
        where: { id },
        select: {
            condition: true,
            lifecycleStatus: true,
            currentLocation: true,
            serialNumber: true,
        },
    });

    await updateSerializedAsset(id, input);

    const inputRecord = input as Record<string, unknown>;

    // Auto-create pickup order ticket when lifecycleStatus changes to reserved
    const newStatus = inputRecord.lifecycleStatus as string | undefined;
    const wasReserved = currentAsset?.lifecycleStatus === "in_warehouse_reserved";
    const isNowReserved = newStatus === "in_warehouse_reserved";

    if (isNowReserved && !wasReserved && currentAsset) {
        await createServiceTicket({
            assetId: id,
            hub: (inputRecord.currentLocation as WarehouseLocation) ?? currentAsset.currentLocation,
            problemCategory: "pickup_order",
            priority: "medium",
            detailedNotes: (inputRecord.notes as string) ?? null,
            dateDownStarted: null,
        });
    }

    // Auto-create service ticket when condition changes to "Down"
    const newCondition = inputRecord.condition as string | undefined;
    const wasDown = currentAsset?.condition?.toLowerCase() === "down";
    const isNowDown = newCondition?.toLowerCase() === "down";

    if (isNowDown && !wasDown && currentAsset) {
        await createServiceTicket({
            assetId: id,
            hub: currentAsset.currentLocation as WarehouseLocation,
            problemCategory: "damage",
            priority: "high",
            detailedNotes: (inputRecord.notes as string) ?? null,
            dateDownStarted: null,
        });
    }

    revalidatePath("/serialized-assets");
    revalidatePath("/maintenance");
    revalidatePath("/dashboard");
    revalidatePath("/service-tickets");
}

/**
 * Batch update multiple assets based on a selected action.
 */
export type BatchAction = "reserve" | "deploy" | "refurbish" | "retire";

export async function batchUpdateAssetsAction(input: {
    assetIds: string[];
    action: BatchAction;
    targetName?: string;
}) {
    const { assetIds, action, targetName } = input;

    if (assetIds.length === 0) {
        throw new Error("No assets selected");
    }

    let data: Record<string, unknown>;

    switch (action) {
        case "reserve":
            if (!targetName?.trim()) throw new Error("Team name is required");
            data = {
                lifecycleStatus: "in_warehouse_reserved",
                deployedLocationName: `Reserved - ${targetName.trim()}`,
            };
            break;
        case "deploy":
            if (!targetName?.trim()) throw new Error("Team name is required");
            data = {
                lifecycleStatus: "deployed_customer",
                currentLocation: "deployed_customer",
                deployedLocationName: targetName.trim(),
            };
            break;
        case "refurbish":
            if (!targetName?.trim()) throw new Error("Manufacturer name is required");
            data = {
                deployedLocationName: `Refurbish - ${targetName.trim()}`,
            };
            break;
        case "retire":
            data = {
                lifecycleStatus: "retired",
                condition: "Retired",
                deployedLocationName: "Retired",
            };
            break;
    }

    await prisma.serializedAsset.updateMany({
        where: { id: { in: assetIds } },
        data,
    });

    revalidatePath("/serialized-assets");
    revalidatePath("/deployments");
    revalidatePath("/dashboard");

    return { updated: assetIds.length };
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

            const productCategory = row.productCategory
                ? String(row.productCategory).toLowerCase().trim()
                : "bench";
            if (!VALID_PRODUCT_CATEGORIES.has(productCategory)) {
                errors.push({ row: i + 1, column: "productCategory", message: `Invalid product category: "${productCategory}". Valid: ${[...VALID_PRODUCT_CATEGORIES].join(", ")}` });
                skipped++;
                continue;
            }

            const { currentLocation, lifecycleStatus, deployedLocationName } =
                resolveLocation(row.warehouseLocation);

            if (!VALID_LIFECYCLE_STATUSES.has(lifecycleStatus)) {
                errors.push({ row: i + 1, column: "lifecycleStatus", message: `Invalid lifecycle status: "${lifecycleStatus}". Valid: ${[...VALID_LIFECYCLE_STATUSES].join(", ")}` });
                skipped++;
                continue;
            }

            if (!VALID_WAREHOUSE_LOCATIONS.has(currentLocation)) {
                errors.push({ row: i + 1, column: "currentLocation", message: `Invalid warehouse location: "${currentLocation}". Valid: ${[...VALID_WAREHOUSE_LOCATIONS].join(", ")}` });
                skipped++;
                continue;
            }

            // Optional branding fields — set to null if invalid rather than skipping the row
            const rawBrandingStatus = row.brandingStatus
                ? String(row.brandingStatus).toLowerCase().trim()
                : null;
            const brandingStatus = rawBrandingStatus && VALID_BRANDING_STATUSES.has(rawBrandingStatus)
                ? rawBrandingStatus
                : null;

            const rawBrandingType = row.brandingType
                ? String(row.brandingType).toLowerCase().trim()
                : null;
            const brandingType = rawBrandingType && VALID_BRANDING_TYPES.has(rawBrandingType)
                ? rawBrandingType
                : null;

            const data = {
                productCategory: productCategory as never,
                productTypeModel: row.productTypeModel ? String(row.productTypeModel).trim() : null,
                lifecycleStatus: lifecycleStatus as never,
                currentLocation: currentLocation as never,
                deployedLocationName,
                brandingStatus: brandingStatus as never,
                brandingType: brandingType as never,
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

            const before = await prisma.serializedAsset.findUnique({
                where: { serialNumber },
                select: { id: true },
            });

            await prisma.serializedAsset.upsert({
                where: { serialNumber },
                update: { ...data },
                create: { serialNumber, ...data },
            });

            if (before) {
                updated++;
            } else {
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
