"use server";

import { fetchSerializedAssetDetail } from "@/lib/serialized-assets/queries";
import type { SerializedAssetDetail } from "@/lib/serialized-assets/types";

/**
 * Server action to fetch a single serialized asset detail.
 * Called from the detail sheet when a table row is clicked.
 */
export async function fetchAssetDetail(
    id: string,
): Promise<SerializedAssetDetail | null> {
    return fetchSerializedAssetDetail(id);
}
