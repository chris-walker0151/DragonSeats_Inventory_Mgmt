/**
 * Constants for the Deployments page.
 *
 * Deployments reuse labels and colors from serialized-assets and customers.
 * Re-export commonly used constants for convenience.
 */

import type { AssetAvailability, GameType } from "@/generated/prisma/client";

export {
    PRODUCT_CATEGORY_LABELS,
    PRODUCT_CATEGORY_COLORS,
    ALL_PRODUCT_CATEGORIES,
} from "@/lib/serialized-assets/constants";

export {
    LEAGUE_LABELS,
    LEAGUE_COLORS,
} from "@/lib/customers/constants";

// ─── Asset Availability ─────────────────────────────────────────────────────

export const AVAILABILITY_LABELS: Record<AssetAvailability, string> = {
    available: "Available",
    reserved: "Reserved",
    deployed: "Deployed",
    down: "Down",
};

export const AVAILABILITY_COLORS: Record<AssetAvailability, string> = {
    available: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    reserved: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    deployed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    down: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const ALL_AVAILABILITIES: AssetAvailability[] = [
    "available",
    "reserved",
    "deployed",
    "down",
];

// ─── Game Type ──────────────────────────────────────────────────────────────

export const GAME_TYPE_LABELS: Record<GameType, string> = {
    home: "Home",
    away: "Away",
};
