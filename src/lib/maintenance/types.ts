import type {
    ProductCategory,
    LifecycleStatus,
    WarehouseLocation,
} from "@/generated/prisma/client";

export type MaintenanceCategoryFilter = ProductCategory | "all";
export type MaintenanceStatusFilter = LifecycleStatus | "all";
export type MaintenanceSortField = "yearManufactured" | "lastRefurbishedDate" | "lifecycleStatus" | "serialNumber";

export interface MaintenanceListItem {
    id: string;
    serialNumber: string;
    productCategory: ProductCategory;
    productTypeModel: string | null;
    lifecycleStatus: LifecycleStatus;
    currentLocation: WarehouseLocation;
    customerName: string | null;
    yearManufactured: number | null;
    dateAcquired: Date | null;
    lastRefurbishedDate: Date | null;
    maintenanceNotes: string | null;
    manufacturer: string | null;
}

export interface MaintenanceAssetDetail {
    id: string;
    serialNumber: string;
    productCategory: ProductCategory;
    productTypeModel: string | null;
    lifecycleStatus: LifecycleStatus;
    currentLocation: WarehouseLocation;
    customerName: string | null;
    yearManufactured: number | null;
    dateAcquired: Date | null;
    manufacturer: string | null;
    lastRefurbishedDate: Date | null;
    maintenanceNotes: string | null;
    notes: string | null;
}
