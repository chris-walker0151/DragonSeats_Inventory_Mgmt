/**
 * TypeScript types for the Customers page.
 * Mirrors database schema for customers table.
 */

import type {
    LeagueType,
    CustomerStatus,
    ContractType,
    ProductCategory,
} from "@/generated/prisma/client";

export type LeagueFilter = LeagueType | "all";
export type StatusFilter = CustomerStatus | "all";

export interface CustomerListItem {
    id: string;
    teamName: string;
    league: LeagueType;
    organizationLegalName: string;
    primaryContactName: string | null;
    primaryContactEmail: string | null;
    primaryContactPhone: string | null;
    stadiumName: string | null;
    contractType: ContractType;
    activeStatus: CustomerStatus;
    deployedAssetCount: number;
}

export interface CustomerDetail {
    id: string;
    teamName: string;
    league: LeagueType;
    organizationLegalName: string;
    primaryContactName: string | null;
    primaryContactEmail: string | null;
    primaryContactPhone: string | null;
    stadiumName: string | null;
    stadiumAddress: string | null;
    contractType: ContractType;
    contractStartDate: Date | null;
    contractEndDate: Date | null;
    activeStatus: CustomerStatus;
    // Team info fields
    roadContactName: string | null;
    loadingDock: string | null;
    fieldType: string | null;
    sidelineSetupNotes: string | null;
    sidelineSetupDiagram: string | null;
    homeBenches: number | null;
    homeShaders: string | null;
    homeCooling: string | null;
    homeHeat: string | null;
    roadBenches: number | null;
    roadShaders: string | null;
    roadCooling: string | null;
    roadHeat: string | null;
    notes: string | null;
    // Metadata
    createdAt: Date;
    updatedAt: Date;
    deployedAssets: {
        id: string;
        serialNumber: string;
        productCategory: ProductCategory;
        productTypeModel: string | null;
    }[];
}
