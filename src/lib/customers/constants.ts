/**
 * Constants for the Customers page.
 * Labels, badge colors, and filter option arrays.
 */

import type {
    LeagueType,
    CustomerStatus,
    ContractType,
} from "@/generated/prisma/client";

// ─── League Type ─────────────────────────────────────────────────────────────

export const LEAGUE_LABELS: Record<LeagueType, string> = {
    nfl: "NFL",
    ncaa_fbs: "NCAA FBS",
    ncaa_fcs: "NCAA FCS",
    other: "Other",
};

export const LEAGUE_COLORS: Record<LeagueType, string> = {
    nfl: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    ncaa_fbs: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    ncaa_fcs: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    other: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

export const ALL_LEAGUES: LeagueType[] = [
    "nfl",
    "ncaa_fbs",
    "ncaa_fcs",
    "other",
];

// ─── Customer Status ─────────────────────────────────────────────────────────

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
    active: "Active",
    inactive: "Inactive",
    prospect: "Prospect",
};

export const CUSTOMER_STATUS_COLORS: Record<CustomerStatus, string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    prospect: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

export const ALL_CUSTOMER_STATUSES: CustomerStatus[] = [
    "active",
    "inactive",
    "prospect",
];

// ─── Contract Type ───────────────────────────────────────────────────────────

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
    seasonal_rental: "Seasonal Rental",
    multi_year_lease: "Multi-Year Lease",
};
