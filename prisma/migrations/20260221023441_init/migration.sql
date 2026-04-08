-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('bench', 'heater', 'ac_unit', 'compressor', 'cooling_tower', 'shader', 'hot_box');

-- CreateEnum
CREATE TYPE "LifecycleStatus" AS ENUM ('ordered', 'in_warehouse_available', 'in_warehouse_reserved', 'deployed_customer', 'retired');

-- CreateEnum
CREATE TYPE "WarehouseLocation" AS ENUM ('cleveland_warehouse', 'kansas_city_warehouse', 'jacksonville_warehouse', 'deployed_customer');

-- CreateEnum
CREATE TYPE "LeagueType" AS ENUM ('nfl', 'ncaa_fbs', 'ncaa_fcs', 'other');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('seasonal_rental', 'multi_year_lease');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('active', 'inactive', 'prospect');

-- CreateEnum
CREATE TYPE "BrandingStatus" AS ENUM ('unbranded', 'branded');

-- CreateEnum
CREATE TYPE "BrandingType" AS ENUM ('team', 'one_off_event', 'other');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('initiated', 'in_transit', 'received', 'cancelled');

-- CreateTable
CREATE TABLE "sku_master" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "product_category" "ProductCategory" NOT NULL,
    "product_description" TEXT NOT NULL,
    "is_serialized" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sku_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_customers" (
    "id" TEXT NOT NULL,
    "team_name" TEXT NOT NULL,
    "league" "LeagueType" NOT NULL,
    "organization_legal_name" TEXT NOT NULL,
    "primary_contact_name" TEXT,
    "primary_contact_email" TEXT,
    "primary_contact_phone" TEXT,
    "stadium_name" TEXT,
    "stadium_address" TEXT,
    "contract_type" "ContractType" NOT NULL,
    "contract_start_date" DATE,
    "contract_end_date" DATE,
    "active_status" "CustomerStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "serialized_assets" (
    "id" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "sku_id" TEXT,
    "product_category" "ProductCategory" NOT NULL,
    "product_type_model" TEXT,
    "lifecycle_status" "LifecycleStatus" NOT NULL DEFAULT 'in_warehouse_available',
    "current_location" "WarehouseLocation" NOT NULL,
    "customer_id" TEXT,
    "date_acquired" DATE,
    "responsible_person" TEXT,
    "notes" TEXT,
    "manufacturer" TEXT,
    "bench_type" TEXT,
    "flange_or_diffuser" TEXT,
    "wheel_type" TEXT,
    "vent_holes" BOOLEAN,
    "year_manufactured" INTEGER,
    "branding_status" "BrandingStatus",
    "branding_type" "BrandingType",
    "branding_description" TEXT,
    "heater_type" TEXT,
    "btu_level" TEXT,
    "btu_rating" INTEGER,
    "amps" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "serialized_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quantity_inventory" (
    "id" TEXT NOT NULL,
    "item_category" TEXT NOT NULL,
    "item_variant" TEXT,
    "location" "WarehouseLocation" NOT NULL,
    "quantity_on_hand" INTEGER NOT NULL DEFAULT 0,
    "reorder_level" INTEGER NOT NULL DEFAULT 0,
    "last_count_date" DATE,
    "responsible_person" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quantity_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployments" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "deployment_date" DATE NOT NULL,
    "expected_return_date" DATE,
    "actual_return_date" DATE,
    "deployment_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deployments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT,
    "item_id" TEXT,
    "quantity" INTEGER,
    "origin_location" "WarehouseLocation" NOT NULL,
    "destination_location" "WarehouseLocation" NOT NULL,
    "transfer_date" DATE NOT NULL,
    "transfer_initiated_by" TEXT,
    "transfer_received_by" TEXT,
    "transfer_status" "TransferStatus" NOT NULL DEFAULT 'initiated',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sku_master_sku_key" ON "sku_master"("sku");

-- AddForeignKey
ALTER TABLE "serialized_assets" ADD CONSTRAINT "serialized_assets_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "sku_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serialized_assets" ADD CONSTRAINT "serialized_assets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "inventory_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "serialized_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "inventory_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "serialized_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "quantity_inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
