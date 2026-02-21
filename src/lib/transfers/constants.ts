/**
 * Constants for the Transfers page.
 * Transfer status labels, colors, and filter arrays.
 */

import type { TransferStatus } from "@/generated/prisma/client";

// ─── Transfer Status ─────────────────────────────────────────────────────────

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
    initiated: "Initiated",
    in_transit: "In Transit",
    received: "Received",
    cancelled: "Cancelled",
};

export const TRANSFER_STATUS_COLORS: Record<TransferStatus, string> = {
    initiated: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    in_transit: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    received: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const ALL_TRANSFER_STATUSES: TransferStatus[] = [
    "initiated",
    "in_transit",
    "received",
    "cancelled",
];
