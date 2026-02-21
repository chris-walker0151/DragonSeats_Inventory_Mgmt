export interface ColumnDefinition {
    name: string;
    type: string;
    description: string;
    required: boolean;
    example: string;
}

export interface TableDefinition {
    tableName: string;
    description: string;
    columns: ColumnDefinition[];
}

export interface EnumDefinition {
    name: string;
    description: string;
    values: { value: string; label: string; description: string }[];
}

export const TABLES: TableDefinition[] = [
    {
        tableName: "serialized_assets",
        description:
            "Master table for all individually tracked equipment with serial numbers. Each physical unit (bench, heater, AC, compressor, cooling tower, shader, hot box) gets its own row.",
        columns: [
            { name: "id", type: "UUID", description: "Auto-generated primary key", required: true, example: "a1b2c3d4-..." },
            { name: "serial_number", type: "Text", description: "Manufacturer-assigned serial number", required: true, example: "DS-BN-2024-001" },
            { name: "sku_id", type: "UUID (FK)", description: "Foreign key to sku_master table", required: false, example: "ref to DS-BN-HT-FL" },
            { name: "product_category", type: "Enum", description: "Type of equipment (bench, heater, ac_unit, etc.)", required: true, example: "bench" },
            { name: "product_type_model", type: "Text", description: "Specific model name within the category", required: false, example: "Heated Bench" },
            { name: "lifecycle_status", type: "Enum", description: "Current lifecycle state of the asset", required: true, example: "in_warehouse_available" },
            { name: "current_location", type: "Enum", description: "Physical location of the asset right now", required: true, example: "cleveland_warehouse" },
            { name: "customer_id", type: "UUID (FK)", description: "Foreign key to customers table (null if in warehouse)", required: false, example: "ref to Cleveland Browns" },
            { name: "date_acquired", type: "Date", description: "Date the asset was purchased or received", required: false, example: "01/15/2024" },
            { name: "responsible_person", type: "Text", description: "Technician or manager responsible for this asset", required: false, example: "Operations Team" },
            { name: "notes", type: "Text", description: "Free-text notes about the asset", required: false, example: "Refurbished unit" },
            { name: "manufacturer", type: "Text", description: "Bench only — manufacturer name", required: false, example: "Dragon Seats" },
            { name: "bench_type", type: "Text", description: "Bench only — Heated or Hybrid", required: false, example: "Heated" },
            { name: "flange_or_diffuser", type: "Text", description: "Bench only — connection type", required: false, example: "Flange" },
            { name: "wheel_type", type: "Text", description: "Bench only — wheel material", required: false, example: "Pneumatic" },
            { name: "vent_holes", type: "Boolean", description: "Bench only — whether bench has vent holes", required: false, example: "true" },
            { name: "year_manufactured", type: "Integer", description: "Bench only — year the bench was manufactured", required: false, example: "2024" },
            { name: "branding_status", type: "Enum", description: "Bench only — whether branded or un-branded", required: false, example: "branded" },
            { name: "branding_type", type: "Enum", description: "Bench only — type of branding (if branded)", required: false, example: "team" },
            { name: "branding_description", type: "Text", description: "Bench only — team name or event name", required: false, example: "Cleveland Browns" },
            { name: "heater_type", type: "Text", description: "Heater only — type of heater", required: false, example: "Modulating" },
            { name: "btu_level", type: "Text", description: "Heater only — BTU output (number or 'Modulating')", required: false, example: "400000" },
            { name: "btu_rating", type: "Integer", description: "AC only — BTU capacity", required: false, example: "15000" },
            { name: "amps", type: "Integer", description: "AC only — amperage draw", required: false, example: "20" },
            { name: "created_at", type: "Timestamp", description: "Record creation timestamp", required: true, example: "2024-01-15T10:00:00Z" },
            { name: "updated_at", type: "Timestamp", description: "Last modification timestamp", required: true, example: "2024-06-01T14:30:00Z" },
        ],
    },
    {
        tableName: "quantity_inventory",
        description:
            "Non-serialized items tracked by count at each warehouse location. Includes ducts, cords, hardware, and other consumable/bulk items.",
        columns: [
            { name: "id", type: "UUID", description: "Auto-generated primary key", required: true, example: "b2c3d4e5-..." },
            { name: "item_category", type: "Text", description: "Name of the item type", required: true, example: "Heater Ducts" },
            { name: "item_variant", type: "Text", description: "Size or generation variant (if applicable)", required: false, example: "12 inch" },
            { name: "location", type: "Enum", description: "Warehouse where the items are stored", required: true, example: "cleveland_warehouse" },
            { name: "quantity_on_hand", type: "Integer", description: "Current count of items available", required: true, example: "45" },
            { name: "reorder_level", type: "Integer", description: "Minimum quantity before reorder is suggested", required: true, example: "20" },
            { name: "last_count_date", type: "Date", description: "Date of the most recent physical count", required: false, example: "01/15/2026" },
            { name: "responsible_person", type: "Text", description: "Person responsible for this inventory at this location", required: false, example: "Operations Team" },
            { name: "created_at", type: "Timestamp", description: "Record creation timestamp", required: true, example: "2024-01-01T00:00:00Z" },
            { name: "updated_at", type: "Timestamp", description: "Last modification timestamp", required: true, example: "2026-01-15T09:00:00Z" },
        ],
    },
    {
        tableName: "customers",
        description:
            "NFL and NCAA team accounts. Each customer represents one venue/stadium. Tracks contact info, contract dates, and active status.",
        columns: [
            { name: "id", type: "UUID", description: "Auto-generated primary key", required: true, example: "c3d4e5f6-..." },
            { name: "team_name", type: "Text", description: "Team display name", required: true, example: "Cleveland Browns" },
            { name: "league", type: "Enum", description: "League affiliation", required: true, example: "nfl" },
            { name: "organization_legal_name", type: "Text", description: "Legal entity name for contracts", required: true, example: "Cleveland Browns Football Company LLC" },
            { name: "primary_contact_name", type: "Text", description: "Main point of contact", required: false, example: "Mike Thompson" },
            { name: "primary_contact_email", type: "Text", description: "Contact email address", required: false, example: "mthompson@clevelandbrowns.com" },
            { name: "primary_contact_phone", type: "Text", description: "Contact phone number", required: false, example: "216-555-0101" },
            { name: "stadium_name", type: "Text", description: "Venue name", required: false, example: "Huntington Bank Field" },
            { name: "stadium_address", type: "Text", description: "Venue street address", required: false, example: "100 Alfred Lerner Way, Cleveland, OH 44114" },
            { name: "contract_type", type: "Enum", description: "Rental agreement type", required: true, example: "multi_year_lease" },
            { name: "contract_start_date", type: "Date", description: "Contract effective date", required: false, example: "06/01/2024" },
            { name: "contract_end_date", type: "Date", description: "Contract expiration date", required: false, example: "05/31/2027" },
            { name: "active_status", type: "Enum", description: "Current customer status", required: true, example: "active" },
            { name: "created_at", type: "Timestamp", description: "Record creation timestamp", required: true, example: "2024-01-01T00:00:00Z" },
            { name: "updated_at", type: "Timestamp", description: "Last modification timestamp", required: true, example: "2024-06-01T14:30:00Z" },
        ],
    },
    {
        tableName: "deployments",
        description:
            "Join table linking serialized assets to customer locations. Tracks when equipment was deployed, expected return, and actual return dates.",
        columns: [
            { name: "id", type: "UUID", description: "Auto-generated primary key", required: true, example: "d4e5f6g7-..." },
            { name: "asset_id", type: "UUID (FK)", description: "Foreign key to serialized_assets", required: true, example: "ref to DS-BN-2023-001" },
            { name: "customer_id", type: "UUID (FK)", description: "Foreign key to customers", required: true, example: "ref to Cleveland Browns" },
            { name: "deployment_date", type: "Date", description: "Date asset was deployed to customer", required: true, example: "09/01/2025" },
            { name: "expected_return_date", type: "Date", description: "Planned return date", required: false, example: "02/15/2026" },
            { name: "actual_return_date", type: "Date", description: "Actual date returned (null if still deployed)", required: false, example: "null" },
            { name: "deployment_notes", type: "Text", description: "Notes about this deployment", required: false, example: "2025-26 season, home sideline" },
            { name: "created_at", type: "Timestamp", description: "Record creation timestamp", required: true, example: "2025-09-01T10:00:00Z" },
            { name: "updated_at", type: "Timestamp", description: "Last modification timestamp", required: true, example: "2025-09-01T10:00:00Z" },
        ],
    },
    {
        tableName: "transfers",
        description:
            "Equipment movement records between warehouses. Supports both serialized assets (one at a time) and quantity items (with quantity field).",
        columns: [
            { name: "id", type: "UUID", description: "Auto-generated primary key", required: true, example: "e5f6g7h8-..." },
            { name: "asset_id", type: "UUID (FK)", description: "Foreign key to serialized_assets (null for quantity items)", required: false, example: "ref to DS-HT-2024-001" },
            { name: "item_id", type: "UUID (FK)", description: "Foreign key to quantity_inventory (null for serialized assets)", required: false, example: "ref to Wheel-set Hardware" },
            { name: "quantity", type: "Integer", description: "Number of items being transferred (quantity items only)", required: false, example: "10" },
            { name: "origin_location", type: "Enum", description: "Warehouse the equipment is being sent from", required: true, example: "cleveland_warehouse" },
            { name: "destination_location", type: "Enum", description: "Warehouse the equipment is being sent to", required: true, example: "kansas_city_warehouse" },
            { name: "transfer_date", type: "Date", description: "Date the transfer was initiated", required: true, example: "02/10/2026" },
            { name: "transfer_initiated_by", type: "Text", description: "Person who started the transfer", required: false, example: "Operations Team" },
            { name: "transfer_received_by", type: "Text", description: "Person who received the shipment", required: false, example: "Sarah Martinez" },
            { name: "transfer_status", type: "Enum", description: "Current status of the transfer", required: true, example: "in_transit" },
            { name: "notes", type: "Text", description: "Notes about this transfer", required: false, example: "Restocking hardware at KC" },
            { name: "created_at", type: "Timestamp", description: "Record creation timestamp", required: true, example: "2026-02-10T08:00:00Z" },
            { name: "updated_at", type: "Timestamp", description: "Last modification timestamp", required: true, example: "2026-02-10T08:00:00Z" },
        ],
    },
    {
        tableName: "sku_master",
        description:
            "Product catalog with SKU naming convention. Each SKU describes a product variant. Supports both serialized and quantity-tracked items.",
        columns: [
            { name: "id", type: "UUID", description: "Auto-generated primary key", required: true, example: "f6g7h8i9-..." },
            { name: "sku", type: "Text (unique)", description: "SKU code following DS-{CAT}-{TYPE}-{SPEC} format", required: true, example: "DS-BN-HT-FL" },
            { name: "product_category", type: "Enum", description: "Product category this SKU belongs to", required: true, example: "bench" },
            { name: "product_description", type: "Text", description: "Human-readable description of the product", required: true, example: "Heated Bench with Flange connections" },
            { name: "is_serialized", type: "Boolean", description: "Whether items with this SKU are individually tracked", required: true, example: "true" },
            { name: "notes", type: "Text", description: "Additional notes about this SKU", required: false, example: "Primary bench model" },
            { name: "created_at", type: "Timestamp", description: "Record creation timestamp", required: true, example: "2024-01-01T00:00:00Z" },
            { name: "updated_at", type: "Timestamp", description: "Last modification timestamp", required: true, example: "2024-01-01T00:00:00Z" },
        ],
    },
];

