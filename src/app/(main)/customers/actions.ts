"use server";

import { revalidatePath } from "next/cache";
import { fetchCustomerDetail, createCustomer, updateCustomer } from "@/lib/customers/queries";
import type { CustomerCreateInput, CustomerUpdateInput } from "@/lib/customers/queries";
import type { CustomerDetail } from "@/lib/customers/types";
import type { ImportResult } from "@/lib/import/types";
import { prisma } from "@/lib/db";
import { logActivity, diffFields, logBulkActivity } from "@/lib/activity-log/queries";

/* ── Valid enum values for import validation ── */
const VALID_LEAGUES = new Set(["nfl", "ncaa_fbs", "ncaa_fcs", "other"]);
const VALID_CONTRACT_TYPES = new Set(["seasonal_rental", "multi_year_lease"]);
const VALID_CUSTOMER_STATUSES = new Set(["active", "inactive", "prospect"]);

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
    await logActivity({
        recordId: customer.id,
        collectionName: "customers",
        summary: `Created customer ${input.teamName}`,
    });
    revalidatePath("/customers");
    revalidatePath("/dashboard");
    return { id: customer.id };
}

/**
 * Update an existing customer.
 */
export async function updateCustomerAction(id: string, input: CustomerUpdateInput) {
    const before = await prisma.customer.findUnique({ where: { id } });
    await updateCustomer(id, input);
    if (before) {
        const changes = diffFields(
            before as unknown as Record<string, unknown>,
            input as Record<string, unknown>,
        );
        if (changes.length > 0) {
            await logBulkActivity(
                changes.map((c) => ({
                    recordId: id,
                    collectionName: "customers",
                    summary: `Changed ${c.fieldName} on ${before.teamName}`,
                    fieldChanged: c.fieldName,
                    oldValue: c.oldValue ?? undefined,
                    newValue: c.newValue ?? undefined,
                })),
            );
        }
    }
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

            const league = String(row.league ?? "other").toLowerCase().trim();
            if (!VALID_LEAGUES.has(league)) {
                errors.push({ row: i + 1, column: "league", message: `Invalid league: "${league}". Valid: ${[...VALID_LEAGUES].join(", ")}` });
                skipped++;
                continue;
            }

            const contractType = String(row.contractType ?? "seasonal_rental").toLowerCase().trim();
            if (!VALID_CONTRACT_TYPES.has(contractType)) {
                errors.push({ row: i + 1, column: "contractType", message: `Invalid contract type: "${contractType}". Valid: ${[...VALID_CONTRACT_TYPES].join(", ")}` });
                skipped++;
                continue;
            }

            const activeStatus = row.activeStatus
                ? String(row.activeStatus).toLowerCase().trim()
                : "active";
            if (!VALID_CUSTOMER_STATUSES.has(activeStatus)) {
                errors.push({ row: i + 1, column: "activeStatus", message: `Invalid status: "${activeStatus}". Valid: ${[...VALID_CUSTOMER_STATUSES].join(", ")}` });
                skipped++;
                continue;
            }

            const data = {
                league: league as never,
                organizationLegalName: String(row.organizationLegalName ?? teamName),
                contractType: contractType as never,
                primaryContactName: row.primaryContactName ? String(row.primaryContactName) : null,
                primaryContactEmail: row.primaryContactEmail ? String(row.primaryContactEmail) : null,
                primaryContactPhone: row.primaryContactPhone ? String(row.primaryContactPhone) : null,
                stadiumName: row.stadiumName ? String(row.stadiumName) : null,
                stadiumAddress: row.stadiumAddress ? String(row.stadiumAddress) : null,
                activeStatus: activeStatus as never,
            };

            let wasUpdate = false;
            let recordId = "";
            await prisma.$transaction(async (tx) => {
                const existing = await tx.customer.findFirst({
                    where: { teamName: { equals: teamName, mode: "insensitive" } },
                });

                if (existing) {
                    await tx.customer.update({
                        where: { id: existing.id },
                        data,
                    });
                    wasUpdate = true;
                    recordId = existing.id;
                } else {
                    const newCustomer = await tx.customer.create({
                        data: { teamName, ...data },
                    });
                    recordId = newCustomer.id;
                }
            });

            await logActivity({
                recordId,
                collectionName: "customers",
                method: "Import",
                summary: wasUpdate
                    ? `Updated customer ${teamName} via import`
                    : `Created customer ${teamName} via import`,
            });

            if (wasUpdate) {
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

    revalidatePath("/customers");
    revalidatePath("/dashboard");

    return { created, updated, skipped, errors };
}
