export const VALID_WAREHOUSE_LOCATIONS = new Set([
    "cleveland_warehouse", "kansas_city_warehouse", "jacksonville_warehouse", "deployed_customer",
]);

export const VALID_LEAGUE_TYPES = new Set(["nfl", "ncaa_fbs", "ncaa_fcs", "big_10", "sec", "acc", "big_12", "other"]);

export const VALID_CONTRACT_TYPES = new Set(["seasonal_rental", "multi_year_lease"]);

export const VALID_CUSTOMER_STATUSES = new Set(["active", "inactive", "prospect"]);

export function validateEnum(value: unknown, validSet: Set<string>, enumName: string): string | null {
    if (value === null || value === undefined || value === "") return null;
    const str = String(value).toLowerCase().trim();
    if (!validSet.has(str)) {
        return `Invalid ${enumName}: "${value}". Valid values: ${[...validSet].join(", ")}`;
    }
    return null;
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
