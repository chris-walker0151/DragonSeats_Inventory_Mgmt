-- AlterEnum
ALTER TYPE "LifecycleStatus" ADD VALUE IF NOT EXISTS 'down';

-- AlterTable
ALTER TABLE "deployments" ADD COLUMN IF NOT EXISTS "transport_vendor" TEXT;
