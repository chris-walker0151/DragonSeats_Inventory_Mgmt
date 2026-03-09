/**
 * TypeScript types for the Service Tickets page.
 * Mirrors database schema for service_tickets table.
 */

import type {
    WarehouseLocation,
    TicketStatus,
    ProblemCategory,
    TicketPriority,
    ResolutionOutcome,
} from "@/generated/prisma/client";

/** An asset with "Down" availability, shown in the downed equipment report. */
export interface DownedAssetListItem {
    id: string;
    serialNumber: string;
    productTypeModel: string | null;
    availability: string | null;
    benchStatus: string | null;
    condition: string | null;
    currentLocation: WarehouseLocation;
    downedDate: Date | null;
    daysDown: number | null;
    assignedTechnician: string | null;
}

export interface DownedEquipmentSummary {
    downedCount: number;
    downed30PlusCount: number;
}

export interface ServiceTicketListItem {
    id: string;
    assetId: string;
    assetSerialNumber: string;
    assetProductCategory: string;
    hub: WarehouseLocation;
    ticketStatus: TicketStatus;
    dateDownStarted: Date;
    daysDown: number;
    problemCategory: ProblemCategory;
    priority: TicketPriority;
    assignedTechnician: string | null;
    targetCompletionDate: Date | null;
    detailedNotes: string | null;
    resolutionOutcome: ResolutionOutcome | null;
}

export interface ServiceTicketDetail {
    id: string;
    assetId: string;
    hub: WarehouseLocation;
    ticketStatus: TicketStatus;
    dateDownStarted: Date;
    daysDown: number;
    problemCategory: ProblemCategory;
    priority: TicketPriority;
    detailedNotes: string | null;
    assignedTechnician: string | null;
    targetCompletionDate: Date | null;
    resolutionOutcome: ResolutionOutcome | null;
    resolutionNotes: string | null;
    resolvedDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    asset: {
        id: string;
        serialNumber: string;
        productCategory: string;
        productTypeModel: string | null;
        condition: string | null;
        manufacturer: string | null;
    };
}

export interface ServiceTicketSummary {
    totalOpen: number;
    byCritical: number;
    byHigh: number;
    byMedium: number;
    byLow: number;
    avgDaysOpen: number;
    overdueCount: number;
    downedBenchCount: number;
}
