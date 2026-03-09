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
import { logChange } from "@/lib/audit/log";
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
    await logChange({
        entityType: "ServiceTicket",
        entityId: ticket.id,
        action: "create",
        newData: input as unknown as Record<string, unknown>,
    });
    revalidatePath("/service-tickets");
    revalidatePath("/dashboard");
    return { id: ticket.id };
}

export async function updateTicketAction(
    id: string,
    input: TicketUpdateInput,
) {
    const oldTicket = await prisma.serviceTicket.findUnique({
        where: { id },
        select: {
            ticketStatus: true,
            priority: true,
            problemCategory: true,
            assignedTechnician: true,
            targetCompletionDate: true,
            resolutionOutcome: true,
        },
    });

    await updateServiceTicket(id, input);

    await logChange({
        entityType: "ServiceTicket",
        entityId: id,
        action: "update",
        oldData: oldTicket as Record<string, unknown>,
        newData: input as Record<string, unknown>,
    });

    revalidatePath("/service-tickets");
    revalidatePath("/serialized-assets");
    revalidatePath("/dashboard");
}

export async function fetchAssetsForDropdownAction() {
    return fetchAssetsForTicketDropdown();
}
