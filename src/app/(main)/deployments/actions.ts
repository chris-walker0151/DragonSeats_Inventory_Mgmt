"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type {
    AssetAvailability,
    GameType,
    WarehouseLocation,
} from "@/generated/prisma/client";
import { logActivity } from "@/lib/activity-log/queries";

// ─── State machine rules ────────────────────────────────────────────────────

type DeploymentAction =
    | "reserve"
    | "deploy"
    | "return"
    | "service"
    | "transfer"
    | "refurbish";

const ACTION_RULES: Record<
    DeploymentAction,
    { allowedFrom: AssetAvailability[]; setsTo: AssetAvailability }
> = {
    reserve: { allowedFrom: ["available"], setsTo: "reserved" },
    deploy: { allowedFrom: ["reserved"], setsTo: "deployed" },
    return: { allowedFrom: ["deployed", "reserved", "down"], setsTo: "available" },
    service: { allowedFrom: ["available"], setsTo: "down" },
    transfer: { allowedFrom: ["deployed"], setsTo: "deployed" },
    refurbish: { allowedFrom: ["down"], setsTo: "down" },
};

// ─── Validation ─────────────────────────────────────────────────────────────

async function validateAvailability(assetId: string, action: DeploymentAction) {
    const asset = await prisma.serializedAsset.findUnique({
        where: { id: assetId },
        select: { availability: true, serialNumber: true },
    });

    if (!asset) throw new Error("Asset not found");

    const rules = ACTION_RULES[action];
    if (!rules.allowedFrom.includes(asset.availability)) {
        throw new Error(
            `Cannot ${action} asset ${asset.serialNumber}: ` +
                `current availability is "${asset.availability}", ` +
                `requires: ${rules.allowedFrom.join(", ")}`,
        );
    }
}

// ─── Reserve: Available → Reserved ──────────────────────────────────────────

export async function reserveAssetAction(input: {
    assetId: string;
    customerId: string;
    startDate: string;
    gameType: GameType;
}) {
    await validateAvailability(input.assetId, "reserve");

    const startDate = new Date(input.startDate);

    await prisma.$transaction([
        prisma.serializedAsset.update({
            where: { id: input.assetId },
            data: {
                availability: "reserved",
                lifecycleStatus: "in_warehouse_reserved",
                customerId: input.customerId,
            },
        }),
        prisma.deployment.create({
            data: {
                assetId: input.assetId,
                customerId: input.customerId,
                deploymentDate: startDate,
                gameType: input.gameType,
            },
        }),
    ]);

    await logActivity({
        recordId: input.assetId,
        collectionName: "serialized-assets",
        summary: `Reserved asset for deployment (${input.gameType})`,
    });

    revalidateDeploymentPaths();
}

// ─── Deploy: Reserved → Deployed ────────────────────────────────────────────

export async function deployAssetAction(input: {
    assetId: string;
    pickupDate: string;
    transportVendor: string;
}) {
    await validateAvailability(input.assetId, "deploy");

    const activeDeployment = await prisma.deployment.findFirst({
        where: { assetId: input.assetId, actualReturnDate: null },
        orderBy: { deploymentDate: "desc" },
    });

    if (!activeDeployment) {
        throw new Error("No active reservation found for this asset");
    }

    await prisma.$transaction([
        prisma.serializedAsset.update({
            where: { id: input.assetId },
            data: {
                availability: "deployed",
                lifecycleStatus: "deployed_customer",
                currentLocation: "deployed_customer",
            },
        }),
        prisma.deployment.update({
            where: { id: activeDeployment.id },
            data: {
                transportVendor: input.transportVendor,
                deploymentDate: new Date(input.pickupDate),
            },
        }),
    ]);

    await logActivity({
        recordId: input.assetId,
        collectionName: "serialized-assets",
        summary: `Deployed asset (transport: ${input.transportVendor})`,
    });

    revalidateDeploymentPaths();
}

// ─── Return: Deployed/Reserved/Down → Available ─────────────────────────────

export async function returnAssetAction(input: {
    assetId: string;
    returnWarehouse: WarehouseLocation;
    condition: string;
    benchStatus?: string;
}) {
    await validateAvailability(input.assetId, "return");

    await prisma.$transaction(async (tx) => {
        await tx.serializedAsset.update({
            where: { id: input.assetId },
            data: {
                availability: "available",
                lifecycleStatus: "in_warehouse_available",
                currentLocation: input.returnWarehouse,
                customerId: null,
                condition: input.condition,
                benchStatus: input.benchStatus || undefined,
                deployedLocationName: null,
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

    await logActivity({
        recordId: input.assetId,
        collectionName: "serialized-assets",
        summary: `Returned asset to ${input.returnWarehouse} (condition: ${input.condition})`,
    });

    revalidateDeploymentPaths();
}

// ─── Service: Available → Down ──────────────────────────────────────────────

export async function serviceAssetAction(input: {
    assetId: string;
    condition: string;
    notes: string;
}) {
    await validateAvailability(input.assetId, "service");

    await prisma.serializedAsset.update({
        where: { id: input.assetId },
        data: {
            availability: "down",
            condition: input.condition,
            maintenanceNotes: input.notes,
        },
    });

    await logActivity({
        recordId: input.assetId,
        collectionName: "serialized-assets",
        summary: `Sent asset to service (condition: ${input.condition})`,
    });

    revalidateDeploymentPaths();
}

// ─── Transfer: Deployed → Deployed (new customer) ──────────────────────────

export async function transferAssetAction(input: {
    assetId: string;
    customerId: string;
    startDate: string;
    gameType: GameType;
}) {
    await validateAvailability(input.assetId, "transfer");

    const startDate = new Date(input.startDate);

    await prisma.$transaction(async (tx) => {
        // Close current deployment
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

        // Update asset to new customer
        await tx.serializedAsset.update({
            where: { id: input.assetId },
            data: {
                customerId: input.customerId,
                availability: "deployed",
            },
        });

        // Create new deployment
        await tx.deployment.create({
            data: {
                assetId: input.assetId,
                customerId: input.customerId,
                deploymentDate: startDate,
                gameType: input.gameType,
            },
        });
    });

    await logActivity({
        recordId: input.assetId,
        collectionName: "serialized-assets",
        summary: `Transferred asset to new customer (${input.gameType})`,
    });

    revalidateDeploymentPaths();
}

// ─── Refurbish: Down → Down (track manufacturer) ───────────────────────────

export async function refurbishAssetAction(input: {
    assetId: string;
    manufacturer: string;
    returnDate: string;
}) {
    await validateAvailability(input.assetId, "refurbish");

    await prisma.serializedAsset.update({
        where: { id: input.assetId },
        data: {
            availability: "down",
            manufacturer: input.manufacturer,
            lastRefurbishedDate: new Date(input.returnDate),
            deployedLocationName: `Refurbish - ${input.manufacturer}`,
        },
    });

    await logActivity({
        recordId: input.assetId,
        collectionName: "serialized-assets",
        summary: `Sent asset for refurbishment (${input.manufacturer})`,
    });

    revalidateDeploymentPaths();
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function revalidateDeploymentPaths() {
    revalidatePath("/deployments");
    revalidatePath("/serialized-assets");
    revalidatePath("/dashboard");
    revalidatePath("/maintenance");
    revalidatePath("/service-tickets");
}
