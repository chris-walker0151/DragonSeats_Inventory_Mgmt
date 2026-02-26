/**
 * Server-side Prisma queries for the Serialized Assets page.
 * These run in server components and server actions only.
 */

import { prisma } from "@/lib/db";
import type { WarehouseLocation } from "@/generated/prisma/client";
import type { SerializedAssetListItem, SerializedAssetDetail } from "./types";

/**
 * Fetch all serialized assets with customer and SKU info for the list view.
 */
export async function fetchSerializedAssetsList(): Promise<SerializedAssetListItem[]> {
    const assets = await prisma.serializedAsset.findMany({
        include: {
            customer: { select: { id: true, teamName: true } },
            sku: { select: { id: true, sku: true } },
        },
        orderBy: { serialNumber: "asc" },
    });

    return assets.map((a) => ({
        id: a.id,
        serialNumber: a.serialNumber,
        productCategory: a.productCategory,
        productTypeModel: a.productTypeModel,
        lifecycleStatus: a.lifecycleStatus,
        currentLocation: a.currentLocation,
        customerName: a.customer?.teamName ?? null,
        brandingStatus: a.brandingStatus,
        brandingDescription: a.brandingDescription,
        skuCode: a.sku?.sku ?? null,
    }));
}

/**
 * Fetch full detail for a single serialized asset including deployments.
 */
export async function fetchSerializedAssetDetail(
    id: string,
): Promise<SerializedAssetDetail | null> {
    const asset = await prisma.serializedAsset.findUnique({
        where: { id },
        include: {
            customer: { select: { id: true, teamName: true } },
            sku: { select: { id: true, sku: true } },
            deployments: {
                include: {
                    customer: { select: { teamName: true } },
                },
                orderBy: { deploymentDate: "desc" },
            },
        },
    });

    if (!asset) return null;

    return {
        id: asset.id,
        serialNumber: asset.serialNumber,
        skuId: asset.skuId,
        productCategory: asset.productCategory,
        productTypeModel: asset.productTypeModel,
        lifecycleStatus: asset.lifecycleStatus,
        currentLocation: asset.currentLocation,
        customerId: asset.customerId,
        dateAcquired: asset.dateAcquired,
        responsiblePerson: asset.responsiblePerson,
        notes: asset.notes,
        manufacturer: asset.manufacturer,
        benchType: asset.benchType,
        flangeOrDiffuser: asset.flangeOrDiffuser,
        wheelType: asset.wheelType,
        ventHoles: asset.ventHoles,
        yearManufactured: asset.yearManufactured,
        brandingStatus: asset.brandingStatus,
        brandingType: asset.brandingType,
        brandingDescription: asset.brandingDescription,
        heaterType: asset.heaterType,
        btuLevel: asset.btuLevel,
        btuRating: asset.btuRating,
        amps: asset.amps,
        lastRefurbishedDate: asset.lastRefurbishedDate,
        maintenanceNotes: asset.maintenanceNotes,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
        customer: asset.customer,
        sku: asset.sku,
        deployments: asset.deployments.map((d) => ({
            id: d.id,
            deploymentDate: d.deploymentDate,
            expectedReturnDate: d.expectedReturnDate,
            actualReturnDate: d.actualReturnDate,
            customerName: d.customer.teamName,
        })),
    };
}

/**
 * Deploy an asset to a customer. Updates asset status/location/customer and creates a deployment record.
 */
export async function deployAsset(input: {
    assetId: string;
    customerId: string;
    deploymentDate: string;
    expectedReturnDate?: string;
    notes?: string;
}) {
    return prisma.$transaction([
        prisma.serializedAsset.update({
            where: { id: input.assetId },
            data: {
                lifecycleStatus: "deployed_customer",
                currentLocation: "deployed_customer",
                customerId: input.customerId,
            },
        }),
        prisma.deployment.create({
            data: {
                assetId: input.assetId,
                customerId: input.customerId,
                deploymentDate: new Date(input.deploymentDate),
                expectedReturnDate: input.expectedReturnDate
                    ? new Date(input.expectedReturnDate)
                    : null,
                deploymentNotes: input.notes || null,
            },
        }),
    ]);
}

/**
 * Return an asset from a customer. Reverts status/location, clears customer, and sets return date.
 */
export async function returnAsset(input: {
    assetId: string;
    returnLocation: WarehouseLocation;
}) {
    return prisma.$transaction(async (tx) => {
        await tx.serializedAsset.update({
            where: { id: input.assetId },
            data: {
                lifecycleStatus: "in_warehouse_available",
                currentLocation: input.returnLocation,
                customerId: null,
            },
        });

        const activeDeployment = await tx.deployment.findFirst({
            where: { assetId: input.assetId, actualReturnDate: null },
            orderBy: { deploymentDate: "desc" },
        });

        if (activeDeployment) {
            await tx.deployment.update({
                where: { id: activeDeployment.id },
                data: { actualReturnDate: new Date() },
            });
        }
    });
}

/**
 * Fetch active customers for the deploy dropdown.
 */
export async function fetchActiveCustomersList() {
    return prisma.customer.findMany({
        where: { activeStatus: "active" },
        select: { id: true, teamName: true },
        orderBy: { teamName: "asc" },
    });
}

/**
 * Fetch fleet matrix: count of assets grouped by productCategory + lifecycleStatus.
 * Used on the dashboard for the fleet composition grid.
 */
export async function fetchDashboardFleetMatrix() {
    const result = await prisma.serializedAsset.groupBy({
        by: ["productCategory", "lifecycleStatus"],
        _count: { id: true },
    });

    return result.map((row) => ({
        productCategory: row.productCategory,
        lifecycleStatus: row.lifecycleStatus,
        count: row._count.id,
    }));
}

/**
 * Fetch location summary: count of assets grouped by currentLocation + lifecycleStatus.
 * Used on the dashboard for the warehouse distribution chart.
 */
export async function fetchDashboardLocationSummary() {
    const result = await prisma.serializedAsset.groupBy({
        by: ["currentLocation", "lifecycleStatus"],
        _count: { id: true },
    });

    return result.map((row) => ({
        currentLocation: row.currentLocation,
        lifecycleStatus: row.lifecycleStatus,
        count: row._count.id,
    }));
}

/**
 * Fetch branding summary: count of branded vs unbranded benches.
 * Used on the dashboard for branding status overview.
 */
export async function fetchDashboardBrandingSummary() {
    const [branded, unbranded] = await Promise.all([
        prisma.serializedAsset.count({
            where: {
                productCategory: "bench",
                brandingStatus: "branded",
            },
        }),
        prisma.serializedAsset.count({
            where: {
                productCategory: "bench",
                brandingStatus: "unbranded",
            },
        }),
    ]);

    return { branded, unbranded, total: branded + unbranded };
}
