-- CreateEnum
CREATE TYPE "ObligationType" AS ENUM ('home', 'road', 'both');

-- AlterTable
ALTER TABLE "inventory_customers" ADD COLUMN "bench_count" INTEGER,
ADD COLUMN "obligation_type" "ObligationType",
ADD COLUMN "branding_required" BOOLEAN NOT NULL DEFAULT false;
