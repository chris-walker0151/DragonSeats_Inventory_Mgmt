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
import { logActivity, logBulkActivity, diffFields } from "@/lib/activity-log/queries";

/* ── Valid enum values for import validation ── */
const VALID_PRODUCT_CATEGORIES = new Set(["bench", "heater", "ac_unit", "compressor", "cooling_tower", "shader", "hot_box"]);
const VALID_LIFECYCLE_STATUSES = new Set(["ordered", "in_warehouse_available", "in_warehouse_reserved", "deployed_customer", "down", "retired"]);
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
    await logActivity({
        recordId: asset.id,
        collectionName: "serialized-assets",
        summary: `Created asset ${input.serialNumber}`,
    });
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
    });

    await updateSerializedAsset(id, input);

    // Log field-level changes
    if (currentAsset) {
        const changes = diffFields(
            currentAsset as unknown as Record<string, unknown>,
            input as Record<string, unknown>,
        );
        if (changes.length > 0) {
            await logBulkActivity(
                changes.map((c) => ({
                    recordId: id,
                    collectionName: "serialized-assets",
                    summary: `Changed ${c.fieldName} on ${currentAsset.serialNumber}`,
                    fieldChanged: c.fieldName,
                    oldValue: c.oldValue ?? undefined,
                    newValue: c.newValue ?? undefined,
                })),
            );
        }
    }

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
    revalidatePath(`/serialized-assets/${id}`);
    revalidatePath("/maintenance");
    revalidatePath("/dashboard");
    revalidatePath("/service-tickets");
}

/**
 * Batch update multiple assets based on a selected action.
 */
export type BatchAction = "reserve" | "deploy" | "return" | "service" | "transfer" | "refurbish";

export interface BatchActionInput {
    assetIds: string[];
    action: BatchAction;
    // Reserve & Transfer fields
    customerId?: string;
    startDate?: string;
    gameType?: string;
    // Deploy fields
    pickupDate?: string;
    transportVendor?: string;
    // Return fields
    returnLocation?: WarehouseLocation;
    condition?: string;
    // Service fields
    notes?: string;
    // Refurbish fields
    manufacturer?: string;
    returnDate?: string;
}

