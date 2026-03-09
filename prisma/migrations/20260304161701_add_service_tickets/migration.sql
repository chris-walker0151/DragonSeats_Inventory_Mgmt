-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('open', 'in_progress', 'pending_parts', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ProblemCategory" AS ENUM ('damage', 'major_repair', 'missing_parts', 'refurbishment', 'warranty', 'other');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "ResolutionOutcome" AS ENUM ('repaired_to_available', 'refurbished', 'retired', 'cannibalized', 'returned_to_manufacturer');

-- CreateTable
CREATE TABLE "service_tickets" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "hub" "WarehouseLocation" NOT NULL,
    "ticket_status" "TicketStatus" NOT NULL DEFAULT 'open',
    "date_down_started" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "problem_category" "ProblemCategory" NOT NULL,
    "priority" "TicketPriority" NOT NULL DEFAULT 'medium',
    "detailed_notes" TEXT,
    "assigned_technician" TEXT,
    "target_completion_date" DATE,
    "resolution_outcome" "ResolutionOutcome",
    "resolution_notes" TEXT,
    "resolved_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_tickets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "serialized_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
