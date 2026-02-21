/**
 * TypeScript types for the Deployments page.
 * Mirrors database schema for deployments table.
 */

import type { ProductCategory } from "@/generated/prisma";

export interface DeploymentListItem {
    id: string;
    assetId: string;
    customerId: string;
    deploymentDate: Date;
    expectedReturnDate: Date | null;
    actualReturnDate: Date | null;
    deploymentNotes: string | null;
    createdAt: Date;
    updatedAt: Date;
    assetSerialNumber: string;
    assetProductCategory: ProductCategory;
    customerName: string;
}
