-- AlterTable: Add QR code fields to serialized_assets
ALTER TABLE "serialized_assets" ADD COLUMN "qr_code_url" TEXT;
ALTER TABLE "serialized_assets" ADD COLUMN "qr_code_payload" TEXT;
