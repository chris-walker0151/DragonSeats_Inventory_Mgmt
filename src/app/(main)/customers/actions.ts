"use server";

import { fetchCustomerDetail } from "@/lib/customers/queries";
import type { CustomerDetail } from "@/lib/customers/types";

/**
 * Server action to fetch a single customer detail.
 * Called from the detail sheet when a table row is clicked.
 */
export async function fetchCustomerDetailAction(
    id: string,
): Promise<CustomerDetail | null> {
    return fetchCustomerDetail(id);
}
