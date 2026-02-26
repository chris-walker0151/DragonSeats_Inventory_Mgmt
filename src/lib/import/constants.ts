import type { ImportColumnMapping } from "./types";

export const SERIALIZED_ASSET_COLUMNS: ImportColumnMapping[] = [
    { sourceColumn: "Serial Number", targetField: "serialNumber", required: true },
    { sourceColumn: "Product Category", targetField: "productCategory", required: true },
    { sourceColumn: "Product Type/Model", targetField: "productTypeModel", required: false },
    { sourceColumn: "Lifecycle Status", targetField: "lifecycleStatus", required: false },
    { sourceColumn: "Current Location", targetField: "currentLocation", required: true },
    { sourceColumn: "Customer", targetField: "customerName", required: false },
    { sourceColumn: "Year Manufactured", targetField: "yearManufactured", required: false },
    { sourceColumn: "Manufacturer", targetField: "manufacturer", required: false },
    { sourceColumn: "SKU", targetField: "skuCode", required: false },
    { sourceColumn: "Notes", targetField: "notes", required: false },
    { sourceColumn: "Bench Type", targetField: "benchType", required: false },
    { sourceColumn: "Flange/Diffuser", targetField: "flangeOrDiffuser", required: false },
    { sourceColumn: "Wheel Type", targetField: "wheelType", required: false },
    { sourceColumn: "Branding Status", targetField: "brandingStatus", required: false },
    { sourceColumn: "Heater Type", targetField: "heaterType", required: false },
    { sourceColumn: "BTU Level", targetField: "btuLevel", required: false },
    { sourceColumn: "BTU Rating", targetField: "btuRating", required: false },
    { sourceColumn: "Amps", targetField: "amps", required: false },
    { sourceColumn: "Maintenance Notes", targetField: "maintenanceNotes", required: false },
    { sourceColumn: "Last Refurbished Date", targetField: "lastRefurbishedDate", required: false },
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
