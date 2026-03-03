import type { ImportColumnMapping } from "./types";

export const SERIALIZED_ASSET_COLUMNS: ImportColumnMapping[] = [
    { sourceColumn: "Asset Number", targetField: "serialNumber", required: true },
    { sourceColumn: "Asset Type", targetField: "productTypeModel", required: false },
    { sourceColumn: "Manufacturer", targetField: "manufacturer", required: false },
    { sourceColumn: "DS Plate Number", targetField: "dsPlateNumber", required: false },
    { sourceColumn: "Condition", targetField: "condition", required: false },
    { sourceColumn: "Status", targetField: "benchStatus", required: false },
    { sourceColumn: "Warehouse Location", targetField: "warehouseLocation", required: true },
    { sourceColumn: "Manifold Style", targetField: "manifoldStyle", required: false },
    { sourceColumn: "Deck Type", targetField: "deckType", required: false },
    { sourceColumn: "Seat Type", targetField: "seatType", required: false },
    { sourceColumn: "Wheel Style", targetField: "wheelType", required: false },
    { sourceColumn: "Compressor Holes", targetField: "compressorHoles", required: false },
    { sourceColumn: "AC Holes", targetField: "acHoles", required: false },
    { sourceColumn: "Notes", targetField: "notes", required: false },
    { sourceColumn: "Team Allocated 2024", targetField: "teamAllocated2024", required: false },
    { sourceColumn: "Team Allocated 2025", targetField: "teamAllocated2025", required: false },
];

export const QUANTITY_INVENTORY_COLUMNS: ImportColumnMapping[] = [
    { sourceColumn: "Item Category", targetField: "itemCategory", required: true },
    { sourceColumn: "Item Variant", targetField: "itemVariant", required: false },
    { sourceColumn: "Location", targetField: "location", required: true },
    { sourceColumn: "Quantity on Hand", targetField: "quantityOnHand", required: true },
    { sourceColumn: "Reorder Level", targetField: "reorderLevel", required: false },
    { sourceColumn: "Responsible Person", targetField: "responsiblePerson", required: false },
];

export const CUSTOMER_COLUMNS: ImportColumnMapping[] = [
    { sourceColumn: "Team Name", targetField: "teamName", required: true },
    { sourceColumn: "League", targetField: "league", required: true },
    { sourceColumn: "Organization Legal Name", targetField: "organizationLegalName", required: true },
    { sourceColumn: "Contract Type", targetField: "contractType", required: true },
    { sourceColumn: "Primary Contact Name", targetField: "primaryContactName", required: false },
    { sourceColumn: "Primary Contact Email", targetField: "primaryContactEmail", required: false },
    { sourceColumn: "Primary Contact Phone", targetField: "primaryContactPhone", required: false },
    { sourceColumn: "Stadium Name", targetField: "stadiumName", required: false },
    { sourceColumn: "Stadium Address", targetField: "stadiumAddress", required: false },
    { sourceColumn: "Status", targetField: "activeStatus", required: false },
];
