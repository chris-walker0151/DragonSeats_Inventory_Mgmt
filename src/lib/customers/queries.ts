/**
 * Server-side Prisma queries for the Customers page.
 * These run in server components and server actions only.
 */

import { prisma } from "@/lib/db";
import type { LeagueType, ContractType, CustomerStatus } from "@/generated/prisma/client";
import type { CustomerListItem, CustomerDetail } from "./types";

export interface CustomerCreateInput {
    teamName: string;
    league: LeagueType;
    organizationLegalName: string;
    contractType: ContractType;
    activeStatus?: CustomerStatus;
    primaryContactName?: string | null;
    primaryContactEmail?: string | null;
    primaryContactPhone?: string | null;
    stadiumName?: string | null;
    stadiumAddress?: string | null;
    contractStartDate?: Date | null;
    contractEndDate?: Date | null;
    // Team info fields
    roadContactName?: string | null;
    loadingDock?: string | null;
    fieldType?: string | null;
    sidelineSetupNotes?: string | null;
    sidelineSetupDiagram?: string | null;
    homeBenches?: number | null;
    homeShaders?: string | null;
    homeCooling?: string | null;
    homeHeat?: string | null;
    roadBenches?: number | null;
    roadShaders?: string | null;
    roadCooling?: string | null;
    roadHeat?: string | null;
    notes?: string | null;
}

export type CustomerUpdateInput = Partial<Omit<CustomerCreateInput, "teamName">>;

/**
 * Fetch all customers with count of deployed assets.
 */
export async function fetchCustomersList(): Promise<CustomerListItem[]> {
    const customers = await prisma.customer.findMany({
        include: {
            _count: {
                select: {
                    serializedAssets: {
                        where: { lifecycleStatus: "deployed_customer" },
                    },
                },
            },
        },
        orderBy: { teamName: "asc" },
    });

    return customers.map((c) => ({
        id: c.id,
        teamName: c.teamName,
        league: c.league,
        organizationLegalName: c.organizationLegalName,
        primaryContactName: c.primaryContactName,
        primaryContactEmail: c.primaryContactEmail,
        primaryContactPhone: c.primaryContactPhone,
        stadiumName: c.stadiumName,
        contractType: c.contractType,
        activeStatus: c.activeStatus,
        deployedAssetCount: c._count.serializedAssets,
    }));
}

/**
 * Fetch full detail for a single customer including their deployed assets.
 */
export async function fetchCustomerDetail(
    id: string,
): Promise<CustomerDetail | null> {
    const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
            serializedAssets: {
                where: { lifecycleStatus: "deployed_customer" },
                select: {
                    id: true,
                    serialNumber: true,
                    productCategory: true,
                    productTypeModel: true,
                },
                orderBy: { serialNumber: "asc" },
            },
        },
    });

    if (!customer) return null;

    return {
        id: customer.id,
        teamName: customer.teamName,
        league: customer.league,
        organizationLegalName: customer.organizationLegalName,
        primaryContactName: customer.primaryContactName,
        primaryContactEmail: customer.primaryContactEmail,
        primaryContactPhone: customer.primaryContactPhone,
        stadiumName: customer.stadiumName,
        stadiumAddress: customer.stadiumAddress,
        contractType: customer.contractType,
        contractStartDate: customer.contractStartDate,
        contractEndDate: customer.contractEndDate,
        activeStatus: customer.activeStatus,
        roadContactName: customer.roadContactName,
        loadingDock: customer.loadingDock,
        fieldType: customer.fieldType,
        sidelineSetupNotes: customer.sidelineSetupNotes,
        sidelineSetupDiagram: customer.sidelineSetupDiagram,
        homeBenches: customer.homeBenches,
        homeShaders: customer.homeShaders,
        homeCooling: customer.homeCooling,
        homeHeat: customer.homeHeat,
        roadBenches: customer.roadBenches,
        roadShaders: customer.roadShaders,
        roadCooling: customer.roadCooling,
        roadHeat: customer.roadHeat,
        notes: customer.notes,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        deployedAssets: customer.serializedAssets.map((a) => ({
            id: a.id,
            serialNumber: a.serialNumber,
            productCategory: a.productCategory,
            productTypeModel: a.productTypeModel,
        })),
    };
}

/**
 * Create a new customer.
 */
export async function createCustomer(input: CustomerCreateInput) {
    return prisma.customer.create({ data: input });
}

/**
 * Update an existing customer.
 */
export async function updateCustomer(id: string, input: CustomerUpdateInput) {
    return prisma.customer.update({ where: { id }, data: input });
}
