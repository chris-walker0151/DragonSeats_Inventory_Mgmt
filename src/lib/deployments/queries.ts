/**
 * Server-side Prisma queries for the Deployments page.
 * These run in server components and server actions only.
 */

import { prisma } from "@/lib/db";
import type { DeploymentListItem, DeploymentAssetItem, AvailabilitySummary } from "./types";

// ─── Legacy: deployment-record view ─────────────────────────────────────────

/**
 * Fetch all deployments with related asset and customer info.
 */
export async function fetchDeploymentsList(): Promise<DeploymentListItem[]> {
    const deployments = await prisma.deployment.findMany({
        include: {
            asset: {
                select: {
                    serialNumber: true,
                    productCategory: true,
                },
            },
            customer: {
                select: {
                    teamName: true,
                },
            },
        },
        orderBy: { deploymentDate: "desc" },
    });

    return deployments.map((d) => ({
        id: d.id,
        assetId: d.assetId,
        customerId: d.customerId,
        deploymentDate: d.deploymentDate,
        expectedReturnDate: d.expectedReturnDate,
        actualReturnDate: d.actualReturnDate,
        deploymentNotes: d.deploymentNotes,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        assetSerialNumber: d.asset.serialNumber,
        assetProductCategory: d.asset.productCategory,
        customerName: d.customer.teamName,
    }));
}

// ─── Asset-centric view (Deployments Dash) ──────────────────────────────────

/**
 * Fetch all non-retired assets with availability info for the deployments dash.
 * Each row represents one asset with its availability state and latest active deployment.
 */
export async function fetchDeploymentAssets(): Promise<DeploymentAssetItem[]> {
    const assets = await prisma.serializedAsset.findMany({
        where: {
            lifecycleStatus: { not: "retired" },
        },
        include: {
            customer: { select: { teamName: true } },
            deployments: {
                where: { actualReturnDate: null },
                orderBy: { deploymentDate: "desc" },
                take: 1,
                select: {
                    id: true,
                    deploymentDate: true,
                    expectedReturnDate: true,
                },
            },
        },
        orderBy: { serialNumber: "asc" },
    });

    return assets.map((a) => ({
        id: a.id,
        serialNumber: a.serialNumber,
        productCategory: a.productCategory,
        productTypeModel: a.productTypeModel,
        availability: a.availability,
        currentLocation: a.currentLocation,
        condition: a.condition,
        manufacturer: a.manufacturer,
        customerId: a.customerId,
        customerName: a.customer?.teamName ?? null,
        deployedLocationName: a.deployedLocationName,
        activeDeploymentId: a.deployments[0]?.id ?? null,
        deploymentDate: a.deployments[0]?.deploymentDate ?? null,
        expectedReturnDate: a.deployments[0]?.expectedReturnDate ?? null,
    }));
}

/**
 * Fetch availability counts for summary cards.
 */
export async function fetchAvailabilitySummary(): Promise<AvailabilitySummary> {
    const counts = await prisma.serializedAsset.groupBy({
        by: ["availability"],
        where: { lifecycleStatus: { not: "retired" } },
        _count: { id: true },
    });

    const summary: AvailabilitySummary = {
        available: 0,
        reserved: 0,
        deployed: 0,
        down: 0,
        total: 0,
    };

    for (const row of counts) {
        summary[row.availability] = row._count.id;
        summary.total += row._count.id;
    }

    return summary;
}

// ─── Supporting queries (used by action dialogs) ────────────────────────────

/**
 * Fetch assets that are available for new deployments.
 */
export async function fetchAvailableAssets() {
    return prisma.serializedAsset.findMany({
        where: { lifecycleStatus: "in_warehouse_available" },
        select: {
            id: true,
            serialNumber: true,
            productCategory: true,
            productTypeModel: true,
            currentLocation: true,
        },
        orderBy: { serialNumber: "asc" },
    });
}

/**
 * Fetch customers with active status for deployment assignment.
 */
export async function fetchActiveCustomers() {
    return prisma.customer.findMany({
        where: { activeStatus: "active" },
        select: {
            id: true,
            teamName: true,
            league: true,
            stadiumName: true,
        },
        orderBy: { teamName: "asc" },
    });
}
