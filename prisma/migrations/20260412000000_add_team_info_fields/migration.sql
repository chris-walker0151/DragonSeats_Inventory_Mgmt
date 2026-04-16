-- AlterEnum: Add new league types for college conferences
ALTER TYPE "LeagueType" ADD VALUE 'big_10';
ALTER TYPE "LeagueType" ADD VALUE 'sec';
ALTER TYPE "LeagueType" ADD VALUE 'acc';
ALTER TYPE "LeagueType" ADD VALUE 'big_12';

-- AlterTable: Add team info fields to inventory_customers
ALTER TABLE "inventory_customers" ADD COLUMN "road_contact_name" TEXT;
ALTER TABLE "inventory_customers" ADD COLUMN "loading_dock" TEXT;
ALTER TABLE "inventory_customers" ADD COLUMN "field_type" TEXT;
ALTER TABLE "inventory_customers" ADD COLUMN "sideline_setup_notes" TEXT;
ALTER TABLE "inventory_customers" ADD COLUMN "sideline_setup_diagram" TEXT;
ALTER TABLE "inventory_customers" ADD COLUMN "home_benches" INTEGER;
ALTER TABLE "inventory_customers" ADD COLUMN "home_shaders" TEXT;
ALTER TABLE "inventory_customers" ADD COLUMN "home_cooling" TEXT;
ALTER TABLE "inventory_customers" ADD COLUMN "home_heat" TEXT;
ALTER TABLE "inventory_customers" ADD COLUMN "road_benches" INTEGER;
ALTER TABLE "inventory_customers" ADD COLUMN "road_shaders" TEXT;
ALTER TABLE "inventory_customers" ADD COLUMN "road_cooling" TEXT;
ALTER TABLE "inventory_customers" ADD COLUMN "road_heat" TEXT;
ALTER TABLE "inventory_customers" ADD COLUMN "notes" TEXT;
