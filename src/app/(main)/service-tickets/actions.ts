"use server";

import { revalidatePath } from "next/cache";
import {
    fetchServiceTicketDetail as fetchDetail,
    createServiceTicket,
    updateServiceTicket,
    fetchAssetsForTicketDropdown,
} from "@/lib/service-tickets/queries";
import type { TicketCreateInput, TicketUpdateInput } from "@/lib/service-tickets/queries";
import type { ServiceTicketDetail } from "@/lib/service-tickets/types";
import { logActivity, logBulkActivity, diffFields } from "@/lib/activity-log/queries";
import { prisma } from "@/lib/db";

export async function fetchTicketDetailAction(
    id: string,
): Promise<ServiceTicketDetail | null> {
    return fetchDetail(id);
}

export async function createTicketAction(
    input: TicketCreateInput,
): Promise<{ id: string }> {
    const ticket = await createServiceTicket(input);
    await logActivity({
        recordId: ticket.id,
        collectionName: "service-tickets",
        summary: `Created service ticket for asset ${input.assetId} (${input.problemCategory})`,
    });
    revalidatePath("/service-tickets");
    revalidatePath("/dashboard");
    return { id: ticket.id };
}

export async function updateTicketAction(
    id: string,
    input: TicketUpdateInput,
) {
    const before = await prisma.serviceTicket.findUnique({ where: { id } });
    await updateServiceTicket(id, input);
    if (before) {
        const changes = diffFields(
            before as unknown as Record<string, unknown>,
            input as Record<string, unknown>,
        );
        if (changes.length > 0) {
            await logBulkActivity(
                changes.map((c) => ({
                    recordId: id,
                    collectionName: "service-tickets",
                    summary: `Changed ${c.fieldName} on ticket`,
                    fieldChanged: c.fieldName,
                    oldValue: c.oldValue ?? undefined,
                    newValue: c.newValue ?? undefined,
                })),
            );
        }
    }
    revalidatePath("/service-tickets");
    revalidatePath("/serialized-assets");
    revalidatePath("/dashboard");
}

export async function fetchAssetsForDropdownAction() {
    return fetchAssetsForTicketDropdown();
}
