export const VALID_PRODUCT_CATEGORIES = new Set([
    "bench", "heater", "ac_unit", "compressor", "cooling_tower", "shader", "hot_box",
]);

export const VALID_LIFECYCLE_STATUSES = new Set([
    "ordered", "in_warehouse_available", "in_warehouse_reserved", "deployed_customer", "retired",
]);

export const VALID_WAREHOUSE_LOCATIONS = new Set([
    "cleveland_warehouse", "kansas_city_warehouse", "jacksonville_warehouse", "deployed_customer",
]);

export const VALID_LEAGUE_TYPES = new Set(["nfl", "ncaa_fbs", "ncaa_fcs", "other"]);

export const VALID_CONTRACT_TYPES = new Set(["seasonal_rental", "multi_year_lease"]);

export const VALID_CUSTOMER_STATUSES = new Set(["active", "inactive", "prospect"]);

export const VALID_BRANDING_STATUSES = new Set(["unbranded", "branded"]);

export function validateEnum(value: unknown, validSet: Set<string>, enumName: string): string | null {
    if (value === null || value === undefined || value === "") return null;
    const str = String(value).toLowerCase().trim();
    if (!validSet.has(str)) {
        return `Invalid ${enumName}: "${value}". Valid values: ${[...validSet].join(", ")}`;
    }
    return null;
}

export function validateProductCategory(value: unknown): string | null {
    return validateEnum(value, VALID_PRODUCT_CATEGORIES, "product category");
}

export function validateLifecycleStatus(value: unknown): string | null {
    return validateEnum(value, VALID_LIFECYCLE_STATUSES, "lifecycle status");
}

export function validateWarehouseLocation(value: unknown): string | null {
    return validateEnum(value, VALID_WAREHOUSE_LOCATIONS, "warehouse location");
}

export function validateLeagueType(value: unknown): string | null {
    return validateEnum(value, VALID_LEAGUE_TYPES, "league type");
}

export function validateContractType(value: unknown): string | null {
    return validateEnum(value, VALID_CONTRACT_TYPES, "contract type");
}

export function validateCustomerStatus(value: unknown): string | null {
    return validateEnum(value, VALID_CUSTOMER_STATUSES, "customer status");
}

export function validateBrandingStatus(value: unknown): string | null {
    return validateEnum(value, VALID_BRANDING_STATUSES, "branding status");
}
