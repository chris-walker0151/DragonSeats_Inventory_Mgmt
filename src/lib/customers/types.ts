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
    createdAt: Date;
    updatedAt: Date;
    deployedAssets: {
        id: string;
        serialNumber: string;
        productCategory: ProductCategory;
        productTypeModel: string | null;
    }[];
}
