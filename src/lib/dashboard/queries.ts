/**
 * Dashboard alert queries.
 * Each function queries existing data to surface operational alerts.
 */

import { prisma } from "@/lib/db";

/* ── Types ──────────────────────────────────────────────────────────────────── */

export interface OverdueReturn {
    assetSerialNumber: string;
    customerTeamName: string;
    expectedReturnDate: Date;
    daysOverdue: number;
}

export interface DownedEquipmentAlert {
    serialNumber: string;
    productCategory: string;
    daysDown: number;
    assignedTechnician: string | null;
}

export interface ExpiringContract {
    teamName: string;
    contractEndDate: Date;
    daysUntilExpiry: number;
}

export interface LowStockItem {
    itemCategory: string;
    itemVariant: string | null;
    location: string;
    quantityOnHand: number;
    reorderLevel: number;
}

export interface OverdueTicket {
    id: string;
    assetSerialNumber: string;
    problemCategory: string;
    priority: string;
    daysOverdue: number;
}

export interface StalledTransfer {
    itemLabel: string;
    originLocation: string;
    destinationLocation: string;
    transferDate: Date;
    daysInTransit: number;
}

export interface DashboardAlerts {
    overdueReturns: OverdueReturn[];
    downedEquipment: DownedEquipmentAlert[];
    expiringContracts: ExpiringContract[];
    lowStockItems: LowStockItem[];
    overdueTickets: OverdueTicket[];
    stalledTransfers: StalledTransfer[];
    totalAlertCount: number;
}

/* ── Queries ────────────────────────────────────────────────────────────────── */

const today = () => new Date();

export async function fetchOverdueReturns(): Promise<OverdueReturn[]> {
    const deployments = await prisma.deployment.findMany({
        where: {
            actualReturnDate: null,
            expectedReturnDate: { lt: today() },
        },
        include: {
            asset: { select: { serialNumber: true } },
            customer: { select: { teamName: true } },
        },
        orderBy: { expectedReturnDate: "asc" },
    });

    return deployments
        .filter((d) => d.expectedReturnDate !== null)
        .map((d) => {
            const expected = d.expectedReturnDate!;
            const diff = Math.floor(
                (today().getTime() - expected.getTime()) / (1000 * 60 * 60 * 24),
            );
            return {
                assetSerialNumber: d.asset.serialNumber,
                customerTeamName: d.customer.teamName,
                expectedReturnDate: expected,
                daysOverdue: diff,
            };
        });
}

export async function fetchDownedEquipmentAlerts(): Promise<DownedEquipmentAlert[]> {
    const assets = await prisma.serializedAsset.findMany({
        where: {
            availability: { equals: "Down", mode: "insensitive" },
        },
        select: {
            serialNumber: true,
            productCategory: true,
            serviceTickets: {
                where: {
                    ticketStatus: { in: ["open", "in_progress", "pending_parts"] },
                },
                select: {
                    dateDownStarted: true,
                    assignedTechnician: true,
                },
                orderBy: { dateDownStarted: "desc" },
                take: 1,
            },
        },
    });

    return assets
        .map((a) => {
            const ticket = a.serviceTickets[0];
            const downDate = ticket?.dateDownStarted ?? today();
            const daysDown = Math.floor(
                (today().getTime() - downDate.getTime()) / (1000 * 60 * 60 * 24),
            );
            return {
                serialNumber: a.serialNumber,
                productCategory: a.productCategory,
                daysDown,
                assignedTechnician: ticket?.assignedTechnician ?? null,
            };
        })
        .filter((a) => a.daysDown >= 30)
        .sort((a, b) => b.daysDown - a.daysDown);
}

export async function fetchExpiringContracts(): Promise<ExpiringContract[]> {
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const customers = await prisma.customer.findMany({
        where: {
            activeStatus: "active",
            contractEndDate: {
                gte: today(),
                lte: ninetyDaysFromNow,
            },
        },
        select: {
            teamName: true,
            contractEndDate: true,
        },
        orderBy: { contractEndDate: "asc" },
    });

    return customers
        .filter((c) => c.contractEndDate !== null)
        .map((c) => {
            const endDate = c.contractEndDate!;
            const diff = Math.floor(
                (endDate.getTime() - today().getTime()) / (1000 * 60 * 60 * 24),
            );
            return {
                teamName: c.teamName,
                contractEndDate: endDate,
                daysUntilExpiry: diff,
            };
        });
}

export async function fetchLowStockItems(): Promise<LowStockItem[]> {
    const items = await prisma.quantityInventory.findMany({
        where: {
            reorderLevel: { gt: 0 },
        },
        select: {
            itemCategory: true,
            itemVariant: true,
            location: true,
            quantityOnHand: true,
            reorderLevel: true,
        },
    });

    return items
        .filter((i) => i.quantityOnHand <= i.reorderLevel)
        .sort((a, b) => a.quantityOnHand / a.reorderLevel - b.quantityOnHand / b.reorderLevel);
}

export async function fetchOverdueTickets(): Promise<OverdueTicket[]> {
    const tickets = await prisma.serviceTicket.findMany({
        where: {
            ticketStatus: { in: ["open", "in_progress", "pending_parts"] },
            targetCompletionDate: { lt: today() },
        },
        include: {
            asset: { select: { serialNumber: true } },
        },
        orderBy: { targetCompletionDate: "asc" },
    });

    return tickets.map((t) => {
        const target = t.targetCompletionDate!;
        const diff = Math.floor(
            (today().getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
        );
        return {
            id: t.id,
            assetSerialNumber: t.asset.serialNumber,
            problemCategory: t.problemCategory,
            priority: t.priority,
            daysOverdue: diff,
        };
    });
}

export async function fetchStalledTransfers(): Promise<StalledTransfer[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const transfers = await prisma.transfer.findMany({
        where: {
            transferStatus: "in_transit",
            transferDate: { lt: sevenDaysAgo },
        },
        include: {
            asset: { select: { serialNumber: true } },
            quantityItem: { select: { itemCategory: true } },
        },
        orderBy: { transferDate: "asc" },
    });

    return transfers.map((t) => {
        const diff = Math.floor(
            (today().getTime() - t.transferDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        return {
            itemLabel: t.asset?.serialNumber ?? t.quantityItem?.itemCategory ?? "Unknown",
            originLocation: t.originLocation,
            destinationLocation: t.destinationLocation,
            transferDate: t.transferDate,
            daysInTransit: diff,
        };
    });
}

export async function fetchAllAlerts(): Promise<DashboardAlerts> {
    const [
        overdueReturns,
        downedEquipment,
        expiringContracts,
        lowStockItems,
        overdueTickets,
        stalledTransfers,
    ] = await Promise.all([
        fetchOverdueReturns(),
        fetchDownedEquipmentAlerts(),
        fetchExpiringContracts(),
        fetchLowStockItems(),
        fetchOverdueTickets(),
        fetchStalledTransfers(),
    ]);

    const totalAlertCount =
        overdueReturns.length +
        downedEquipment.length +
        expiringContracts.length +
        lowStockItems.length +
        overdueTickets.length +
        stalledTransfers.length;

    return {
        overdueReturns,
        downedEquipment,
        expiringContracts,
        lowStockItems,
        overdueTickets,
        stalledTransfers,
        totalAlertCount,
    };
}
