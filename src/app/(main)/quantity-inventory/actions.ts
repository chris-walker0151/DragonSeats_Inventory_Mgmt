"use server";

import { revalidatePath } from "next/cache";
import type { ImportResult } from "@/lib/import/types";
import { prisma } from "@/lib/db";

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

            const itemVariant = row.itemVariant ? String(row.itemVariant).trim() : null;

            const data = {
                location: location as never,
                quantityOnHand: row.quantityOnHand ? Number(row.quantityOnHand) : 0,
                reorderLevel: row.reorderLevel ? Number(row.reorderLevel) : 0,
                responsiblePerson: row.responsiblePerson ? String(row.responsiblePerson) : null,
            };

            const existing = await prisma.quantityInventory.findFirst({
                where: {
                    itemCategory,
                    itemVariant: itemVariant ?? undefined,
                    location: location as never,
                },
            });

            if (existing) {
                await prisma.quantityInventory.update({
                    where: { id: existing.id },
                    data,
                });
                updated++;
            } else {
                await prisma.quantityInventory.create({
                    data: { itemCategory, itemVariant, ...data },
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

    revalidatePath("/quantity-inventory");
    revalidatePath("/dashboard");

    return { created, updated, skipped, errors };
}
