/**
 * Constants for the Service Tickets page.
 * Labels, badge colors, and filter option arrays.
 */

import type {
    TicketStatus,
    ProblemCategory,
    TicketPriority,
    ResolutionOutcome,
} from "@/generated/prisma/client";

// ─── Ticket Status ──────────────────────────────────────────────────────────

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
    open: "Open",
    in_progress: "In Progress",
    pending_parts: "Pending Parts",
    completed: "Completed",
    cancelled: "Cancelled",
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
    open: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    pending_parts: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

export const ALL_TICKET_STATUSES: TicketStatus[] = [
    "open",
    "in_progress",
    "pending_parts",
    "completed",
    "cancelled",
];

// ─── Problem Category ───────────────────────────────────────────────────────

export const PROBLEM_CATEGORY_LABELS: Record<ProblemCategory, string> = {
    pickup_order: "Pickup Order",
    damage: "Damage",
    major_repair: "Major Repair",
    missing_parts: "Missing Parts",
    refurbishment: "Refurbishment",
    warranty: "Warranty",
    other: "Other",
};

export const PROBLEM_CATEGORY_COLORS: Record<ProblemCategory, string> = {
    pickup_order: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    damage: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    major_repair: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    missing_parts: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    refurbishment: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    warranty: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    other: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

export const ALL_PROBLEM_CATEGORIES: ProblemCategory[] = [
    "pickup_order",
    "damage",
    "major_repair",
    "missing_parts",
    "refurbishment",
    "warranty",
    "other",
];

// ─── Priority ───────────────────────────────────────────────────────────────

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
};

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
    low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const ALL_PRIORITIES: TicketPriority[] = [
    "low",
    "medium",
    "high",
    "critical",
];

// ─── Resolution Outcome ─────────────────────────────────────────────────────

export const RESOLUTION_OUTCOME_LABELS: Record<ResolutionOutcome, string> = {
    repaired_to_available: "Repaired to Available",
    refurbished: "Refurbished",
    retired: "Retired / Scrapped",
    cannibalized: "Cannibalized",
    returned_to_manufacturer: "Returned to Manufacturer",
};

export const ALL_RESOLUTION_OUTCOMES: ResolutionOutcome[] = [
    "repaired_to_available",
    "refurbished",
    "retired",
    "cannibalized",
    "returned_to_manufacturer",
];

// ─── Days Down Thresholds ───────────────────────────────────────────────────

export const DAYS_DOWN_WARNING = 20;
export const DAYS_DOWN_CRITICAL = 200;
