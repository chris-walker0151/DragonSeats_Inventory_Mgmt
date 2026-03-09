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

export async function fetchTicketDetailAction(
    id: string,
): Promise<ServiceTicketDetail | null> {
    return fetchDetail(id);
}

export async function createTicketAction(
    input: TicketCreateInput,
): Promise<{ id: string }> {
    const ticket = await createServiceTicket(input);
    revalidatePath("/service-tickets");
    revalidatePath("/dashboard");
    return { id: ticket.id };
}

export async function updateTicketAction(
    id: string,
    input: TicketUpdateInput,
) {
    await updateServiceTicket(id, input);
    revalidatePath("/service-tickets");
    revalidatePath("/serialized-assets");
    revalidatePath("/dashboard");
}

export async function fetchAssetsForDropdownAction() {
    return fetchAssetsForTicketDropdown();
}
