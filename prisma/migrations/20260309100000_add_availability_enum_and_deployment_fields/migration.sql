-- CreateEnum: AssetAvailability
CREATE TYPE "AssetAvailability" AS ENUM ('available', 'reserved', 'deployed', 'down');

-- CreateEnum: GameType
CREATE TYPE "GameType" AS ENUM ('home', 'away');

-- Drop the old text availability column and re-add as enum
ALTER TABLE "serialized_assets" DROP COLUMN IF EXISTS "availability";
ALTER TABLE "serialized_assets" ADD COLUMN "availability" "AssetAvailability" NOT NULL DEFAULT 'available';

-- Backfill availability from existing lifecycle_status
UPDATE "serialized_assets" SET "availability" = 'deployed' WHERE "lifecycle_status" = 'deployed_customer';
UPDATE "serialized_assets" SET "availability" = 'reserved' WHERE "lifecycle_status" = 'in_warehouse_reserved';
-- All others (ordered, in_warehouse_available, retired) default to 'available'

-- Add new fields to deployments table
ALTER TABLE "deployments" ADD COLUMN "game_type" "GameType";
ALTER TABLE "deployments" ADD COLUMN "transport_vendor" TEXT;
