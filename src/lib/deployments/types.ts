/**
 * TypeScript types for the Deployments page.
 * Includes both deployment-record types and asset-centric types.
 */

import type {
    ProductCategory,
    AssetAvailability,
    WarehouseLocation,
} from "@/generated/prisma/client";

// ─── Deployment-record view (legacy) ────────────────────────────────────────

export interface DeploymentListItem {
    id: string;
    assetId: string;
    customerId: string;
    deploymentDate: Date;
    expectedReturnDate: Date | null;
    actualReturnDate: Date | null;
    deploymentNotes: string | null;
    createdAt: Date;
    updatedAt: Date;
    assetSerialNumber: string;
    assetProductCategory: ProductCategory;
    customerName: string;
}

// ─── Asset-centric view (Deployments Dash) ──────────────────────────────────

export interface DeploymentAssetItem {
    id: string; // asset ID
    serialNumber: string;
    productCategory: ProductCategory;
    productTypeModel: string | null;
    availability: AssetAvailability;
    currentLocation: WarehouseLocation;
    condition: string | null;
    manufacturer: string | null;
    customerId: string | null;
    customerName: string | null;
    deployedLocationName: string | null;
    // Latest active deployment info (if any)
    activeDeploymentId: string | null;
    deploymentDate: Date | null;
    expectedReturnDate: Date | null;
}

// ─── Summary ────────────────────────────────────────────────────────────────

export interface AvailabilitySummary {
    available: number;
    reserved: number;
    deployed: number;
    down: number;
    total: number;
}

export type AvailabilityTileFilter = AssetAvailability | "all";
