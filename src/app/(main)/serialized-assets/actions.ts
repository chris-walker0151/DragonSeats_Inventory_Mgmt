"use server";

import { revalidatePath } from "next/cache";
import type { WarehouseLocation } from "@/generated/prisma/client";
import {
    fetchSerializedAssetDetail,
    deployAsset,
    returnAsset,
    fetchActiveCustomersList,
} from "@/lib/serialized-assets/queries";
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
 * Import serialized assets from a spreadsheet.
 * Upserts by serialNumber. Resolves customerName → customerId and SKU code → skuId.
 */
export async function importSerializedAssetsAction(
    rows: Record<string, unknown>[],
): Promise<ImportResult> {
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: ImportResult["errors"] = [];

    // Pre-fetch customer and SKU lookups
    const customers = await prisma.customer.findMany({ select: { id: true, teamName: true } });
    const customerMap = new Map(customers.map((c) => [c.teamName.toLowerCase(), c.id]));

    const skus = await prisma.skuMaster.findMany({ select: { id: true, sku: true } });
    const skuMap = new Map(skus.map((s) => [s.sku.toLowerCase(), s.id]));

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
            const serialNumber = String(row.serialNumber ?? "").trim();
            if (!serialNumber) {
                errors.push({ row: i + 1, column: "Serial Number", message: "Missing serial number" });
                skipped++;
                continue;
            }

            // Resolve customer name to ID
            let customerId: string | null = null;
            if (row.customerName) {
                const key = String(row.customerName).toLowerCase().trim();
                customerId = customerMap.get(key) ?? null;
            }

            // Resolve SKU code to ID
            let skuId: string | null = null;
            if (row.skuCode) {
                const key = String(row.skuCode).toLowerCase().trim();
                skuId = skuMap.get(key) ?? null;
            }

            const data = {
                productCategory: String(row.productCategory ?? "bench").toLowerCase().trim() as never,
                productTypeModel: row.productTypeModel ? String(row.productTypeModel) : null,
                lifecycleStatus: row.lifecycleStatus
                    ? (String(row.lifecycleStatus).toLowerCase().trim() as never)
                    : ("in_warehouse_available" as never),
                currentLocation: String(row.currentLocation ?? "cleveland_warehouse").toLowerCase().trim() as never,
                customerId,
                skuId,
                yearManufactured: row.yearManufactured ? Number(row.yearManufactured) : null,
                manufacturer: row.manufacturer ? String(row.manufacturer) : null,
                notes: row.notes ? String(row.notes) : null,
                benchType: row.benchType ? String(row.benchType) : null,
                flangeOrDiffuser: row.flangeOrDiffuser ? String(row.flangeOrDiffuser) : null,
                wheelType: row.wheelType ? String(row.wheelType) : null,
                brandingStatus: row.brandingStatus
                    ? (String(row.brandingStatus).toLowerCase().trim() as never)
                    : null,
                heaterType: row.heaterType ? String(row.heaterType) : null,
                btuLevel: row.btuLevel ? String(row.btuLevel) : null,
                btuRating: row.btuRating ? Number(row.btuRating) : null,
                amps: row.amps ? Number(row.amps) : null,
                maintenanceNotes: row.maintenanceNotes ? String(row.maintenanceNotes) : null,
                lastRefurbishedDate: row.lastRefurbishedDate
                    ? new Date(String(row.lastRefurbishedDate))
                    : null,
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
