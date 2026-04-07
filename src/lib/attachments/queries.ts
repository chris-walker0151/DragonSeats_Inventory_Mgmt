/**
 * Attachment CRUD query functions.
 *
 * File storage is abstracted — the URL stored in the database could point
 * to local filesystem (MVP) or S3/cloud storage (production).
 */

import { prisma } from "@/lib/db";
import type { AttachmentRecord, AttachmentCreateInput } from "./types";

/** Create a new attachment metadata record. */
export async function createAttachment(
    input: AttachmentCreateInput,
): Promise<AttachmentRecord> {
    return prisma.attachment.create({
        data: {
            recordId: input.recordId,
            collectionName: input.collectionName,
            fileName: input.fileName,
            fileUrl: input.fileUrl,
            fileSize: input.fileSize,
            mimeType: input.mimeType,
            uploadedBy: input.uploadedBy ?? null,
        },
    });
}

/** Fetch all attachments for a specific record. */
export async function fetchAttachments(
    recordId: string,
    collectionName: string,
): Promise<AttachmentRecord[]> {
    return prisma.attachment.findMany({
        where: { recordId, collectionName },
        orderBy: { createdAt: "desc" },
    });
}

/** Fetch a single attachment by ID. */
export async function fetchAttachmentById(
    id: string,
): Promise<AttachmentRecord | null> {
    return prisma.attachment.findUnique({ where: { id } });
}

/** Delete an attachment metadata record. Returns the deleted record. */
export async function deleteAttachment(
    id: string,
): Promise<AttachmentRecord> {
    return prisma.attachment.delete({ where: { id } });
}