export const ENUMS: EnumDefinition[] = [
    {
        name: "ProductCategory",
        description: "Types of serialized equipment tracked in the inventory system",
        values: [
            { value: "bench", label: "Bench", description: "Climate-controlled sideline benches (~200 units)" },
            { value: "heater", label: "Heater", description: "Heating units for benches" },
            { value: "ac_unit", label: "AC Unit", description: "Air conditioning units" },
            { value: "compressor", label: "Compressor", description: "Compressor units for AC systems" },
            { value: "cooling_tower", label: "Cooling Tower", description: "Cooling tower units" },
            { value: "shader", label: "Shader", description: "Sun shade/canopy systems" },
            { value: "hot_box", label: "Hot Box", description: "Portable heating enclosures" },
        ],
    },
    {
        name: "LifecycleStatus",
        description: "Current state of a serialized asset in its lifecycle",
        values: [
            { value: "ordered", label: "Ordered/In-Production", description: "Asset has been ordered but not yet received" },
            { value: "in_warehouse_available", label: "In Warehouse — Available", description: "In warehouse and ready for deployment" },
            { value: "in_warehouse_reserved", label: "In Warehouse — Reserved", description: "In warehouse but reserved for upcoming deployment" },
            { value: "deployed_customer", label: "Deployed to Customer", description: "Currently at a customer venue" },
            { value: "retired", label: "Retired", description: "No longer in active service" },
        ],
    },
    {
        name: "WarehouseLocation",
        description: "Physical locations where equipment can be stored or deployed",
        values: [
            { value: "cleveland_warehouse", label: "Cleveland Warehouse", description: "Main warehouse in Cleveland, OH" },
            { value: "kansas_city_warehouse", label: "Kansas City Warehouse", description: "Warehouse in Kansas City, MO" },
            { value: "jacksonville_warehouse", label: "Jacksonville Warehouse", description: "Warehouse in Jacksonville, FL" },
            { value: "deployed_customer", label: "Deployed to Customer", description: "Currently at a customer venue (not in any warehouse)" },
        ],
    },
    {
        name: "LeagueType",
        description: "Sports league classification for customer teams",
        values: [
            { value: "nfl", label: "NFL", description: "National Football League" },
            { value: "ncaa_fbs", label: "NCAA FBS", description: "NCAA Division I Football Bowl Subdivision" },
            { value: "ncaa_fcs", label: "NCAA FCS", description: "NCAA Division I Football Championship Subdivision" },
            { value: "other", label: "Other", description: "Other leagues or events" },
        ],
    },
    {
        name: "ContractType",
        description: "Types of rental/lease agreements",
        values: [
            { value: "seasonal_rental", label: "Seasonal Rental", description: "Single-season equipment rental" },
            { value: "multi_year_lease", label: "Multi-Year Lease", description: "Long-term equipment lease spanning multiple seasons" },
        ],
    },
    {
        name: "CustomerStatus",
        description: "Current state of a customer relationship",
        values: [
            { value: "active", label: "Active", description: "Currently under contract with active equipment" },
            { value: "inactive", label: "Inactive", description: "Previous customer, no active contract" },
            { value: "prospect", label: "Prospect", description: "Potential customer, not yet contracted" },
        ],
    },
    {
        name: "BrandingStatus",
        description: "Whether a bench has team/event branding applied",
        values: [
            { value: "unbranded", label: "Un-branded", description: "No team or event branding — generic stock" },
            { value: "branded", label: "Branded", description: "Has team or event-specific branding applied" },
        ],
    },
    {
        name: "BrandingType",
        description: "Type of branding applied to a branded bench",
        values: [
            { value: "team", label: "Team", description: "Permanent team branding (e.g., team logos/colors)" },
            { value: "one_off_event", label: "One-off Event", description: "Special event branding (e.g., Super Bowl)" },
            { value: "other", label: "Other", description: "Other branding type" },
        ],
    },
    {
        name: "TransferStatus",
        description: "Current state of a warehouse-to-warehouse transfer",
        values: [
            { value: "initiated", label: "Initiated", description: "Transfer has been created but not yet shipped" },
            { value: "in_transit", label: "In Transit", description: "Equipment is currently being transported" },
            { value: "received", label: "Received", description: "Equipment has arrived at destination warehouse" },
            { value: "cancelled", label: "Cancelled", description: "Transfer was cancelled before completion" },
        ],
    },
];

