"use server";

import { revalidatePath } from "next/cache";
import type { ImportResult } from "@/lib/import/types";
import type { QuantityInventoryListItem } from "@/lib/quantity-inventory/types";
import {
    fetchQuantityItemDetail,
    createQuantityItem,
    updateQuantityItem,
} from "@/lib/quantity-inventory/queries";
import type { QuantityItemCreateInput, QuantityItemUpdateInput } from "@/lib/quantity-inventory/queries";
import { prisma } from "@/lib/db";

/* ── Valid enum values for import validation ── */
const VALID_WAREHOUSE_LOCATIONS = new Set(["cleveland_warehouse", "kansas_city_warehouse", "jacksonville_warehouse", "deployed_customer"]);

/**
 * Fetch a single quantity inventory item detail.
 */
export async function fetchQuantityItemAction(id: string): Promise<QuantityInventoryListItem | null> {
    return fetchQuantityItemDetail(id);
}

/**
 * Create a new quantity inventory item.
 */
export async function createQuantityItemAction(input: QuantityItemCreateInput): Promise<{ id: string }> {
    const item = await createQuantityItem(input);
    revalidatePath("/quantity-inventory");
    revalidatePath("/dashboard");
    return { id: item.id };
}

/**
 * Update an existing quantity inventory item.
 */
export async function updateQuantityItemAction(id: string, input: QuantityItemUpdateInput) {
    await updateQuantityItem(id, input);
    revalidatePath("/quantity-inventory");
    revalidatePath("/dashboard");
}

/**
 * Import quantity inventory items from a spreadsheet.
 * Upserts by (itemCategory + itemVariant + location).
 */
export async function importQuantityInventoryAction(
    rows: Record<string, unknown>[],
): Promise<ImportResult> {
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: ImportResult["errors"] = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
            const itemCategory = String(row.itemCategory ?? "").trim();
            const location = String(row.location ?? "").toLowerCase().trim();

            if (!itemCategory || !location) {
                errors.push({
                    row: i + 1,
                    column: !itemCategory ? "Item Category" : "Location",
                    message: `Missing ${!itemCategory ? "item category" : "location"}`,
                });
                skipped++;
                continue;
            }

            if (!VALID_WAREHOUSE_LOCATIONS.has(location)) {
                errors.push({ row: i + 1, column: "location", message: `Invalid location: "${location}". Valid: ${[...VALID_WAREHOUSE_LOCATIONS].join(", ")}` });
                skipped++;
                continue;
            }

            const itemVariant = row.itemVariant ? String(row.itemVariant).trim() : null;

            const quantityOnHand = row.quantityOnHand ? Number(row.quantityOnHand) : 0;
            const reorderLevel = row.reorderLevel ? Number(row.reorderLevel) : 0;
            const responsiblePerson = row.responsiblePerson ? String(row.responsiblePerson) : null;
            const lastCountDate = row.lastCountDate ? new Date(String(row.lastCountDate)) : null;

            const uniqueKey = {
                itemCategory_itemVariant_location: {
                    itemCategory,
                    itemVariant: itemVariant ?? "",
                    location: location as never,
                },
            };

            const before = await prisma.quantityInventory.findUnique({
                where: uniqueKey,
                select: { id: true },
            });

            await prisma.quantityInventory.upsert({
                where: uniqueKey,
                update: { quantityOnHand, reorderLevel, lastCountDate, responsiblePerson },
                create: {
                    itemCategory,
                    itemVariant,
                    location: location as never,
                    quantityOnHand,
                    reorderLevel,
                    lastCountDate,
                    responsiblePerson,
                },
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

    revalidatePath("/quantity-inventory");
    revalidatePath("/dashboard");

    return { created, updated, skipped, errors };
}
