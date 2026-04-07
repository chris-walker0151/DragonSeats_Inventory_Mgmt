/**
 * TypeScript types for the Serialized Assets page.
 * Mirrors database schema for serialized_assets table.
 */

import type {
    ProductCategory,
    LifecycleStatus,
    WarehouseLocation,
    BrandingStatus,
    BrandingType,
    AssetAvailability,
} from "@/generated/prisma/client";

export type LocationFilter = WarehouseLocation | "all";

export interface SerializedAssetListItem {
    id: string;
    serialNumber: string;
    productCategory: ProductCategory;
    productTypeModel: string | null;
    lifecycleStatus: LifecycleStatus;
    currentLocation: WarehouseLocation;
    customerName: string | null;
    brandingStatus: BrandingStatus | null;
    brandingDescription: string | null;
    skuCode: string | null;
    manufacturer: string | null;
    condition: string | null;
    benchStatus: string | null;
    availability: AssetAvailability;
    manifoldStyle: string | null;
    deckType: string | null;
    seatType: string | null;
    wheelType: string | null;
    kitName: string | null;
    deployedLocationName: string | null;
}

export interface SerializedAssetDetail {
    id: string;
    serialNumber: string;
    skuId: string | null;
    productCategory: ProductCategory;
    productTypeModel: string | null;
    lifecycleStatus: LifecycleStatus;
    currentLocation: WarehouseLocation;
    customerId: string | null;
    dateAcquired: Date | null;
    responsiblePerson: string | null;
    notes: string | null;
    manufacturer: string | null;
    benchType: string | null;
    flangeOrDiffuser: string | null;
    wheelType: string | null;
    ventHoles: boolean | null;
    yearManufactured: number | null;
    brandingStatus: BrandingStatus | null;
    brandingType: BrandingType | null;
    brandingDescription: string | null;
    kitName: string | null;
    condition: string | null;
    benchStatus: string | null;
    availability: AssetAvailability;
    manifoldStyle: string | null;
    deckType: string | null;
    seatType: string | null;
    compressorHoles: string | null;
    acHoles: string | null;
    dsPlateNumber: string | null;
    deployedLocationName: string | null;
    teamAllocated2024: string | null;
    teamAllocated2025: string | null;
    heaterType: string | null;
    btuLevel: string | null;
    btuRating: number | null;
    amps: number | null;
    lastRefurbishedDate: Date | null;
    maintenanceNotes: string | null;
    createdAt: Date;
    updatedAt: Date;
    customer: { id: string; teamName: string } | null;
    sku: { id: string; sku: string } | null;
    deployments: {
        id: string;
        deploymentDate: Date;
        expectedReturnDate: Date | null;
        actualReturnDate: Date | null;
        customerName: string;
    }[];
}