export const SKU_CONVENTION = {
    format: "DS-{CAT}-{TYPE}-{SPEC}",
    prefix: "DS",
    prefixDescription: "Dragon Seats company prefix",
    categoryCodes: [
        { code: "BN", category: "Bench" },
        { code: "HT", category: "Heater" },
        { code: "AC", category: "AC Unit" },
        { code: "CP", category: "Compressor" },
        { code: "CT", category: "Cooling Tower" },
        { code: "SH", category: "Shader" },
        { code: "HB", category: "Hot Box" },
        { code: "QI", category: "Quantity Item" },
    ],
    examples: [
        { sku: "DS-BN-HT-FL", description: "Bench, Heated, Flange connections" },
        { sku: "DS-BN-HY-DF", description: "Bench, Hybrid, Diffuser connections" },
        { sku: "DS-HT-MD", description: "Heater, Modulating" },
        { sku: "DS-HT-400K", description: "Heater, 400K BTU Fixed" },
        { sku: "DS-AC-15K", description: "AC Unit, 15,000 BTU" },
        { sku: "DS-CP-STD", description: "Compressor, Standard" },
        { sku: "DS-QI-HD-12", description: "Quantity Item, Heater Duct, 12 inch" },
    ],
    rules: [
        "Should describe product characteristics (type, model, key specs)",
        "Distinguishes serialized vs quantity-tracked items (QI prefix for quantity)",
        "Does NOT encode location or pricing",
        "Supports branding variants for benches (un-branded vs branded stock)",
        "Future-compatible with ERP/CRM systems",
    ],
};
