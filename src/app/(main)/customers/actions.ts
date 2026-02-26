"use server";

import { revalidatePath } from "next/cache";
import { fetchCustomerDetail, createCustomer, updateCustomer } from "@/lib/customers/queries";
import type { CustomerCreateInput, CustomerUpdateInput } from "@/lib/customers/queries";
import type { CustomerDetail } from "@/lib/customers/types";
import type { ImportResult } from "@/lib/import/types";
import { prisma } from "@/lib/db";

/**
 * Server action to fetch a single customer detail.
 * Called from the detail sheet when a table row is clicked.
 */
export async function fetchCustomerDetailAction(
    id: string,
): Promise<CustomerDetail | null> {
    return fetchCustomerDetail(id);
}

/**
 * Create a new customer.
 */
export async function createCustomerAction(input: CustomerCreateInput): Promise<{ id: string }> {
    const customer = await createCustomer(input);
    revalidatePath("/customers");
    revalidatePath("/dashboard");
    return { id: customer.id };
}

/**
 * Update an existing customer.
 */
export async function updateCustomerAction(id: string, input: CustomerUpdateInput) {
    await updateCustomer(id, input);
    revalidatePath("/customers");
    revalidatePath("/dashboard");
}

/**
 * Import customers from a spreadsheet.
 * Upserts by teamName.
 */
export async function importCustomersAction(
    rows: Record<string, unknown>[],
): Promise<ImportResult> {
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: ImportResult["errors"] = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
            const teamName = String(row.teamName ?? "").trim();
            if (!teamName) {
                errors.push({ row: i + 1, column: "Team Name", message: "Missing team name" });
                skipped++;
                continue;
            }

            const data = {
                league: String(row.league ?? "other").toLowerCase().trim() as never,
                organizationLegalName: String(row.organizationLegalName ?? teamName),
                contractType: String(row.contractType ?? "seasonal_rental").toLowerCase().trim() as never,
                primaryContactName: row.primaryContactName ? String(row.primaryContactName) : null,
                primaryContactEmail: row.primaryContactEmail ? String(row.primaryContactEmail) : null,
                primaryContactPhone: row.primaryContactPhone ? String(row.primaryContactPhone) : null,
                stadiumName: row.stadiumName ? String(row.stadiumName) : null,
                stadiumAddress: row.stadiumAddress ? String(row.stadiumAddress) : null,
                activeStatus: row.activeStatus
                    ? (String(row.activeStatus).toLowerCase().trim() as never)
                    : ("active" as never),
            };

            const existing = await prisma.customer.findFirst({
                where: { teamName: { equals: teamName, mode: "insensitive" } },
            });

            if (existing) {
                await prisma.customer.update({
                    where: { id: existing.id },
                    data,
                });
                updated++;
            } else {
                await prisma.customer.create({
                    data: { teamName, ...data },
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

    revalidatePath("/customers");
    revalidatePath("/dashboard");

    return { created, updated, skipped, errors };
}
