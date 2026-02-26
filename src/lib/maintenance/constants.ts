// Age thresholds (years since manufacture)
export const MAINTENANCE_AGE_WARNING = 2;
export const MAINTENANCE_AGE_CRITICAL = 4;

// Refurbishment thresholds (months since last refurb)
export const REFURB_WARNING_MONTHS = 18;
export const REFURB_CRITICAL_MONTHS = 36;

// Re-export shared constants used by the maintenance page
export {
    PRODUCT_CATEGORY_LABELS,
    PRODUCT_CATEGORY_COLORS,
    ALL_PRODUCT_CATEGORIES,
    LIFECYCLE_STATUS_LABELS,
    LIFECYCLE_STATUS_COLORS,
    ALL_LIFECYCLE_STATUSES,
    WAREHOUSE_LOCATION_LABELS,
} from "@/lib/serialized-assets/constants";
