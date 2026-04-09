/**
 * Saved Views CRUD query functions.
 *
 * Filters, sortBy, and visibleColumns are stored as JSON strings in the
 * database and parsed/serialised in these functions.
 */

import { prisma } from "@/lib/db";
import type {
    SavedViewRecord,
    SavedViewCreateInput,
    ParsedSavedView,
} from "./types";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Parse a SavedView database row into a UI-ready object. */
export function parseSavedView(row: SavedViewRecord): ParsedSavedView {
    return {
        id: row.id,
        name: row.name,
        isDefault: row.isDefault,
        filters: row.filters ? JSON.parse(row.filters) : {},
        sortBy: row.sortBy ? JSON.parse(row.sortBy) : [],
        groupBy: row.groupBy,
        visibleColumns: row.visibleColumns
            ? JSON.parse(row.visibleColumns)
            : [],
    };
}

// ─── CRUD ───────────────────────────────────────────────────────────────────

/** Create a new saved view. */
export async function createSavedView(
    input: SavedViewCreateInput,
): Promise<SavedViewRecord> {
    return prisma.savedView.create({
        data: {
            collectionSlug: input.collectionSlug,
            name: input.name,
            filters: input.filters ? JSON.stringify(input.filters) : "{}",
            sortBy: input.sortBy ? JSON.stringify(input.sortBy) : "[]",
            groupBy: input.groupBy ?? null,
            visibleColumns: input.visibleColumns
                ? JSON.stringify(input.visibleColumns)
                : "[]",
            createdBy: input.createdBy ?? null,
        },
    });
}

/** Fetch all saved views for a collection. */
export async function fetchSavedViews(
    collectionSlug: string,
): Promise<SavedViewRecord[]> {
    return prisma.savedView.findMany({
        where: { collectionSlug },
        orderBy: { name: "asc" },
    });
}

/** Delete a saved view by ID. */
export async function deleteSavedView(id: string): Promise<void> {
    await prisma.savedView.delete({ where: { id } });
}

/**
 * Set a view as the default for its collection.
 * Unsets any other default for the same collection first.
 */
export async function setDefaultView(
    id: string,
    collectionSlug: string,
): Promise<void> {
    await prisma.$transaction([
        // Unset existing defaults for this collection
        prisma.savedView.updateMany({
            where: { collectionSlug, isDefault: true },
            data: { isDefault: false },
        }),
        // Set the new default
        prisma.savedView.update({
            where: { id },
            data: { isDefault: true },
        }),
    ]);
}

/** Unset the default flag on a view. */
export async function unsetDefaultView(id: string): Promise<void> {
    await prisma.savedView.update({
        where: { id },
        data: { isDefault: false },
    });
}
