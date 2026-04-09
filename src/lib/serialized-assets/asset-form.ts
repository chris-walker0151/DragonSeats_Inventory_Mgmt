/**
 * Shared form types and helpers for the serialized asset create/edit form.
 * Used by both the desktop sheet (asset-detail-sheet.tsx) and the mobile
 * profile page ([id]/asset-profile-client.tsx).
 */

import type {
    ProductCategory,
    LifecycleStatus,
    WarehouseLocation,
    BrandingStatus,
    AssetAvailability,
} from "@/generated/prisma/client";
import type { SerializedAssetDetail } from "./types";

export interface AssetFormData {
    serialNumber: string;
    productCategory: ProductCategory;
    productTypeModel: string;
    lifecycleStatus: LifecycleStatus;
    currentLocation: WarehouseLocation;
    customerId: string;
    manufacturer: string;
    yearManufactured: string;
    notes: string;
    benchType: string;
    flangeOrDiffuser: string;
    wheelType: string;
    brandingStatus: string;
    brandingDescription: string;
    condition: string;
    benchStatus: string;
    availability: string;
    manifoldStyle: string;
    deckType: string;
    seatType: string;
    compressorHoles: string;
    acHoles: string;
    dsPlateNumber: string;
    deployedLocationName: string;
    teamAllocated2024: string;
    teamAllocated2025: string;
    heaterType: string;
    btuLevel: string;
    btuRating: string;
    amps: string;
    maintenanceNotes: string;
}

export const EMPTY_FORM: AssetFormData = {
    serialNumber: "",
    productCategory: "bench",
    productTypeModel: "",
    lifecycleStatus: "in_warehouse_available",
    currentLocation: "cleveland_warehouse",
    customerId: "",
    manufacturer: "",
    yearManufactured: "",
    notes: "",
    benchType: "",
    flangeOrDiffuser: "",
    wheelType: "",
    brandingStatus: "",
    brandingDescription: "",
    condition: "",
    benchStatus: "",
    availability: "available",
    manifoldStyle: "",
    deckType: "",
    seatType: "",
    compressorHoles: "",
    acHoles: "",
    dsPlateNumber: "",
    deployedLocationName: "",
    teamAllocated2024: "",
    teamAllocated2025: "",
    heaterType: "",
    btuLevel: "",
    btuRating: "",
    amps: "",
    maintenanceNotes: "",
};

export function detailToForm(detail: SerializedAssetDetail): AssetFormData {
    return {
        serialNumber: detail.serialNumber,
        productCategory: detail.productCategory,
        productTypeModel: detail.productTypeModel ?? "",
        lifecycleStatus: detail.lifecycleStatus,
        currentLocation: detail.currentLocation,
        customerId: detail.customerId ?? "",
        manufacturer: detail.manufacturer ?? "",
        yearManufactured: detail.yearManufactured?.toString() ?? "",
        notes: detail.notes ?? "",
        benchType: detail.benchType ?? "",
        flangeOrDiffuser: detail.flangeOrDiffuser ?? "",
        wheelType: detail.wheelType ?? "",
        brandingStatus: detail.brandingStatus ?? "",
        brandingDescription: detail.brandingDescription ?? "",
        condition: detail.condition ?? "",
        benchStatus: detail.benchStatus ?? "",
        availability: detail.availability ?? "",
        manifoldStyle: detail.manifoldStyle ?? "",
        deckType: detail.deckType ?? "",
        seatType: detail.seatType ?? "",
        compressorHoles: detail.compressorHoles ?? "",
        acHoles: detail.acHoles ?? "",
        dsPlateNumber: detail.dsPlateNumber ?? "",
        deployedLocationName: detail.deployedLocationName ?? "",
        teamAllocated2024: detail.teamAllocated2024 ?? "",
        teamAllocated2025: detail.teamAllocated2025 ?? "",
        heaterType: detail.heaterType ?? "",
        btuLevel: detail.btuLevel ?? "",
        btuRating: detail.btuRating?.toString() ?? "",
        amps: detail.amps?.toString() ?? "",
        maintenanceNotes: detail.maintenanceNotes ?? "",
    };
}

/** Build the update payload from form data (same shape used by updateAssetAction). */
export function formToPayload(formData: AssetFormData) {
    return {
        productCategory: formData.productCategory,
        currentLocation: formData.currentLocation,
        lifecycleStatus: formData.lifecycleStatus,
        productTypeModel: formData.productTypeModel || null,
        customerId: formData.customerId || null,
        manufacturer: formData.manufacturer || null,
        yearManufactured: formData.yearManufactured ? Number(formData.yearManufactured) : null,
        notes: formData.notes || null,
        benchType: formData.benchType || null,
        flangeOrDiffuser: formData.flangeOrDiffuser || null,
        wheelType: formData.wheelType || null,
        brandingStatus: (formData.brandingStatus || null) as BrandingStatus | null,
        brandingDescription: formData.brandingDescription || null,
        condition: formData.condition || null,
        benchStatus: formData.benchStatus || null,
        availability: (formData.availability as AssetAvailability) || undefined,
        manifoldStyle: formData.manifoldStyle || null,
        deckType: formData.deckType || null,
        seatType: formData.seatType || null,
        compressorHoles: formData.compressorHoles || null,
        acHoles: formData.acHoles || null,
        dsPlateNumber: formData.dsPlateNumber || null,
        deployedLocationName: formData.deployedLocationName || null,
        teamAllocated2024: formData.teamAllocated2024 || null,
        teamAllocated2025: formData.teamAllocated2025 || null,
        heaterType: formData.heaterType || null,
        btuLevel: formData.btuLevel || null,
        btuRating: formData.btuRating ? Number(formData.btuRating) : null,
        amps: formData.amps ? Number(formData.amps) : null,
        maintenanceNotes: formData.maintenanceNotes || null,
    };
}
