/**
 * TypeScript types for the Attachments feature.
 */

export interface AttachmentRecord {
    id: string;
    recordId: string;
    collectionName: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: string | null;
    createdAt: Date;
}

export interface AttachmentCreateInput {
    recordId: string;
    collectionName: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedBy?: string;
}
