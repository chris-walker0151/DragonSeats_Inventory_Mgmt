/**
 * Server-side Prisma queries for the Serialized Assets page.
 * These run in server components and server actions only.
 */

import { prisma } from "@/lib/db";
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
