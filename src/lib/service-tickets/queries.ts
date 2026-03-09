/**
 * Server-side Prisma queries for the Service Tickets page.
 * These run in server components and server actions only.
 */

import { prisma } from "@/lib/db";
import type {
    WarehouseLocation,
    TicketStatus,
    ProblemCategory,
    TicketPriority,
    ResolutionOutcome,
} from "@/generated/prisma/client";
import type {
    DownedAssetListItem,
    DownedEquipmentSummary,
    ServiceTicketListItem,
    ServiceTicketDetail,
    ServiceTicketSummary,
} from "./types";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Calculate days between a start date and today (or an end date). */
function calcDaysDown(start: Date, end?: Date | null): number {
    const endDate = end ?? new Date();
    const diff = endDate.getTime() - new Date(start).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

// ─── Downed Equipment Queries ────────────────────────────────────────────────

/**
 * Fetch all serialized assets with availability = "Down".
 * Joins with the most recent active service ticket for downed date and technician.
 */
export async function fetchDownedAssets(): Promise<DownedAssetListItem[]> {
    const openStatuses: TicketStatus[] = ["open", "in_progress", "pending_parts"];

    const assets = await prisma.serializedAsset.findMany({
        where: { availability: "down" },
        include: {
            serviceTickets: {
                where: { ticketStatus: { in: openStatuses } },
                orderBy: { dateDownStarted: "desc" },
                take: 1,
                select: {
                    dateDownStarted: true,
                    assignedTechnician: true,
                },
            },
        },
        orderBy: { serialNumber: "asc" },
    });

    return assets.map((a) => {
        const ticket = a.serviceTickets[0] ?? null;
        const downedDate = ticket?.dateDownStarted ?? null;
        return {
            id: a.id,
            serialNumber: a.serialNumber,
            productTypeModel: a.productTypeModel,
            availability: a.availability,
            benchStatus: a.benchStatus,
            condition: a.condition,
            currentLocation: a.currentLocation,
            downedDate,
            daysDown: downedDate ? calcDaysDown(downedDate) : null,
            assignedTechnician: ticket?.assignedTechnician ?? null,
        };
    });
}

/**
 * Fetch summary count of downed equipment (assets with availability = "Down").
 */
export async function fetchDownedEquipmentSummary(): Promise<DownedEquipmentSummary> {
    const openStatuses: TicketStatus[] = ["open", "in_progress", "pending_parts"];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [downedCount, downed30PlusCount] = await Promise.all([
        prisma.serializedAsset.count({
            where: { availability: "down" },
        }),
        prisma.serializedAsset.count({
            where: {
                availability: "down",
                serviceTickets: {
                    some: {
                        ticketStatus: { in: openStatuses },
                        dateDownStarted: { lte: thirtyDaysAgo },
                    },
                },
            },
        }),
    ]);
    return { downedCount, downed30PlusCount };
}

// ─── Service Ticket Queries ─────────────────────────────────────────────────

/**
 * Fetch all service tickets with asset info for the list view.
 */
export async function fetchServiceTicketsList(): Promise<ServiceTicketListItem[]> {
    const tickets = await prisma.serviceTicket.findMany({
        include: {
            asset: {
                select: {
                    serialNumber: true,
                    productCategory: true,
                },
            },
        },
        orderBy: [
            { ticketStatus: "asc" },
            { priority: "desc" },
            { dateDownStarted: "asc" },
        ],
    });

    return tickets.map((t) => ({
        id: t.id,
        assetId: t.assetId,
        assetSerialNumber: t.asset.serialNumber,
        assetProductCategory: t.asset.productCategory,
        hub: t.hub,
        ticketStatus: t.ticketStatus,
        dateDownStarted: t.dateDownStarted,
        daysDown: calcDaysDown(t.dateDownStarted, t.resolvedDate),
        problemCategory: t.problemCategory,
        priority: t.priority,
        assignedTechnician: t.assignedTechnician,
        targetCompletionDate: t.targetCompletionDate,
        detailedNotes: t.detailedNotes,
        resolutionOutcome: t.resolutionOutcome,
    }));
}

/**
 * Fetch full detail for a single service ticket.
 */
export async function fetchServiceTicketDetail(
    id: string,
): Promise<ServiceTicketDetail | null> {
    const ticket = await prisma.serviceTicket.findUnique({
        where: { id },
        include: {
            asset: {
                select: {
                    id: true,
                    serialNumber: true,
                    productCategory: true,
                    productTypeModel: true,
                    condition: true,
                    manufacturer: true,
                },
            },
        },
    });

    if (!ticket) return null;

    return {
        id: ticket.id,
        assetId: ticket.assetId,
        hub: ticket.hub,
        ticketStatus: ticket.ticketStatus,
        dateDownStarted: ticket.dateDownStarted,
        daysDown: calcDaysDown(ticket.dateDownStarted, ticket.resolvedDate),
        problemCategory: ticket.problemCategory,
        priority: ticket.priority,
        detailedNotes: ticket.detailedNotes,
        assignedTechnician: ticket.assignedTechnician,
        targetCompletionDate: ticket.targetCompletionDate,
        resolutionOutcome: ticket.resolutionOutcome,
        resolutionNotes: ticket.resolutionNotes,
        resolvedDate: ticket.resolvedDate,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        asset: ticket.asset,
    };
}

/**
 * Fetch summary statistics for open service tickets.
 * Used for the summary cards at the top of the page.
 */
export async function fetchServiceTicketSummary(): Promise<ServiceTicketSummary> {
    const openStatuses: TicketStatus[] = ["open", "in_progress", "pending_parts"];

    const [openTickets, overdueCount, downedBenchCount] = await Promise.all([
        prisma.serviceTicket.findMany({
            where: { ticketStatus: { in: openStatuses } },
            select: {
                priority: true,
                dateDownStarted: true,
                targetCompletionDate: true,
            },
        }),
        prisma.serviceTicket.count({
            where: {
                ticketStatus: { in: openStatuses },
                targetCompletionDate: { lt: new Date() },
            },
        }),
        // Count assets with condition "Down" that have open service tickets
        prisma.serializedAsset.count({
            where: {
                condition: { equals: "Down", mode: "insensitive" },
                serviceTickets: {
                    some: { ticketStatus: { in: openStatuses } },
                },
            },
        }),
    ]);

    const totalOpen = openTickets.length;
    const byCritical = openTickets.filter((t) => t.priority === "critical").length;
    const byHigh = openTickets.filter((t) => t.priority === "high").length;
    const byMedium = openTickets.filter((t) => t.priority === "medium").length;
    const byLow = openTickets.filter((t) => t.priority === "low").length;

    const totalDays = openTickets.reduce(
        (sum, t) => sum + calcDaysDown(t.dateDownStarted),
        0,
    );
    const avgDaysOpen = totalOpen > 0 ? Math.round(totalDays / totalOpen) : 0;

    return {
        totalOpen,
        byCritical,
        byHigh,
        byMedium,
        byLow,
        avgDaysOpen,
        overdueCount,
        downedBenchCount,
    };
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export interface TicketCreateInput {
    assetId: string;
    hub: WarehouseLocation;
    problemCategory: ProblemCategory;
    priority?: TicketPriority;
    detailedNotes?: string | null;
    assignedTechnician?: string | null;
    targetCompletionDate?: string | null;
    dateDownStarted?: string | null;
}

export interface TicketUpdateInput {
    ticketStatus?: TicketStatus;
    problemCategory?: ProblemCategory;
    priority?: TicketPriority;
    detailedNotes?: string | null;
    assignedTechnician?: string | null;
    targetCompletionDate?: string | null;
    resolutionOutcome?: ResolutionOutcome | null;
    resolutionNotes?: string | null;
}

export async function createServiceTicket(input: TicketCreateInput) {
    return prisma.serviceTicket.create({
        data: {
            assetId: input.assetId,
            hub: input.hub,
            problemCategory: input.problemCategory,
            priority: input.priority ?? "medium",
            detailedNotes: input.detailedNotes ?? null,
            assignedTechnician: input.assignedTechnician ?? null,
            targetCompletionDate: input.targetCompletionDate
                ? new Date(input.targetCompletionDate)
                : null,
            dateDownStarted: input.dateDownStarted
                ? new Date(input.dateDownStarted)
                : new Date(),
        },
    });
}

export async function updateServiceTicket(id: string, input: TicketUpdateInput) {
    const data: Record<string, unknown> = {};

    if (input.ticketStatus !== undefined) data.ticketStatus = input.ticketStatus;
    if (input.problemCategory !== undefined) data.problemCategory = input.problemCategory;
    if (input.priority !== undefined) data.priority = input.priority;
    if (input.detailedNotes !== undefined) data.detailedNotes = input.detailedNotes;
    if (input.assignedTechnician !== undefined) data.assignedTechnician = input.assignedTechnician;
    if (input.targetCompletionDate !== undefined) {
        data.targetCompletionDate = input.targetCompletionDate
            ? new Date(input.targetCompletionDate)
            : null;
    }
    if (input.resolutionOutcome !== undefined) data.resolutionOutcome = input.resolutionOutcome;
    if (input.resolutionNotes !== undefined) data.resolutionNotes = input.resolutionNotes;

    // Auto-set resolvedDate when status changes to completed
    if (input.ticketStatus === "completed") {
        data.resolvedDate = new Date();
    }
    // Clear resolvedDate if re-opening
    if (input.ticketStatus === "open" || input.ticketStatus === "in_progress") {
        data.resolvedDate = null;
    }

    return prisma.serviceTicket.update({ where: { id }, data });
}

/**
 * Fetch assets for the ticket creation dropdown.
 */
export async function fetchAssetsForTicketDropdown() {
    return prisma.serializedAsset.findMany({
        select: {
            id: true,
            serialNumber: true,
            currentLocation: true,
            productCategory: true,
        },
        orderBy: { serialNumber: "asc" },
    });
}