export async function batchUpdateAssetsAction(input: BatchActionInput) {
    const { assetIds, action } = input;

    if (assetIds.length === 0) {
        throw new Error("No assets selected");
    }

    let updatedCount = 0;

    switch (action) {
        case "reserve": {
            if (!input.customerId) throw new Error("Customer is required");
            if (!input.startDate) throw new Error("Start date is required");
            if (!input.gameType) throw new Error("Away/Home is required");

            const customer = await prisma.customer.findUnique({
                where: { id: input.customerId },
                select: { teamName: true },
            });
            if (!customer) throw new Error("Customer not found");

            for (const assetId of assetIds) {
                await prisma.$transaction(async (tx) => {
                    await tx.serializedAsset.update({
                        where: { id: assetId },
                        data: {
                            lifecycleStatus: "in_warehouse_reserved",
                            customerId: input.customerId,
                            deployedLocationName: `Reserved - ${customer.teamName}`,
                        },
                    });
                    await tx.deployment.create({
                        data: {
                            assetId,
                            customerId: input.customerId!,
                            deploymentDate: new Date(input.startDate!),
                            gameType: input.gameType as "home" | "away",
                        },
                    });
                });

                // Auto-create pickup order service ticket
                const asset = await prisma.serializedAsset.findUnique({
                    where: { id: assetId },
                    select: { currentLocation: true },
                });
                if (asset) {
                    await createServiceTicket({
                        assetId,
                        hub: asset.currentLocation,
                        problemCategory: "pickup_order",
                        priority: "medium",
                        detailedNotes: null,
                        dateDownStarted: null,
                    });
                }
                updatedCount++;
            }
            break;
        }

        case "deploy": {
            if (!input.pickupDate) throw new Error("Pick-up date is required");
            if (!input.transportVendor?.trim()) throw new Error("Transport vendor is required");

            for (const assetId of assetIds) {
                await prisma.$transaction(async (tx) => {
                    await tx.serializedAsset.update({
                        where: { id: assetId },
                        data: {
                            lifecycleStatus: "deployed_customer",
                            currentLocation: "deployed_customer",
                        },
                    });

                    // Find the active deployment to update with transport vendor
                    const activeDeployment = await tx.deployment.findFirst({
                        where: { assetId, actualReturnDate: null },
                        orderBy: { deploymentDate: "desc" },
                    });

                    if (activeDeployment) {
                        await tx.deployment.update({
                            where: { id: activeDeployment.id },
                            data: { transportVendor: input.transportVendor!.trim() },
                        });
                    }
                });
                updatedCount++;
            }
            break;
        }

        case "return": {
            if (!input.returnLocation) throw new Error("Return warehouse is required");
            if (!input.condition?.trim()) throw new Error("Condition is required");

            for (const assetId of assetIds) {
                await prisma.$transaction(async (tx) => {
                    await tx.serializedAsset.update({
                        where: { id: assetId },
                        data: {
                            lifecycleStatus: "in_warehouse_available",
                            currentLocation: input.returnLocation,
                            condition: input.condition!.trim(),
                            customerId: null,
                            deployedLocationName: null,
                        },
                    });

                    // Close active deployment if one exists
                    const activeDeployment = await tx.deployment.findFirst({
                        where: { assetId, actualReturnDate: null },
                        orderBy: { deploymentDate: "desc" },
                    });

                    if (activeDeployment) {
                        await tx.deployment.update({
                            where: { id: activeDeployment.id },
                            data: { actualReturnDate: new Date() },
                        });
                    }
                });
                updatedCount++;
            }
            break;
        }

        case "service": {
            if (!input.condition?.trim()) throw new Error("Condition is required");

            for (const assetId of assetIds) {
                const asset = await prisma.serializedAsset.update({
                    where: { id: assetId },
                    data: {
                        lifecycleStatus: "down",
                        condition: input.condition.trim(),
                        maintenanceNotes: input.notes?.trim() || undefined,
                    },
                });

                await createServiceTicket({
                    assetId,
                    hub: asset.currentLocation,
                    problemCategory: "damage",
                    priority: "high",
                    detailedNotes: input.notes?.trim() || null,
                    dateDownStarted: null,
                });
                updatedCount++;
            }
            break;
        }

        case "transfer": {
            if (!input.customerId) throw new Error("Customer is required");
            if (!input.startDate) throw new Error("Start date is required");
            if (!input.gameType) throw new Error("Away/Home is required");

            const transferCustomer = await prisma.customer.findUnique({
                where: { id: input.customerId },
                select: { teamName: true },
            });
            if (!transferCustomer) throw new Error("Customer not found");

            for (const assetId of assetIds) {
                await prisma.$transaction(async (tx) => {
                    await tx.serializedAsset.update({
                        where: { id: assetId },
                        data: {
                            customerId: input.customerId,
                            deployedLocationName: transferCustomer.teamName,
                        },
                    });

                    // Close current deployment if one exists
                    const activeDeployment = await tx.deployment.findFirst({
                        where: { assetId, actualReturnDate: null },
                        orderBy: { deploymentDate: "desc" },
                    });

                    if (activeDeployment) {
                        await tx.deployment.update({
                            where: { id: activeDeployment.id },
                            data: { actualReturnDate: new Date() },
                        });
                    }

                    // Create new deployment for the transfer
                    await tx.deployment.create({
                        data: {
                            assetId,
                            customerId: input.customerId!,
                            deploymentDate: new Date(input.startDate!),
                            gameType: input.gameType as "home" | "away",
                        },
                    });
                });
                updatedCount++;
            }
            break;
        }

        case "refurbish": {
            if (!input.manufacturer?.trim()) throw new Error("Manufacturer is required");
            if (!input.returnDate) throw new Error("Return date is required");

            for (const assetId of assetIds) {
                const asset = await prisma.serializedAsset.findUnique({
                    where: { id: assetId },
                    select: { currentLocation: true },
                });

                if (asset) {
                    await createServiceTicket({
                        assetId,
                        hub: asset.currentLocation,
                        problemCategory: "refurbishment",
                        priority: "medium",
                        detailedNotes: `Manufacturer: ${input.manufacturer.trim()}`,
                        targetCompletionDate: input.returnDate,
                        dateDownStarted: null,
                    });
                }
                updatedCount++;
            }
            break;
        }
    }

    // Log batch action
    if (updatedCount > 0) {
        await logBulkActivity(
            assetIds.slice(0, updatedCount).map((assetId) => ({
                recordId: assetId,
                collectionName: "serialized-assets",
                method: "Manual / Web",
                summary: `Batch ${action}: ${updatedCount} asset(s)`,
            })),
        );
    }

    revalidatePath("/serialized-assets");
    revalidatePath("/deployments");
    revalidatePath("/dashboard");
    revalidatePath("/service-tickets");

    return { updated: updatedCount };
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

            const afterRecord = await prisma.serializedAsset.findUnique({
                where: { serialNumber },
                select: { id: true },
            });

            if (before) {
                updated++;
                if (afterRecord) {
                    await logActivity({
                        recordId: afterRecord.id,
                        collectionName: "serialized-assets",
                        method: "Import",
                        summary: `Updated asset ${serialNumber} via import`,
                    });
                }
            } else {
                created++;
                if (afterRecord) {
                    await logActivity({
                        recordId: afterRecord.id,
                        collectionName: "serialized-assets",
                        method: "Import",
                        summary: `Created asset ${serialNumber} via import`,
                    });
                }
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
