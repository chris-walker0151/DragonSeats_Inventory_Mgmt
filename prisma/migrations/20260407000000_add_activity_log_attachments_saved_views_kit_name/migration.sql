-- AlterTable: Add kitName to serialized_assets
ALTER TABLE "serialized_assets" ADD COLUMN "kit_name" TEXT;

-- CreateTable: activity_log
CREATE TABLE "activity_log" (
    "id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "collection_name" TEXT NOT NULL,
    "user_id" TEXT,
    "method" TEXT NOT NULL DEFAULT 'Manual / Web',
    "summary" TEXT NOT NULL,
    "field_changed" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable: attachments
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "collection_name" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: saved_views
CREATE TABLE "saved_views" (
    "id" TEXT NOT NULL,
    "collection_slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filters" TEXT DEFAULT '{}',
    "sort_by" TEXT DEFAULT '[]',
    "group_by" TEXT,
    "visible_columns" TEXT DEFAULT '[]',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_log_record_id_collection_name_idx" ON "activity_log"("record_id", "collection_name");
CREATE INDEX "activity_log_created_at_idx" ON "activity_log"("created_at");
CREATE INDEX "attachments_record_id_collection_name_idx" ON "attachments"("record_id", "collection_name");
CREATE INDEX "saved_views_collection_slug_idx" ON "saved_views"("collection_slug");
