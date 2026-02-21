/**
 * Server-side Prisma queries for the Deployments page.
 * These run in server components and server actions only.
 */

import { prisma } from "@/lib/db";
import type { DeploymentListItem } from "./types";

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

/**
 * Fetch assets that are available for new deployments.
 * Returns only assets with lifecycleStatus = in_warehouse_available.
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
