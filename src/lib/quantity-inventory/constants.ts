/**
 * Constants for the Quantity Inventory page.
 * Item category options and related labels.
 */

export const ITEM_CATEGORY_OPTIONS = [
    "Heater Ducts",
    "AC Ducts",
    "Extension Cords",
    "Wheel-set Hardware",
    "Hoses & Fittings",
    "Electrical Components",
    "Replacement Fans",
    "Filters",
    "Gaskets & Seals",
    "Fasteners",
    "Control Boards",
    "Thermostats",
    "Igniters",
    "Gas Valves",
    "Burner Assemblies",
    "Casters & Wheels",
    "Bench Covers",
    "Branding Wraps",
    "Safety Equipment",
    "Tools & Consumables",
] as const;

export type ItemCategoryOption = (typeof ITEM_CATEGORY_OPTIONS)[number];
