/**
 * Constants for the SKU Master page.
 * Category codes used in SKU generation.
 */

import type { ProductCategory } from "@/generated/prisma";

export const SKU_CATEGORY_CODES: Record<ProductCategory, string> = {
    bench: "BN",
    heater: "HT",
    ac_unit: "AC",
    compressor: "CP",
    cooling_tower: "CT",
    shader: "SH",
    hot_box: "HB",
};
