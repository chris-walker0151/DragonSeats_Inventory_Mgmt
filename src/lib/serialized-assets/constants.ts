/**
 * Constants for the Serialized Assets page.
 * Labels, badge colors, and filter option arrays.
 */

import type {
    ProductCategory,
    LifecycleStatus,
    WarehouseLocation,
    BrandingStatus,
} from "@/generated/prisma";

// ─── Product Category ────────────────────────────────────────────────────────

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
    bench: "Bench",
    heater: "Heater",
    ac_unit: "AC Unit",
    compressor: "Compressor",
    cooling_tower: "Cooling Tower",
    shader: "Shader",
    hot_box: "Hot Box",
};

export const PRODUCT_CATEGORY_COLORS: Record<ProductCategory, string> = {
    bench: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    heater: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    ac_unit: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    compressor: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
    cooling_tower: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    shader: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    hot_box: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
};

export const ALL_PRODUCT_CATEGORIES: ProductCategory[] = [
    "bench",
    "heater",
    "ac_unit",
    "compressor",
    "cooling_tower",
    "shader",
    "hot_box",
];

// ─── Lifecycle Status ────────────────────────────────────────────────────────

export const LIFECYCLE_STATUS_LABELS: Record<LifecycleStatus, string> = {
    ordered: "Ordered",
    in_warehouse_available: "Available",
    in_warehouse_reserved: "Reserved",
    deployed_customer: "Deployed",
    retired: "Retired",
};

export const LIFECYCLE_STATUS_COLORS: Record<LifecycleStatus, string> = {
    ordered: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    in_warehouse_available: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    in_warehouse_reserved: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    deployed_customer: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    retired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const ALL_LIFECYCLE_STATUSES: LifecycleStatus[] = [
    "ordered",
    "in_warehouse_available",
    "in_warehouse_reserved",
    "deployed_customer",
    "retired",
];

// ─── Warehouse Location ──────────────────────────────────────────────────────

export const WAREHOUSE_LOCATION_LABELS: Record<WarehouseLocation, string> = {
    cleveland_warehouse: "Cleveland",
    kansas_city_warehouse: "Kansas City",
    jacksonville_warehouse: "Jacksonville",
    deployed_customer: "Deployed (Customer)",
};

export const WAREHOUSE_LOCATION_COLORS: Record<WarehouseLocation, string> = {
    cleveland_warehouse: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    kansas_city_warehouse: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    jacksonville_warehouse: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    deployed_customer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

export const ALL_WAREHOUSE_LOCATIONS: WarehouseLocation[] = [
    "cleveland_warehouse",
    "kansas_city_warehouse",
    "jacksonville_warehouse",
    "deployed_customer",
];

// ─── Branding Status ─────────────────────────────────────────────────────────

export const BRANDING_STATUS_LABELS: Record<BrandingStatus, string> = {
    unbranded: "Unbranded",
    branded: "Branded",
};

export const BRANDING_STATUS_COLORS: Record<BrandingStatus, string> = {
    unbranded: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    branded: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
};
