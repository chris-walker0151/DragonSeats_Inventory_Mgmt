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
    big_10: "BIG 10",
    sec: "SEC",
    acc: "ACC",
    big_12: "BIG 12",
    other: "Other",
};

export const LEAGUE_COLORS: Record<LeagueType, string> = {
    nfl: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    ncaa_fbs: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    ncaa_fcs: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    big_10: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    sec: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    acc: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    big_12: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    other: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

export const ALL_LEAGUES: LeagueType[] = [
    "nfl",
    "big_10",
    "sec",
    "acc",
    "big_12",
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

export const ALL_CONTRACT_TYPES: ContractType[] = [
    "seasonal_rental",
    "multi_year_lease",
];

// ─── Field labels for activity-log diff display ─────────────────────────────

export const CUSTOMER_FIELD_LABELS: Record<string, string> = {
    teamName: "Team Name",
    league: "League",
    organizationLegalName: "Organization Legal Name",
    contractType: "Contract Type",
    activeStatus: "Status",
    primaryContactName: "Stadium Contact",
    primaryContactEmail: "Contact Email",
    primaryContactPhone: "Contact Phone",
    stadiumName: "Stadium",
    stadiumAddress: "Stadium Address",
    contractStartDate: "Contract Start",
    contractEndDate: "Contract End",
    roadContactName: "Road Contact",
    loadingDock: "Loading Dock",
    fieldType: "Field Type",
    sidelineSetupNotes: "Sideline Setup Notes",
    sidelineSetupDiagram: "Sideline Setup Diagram",
    homeBenches: "Home Benches",
    homeShaders: "Home Shaders",
    homeCooling: "Home Cooling",
    homeHeat: "Home Heat",
    roadBenches: "Road Benches",
    roadShaders: "Road Shaders",
    roadCooling: "Road Cooling",
    roadHeat: "Road Heat",
    notes: "Notes",
};
