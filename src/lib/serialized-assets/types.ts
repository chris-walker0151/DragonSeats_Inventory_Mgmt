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
} from "@/generated/prisma";

export type CategoryFilter = ProductCategory | "all";
export type StatusFilter = LifecycleStatus | "all";
export type LocationFilter = WarehouseLocation | "all";
export type BrandingFilter = BrandingStatus | "all";

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
    heaterType: string | null;
    btuLevel: string | null;
    btuRating: number | null;
    amps: number | null;
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
