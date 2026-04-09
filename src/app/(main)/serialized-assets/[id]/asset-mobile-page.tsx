"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, X, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    PRODUCT_CATEGORY_LABELS,
    LIFECYCLE_STATUS_LABELS,
    LIFECYCLE_STATUS_COLORS,
    WAREHOUSE_LOCATION_LABELS,
    ALL_PRODUCT_CATEGORIES,
    ALL_LIFECYCLE_STATUSES,
    ALL_WAREHOUSE_LOCATIONS,
} from "@/lib/serialized-assets/constants";
import {
    AVAILABILITY_LABELS,
    AVAILABILITY_COLORS,
    ALL_AVAILABILITIES,
} from "@/lib/deployments/constants";
import type { SerializedAssetDetail } from "@/lib/serialized-assets/types";
import type { ProductCategory, LifecycleStatus, WarehouseLocation, BrandingStatus, AssetAvailability } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { updateAssetAction } from "../actions";

interface AssetFormData {
    productCategory: ProductCategory;
    productTypeModel: string;
    lifecycleStatus: LifecycleStatus;
    currentLocation: WarehouseLocation;
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
    availability: AssetAvailability;
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

function detailToForm(detail: SerializedAssetDetail): AssetFormData {
    return {
        productCategory: detail.productCategory,
        productTypeModel: detail.productTypeModel ?? "",
        lifecycleStatus: detail.lifecycleStatus,
        currentLocation: detail.currentLocation,
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
        availability: detail.availability,
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

export function AssetMobilePage({ asset }: { asset: SerializedAssetDetail }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<AssetFormData>(() => detailToForm(asset));

    function updateField(field: keyof AssetFormData, value: string) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    function handleEdit() {
        setFormData(detailToForm(asset));
        setIsEditing(true);
    }

    function handleCancel() {
        setFormData(detailToForm(asset));
        setIsEditing(false);
    }

    function handleSave() {
        startTransition(async () => {
            try {
                await updateAssetAction(asset.id, {
                    productCategory: formData.productCategory,
                    currentLocation: formData.currentLocation,
                    lifecycleStatus: formData.lifecycleStatus,
                    productTypeModel: formData.productTypeModel || null,
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
                    availability: formData.availability,
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
                });
                toast.success("Asset updated");
                setIsEditing(false);
                router.refresh();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to save");
            }
        });
    }

    const cat = isEditing ? formData.productCategory : asset.productCategory;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
                <Link href="/serialized-assets" className="shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1 min-w-0">
                    <p className="font-mono font-semibold text-sm truncate">{asset.serialNumber}</p>
                    <p className="text-xs text-muted-foreground truncate">
                        {PRODUCT_CATEGORY_LABELS[asset.productCategory]}
                        {asset.productTypeModel ? ` — ${asset.productTypeModel}` : ""}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Badge className={cn("text-[10px]", LIFECYCLE_STATUS_COLORS[asset.lifecycleStatus])}>
                        {LIFECYCLE_STATUS_LABELS[asset.lifecycleStatus]}
                    </Badge>
                    {!isEditing && (
                        <Button variant="outline" size="sm" onClick={handleEdit} className="h-8">
                            <Pencil className="h-3.5 w-3.5 mr-1.5" />
                            Edit
                        </Button>
                    )}
                </div>
            </div>

            <div className="px-4 py-5 space-y-4 max-w-xl mx-auto">
                {/* General */}
                <Card>
                    <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            General
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isEditing ? (
                            <>
                                <FormField label="Product Category">
                                    <Select value={formData.productCategory} onValueChange={(v) => updateField("productCategory", v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {ALL_PRODUCT_CATEGORIES.map((c) => (
                                                <SelectItem key={c} value={c}>{PRODUCT_CATEGORY_LABELS[c]}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>
                                <FormField label="Product Type/Model">
                                    <Input value={formData.productTypeModel} onChange={(e) => updateField("productTypeModel", e.target.value)} />
                                </FormField>
                                <FormField label="Lifecycle Status">
                                    <Select value={formData.lifecycleStatus} onValueChange={(v) => updateField("lifecycleStatus", v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {ALL_LIFECYCLE_STATUSES.map((s) => (
                                                <SelectItem key={s} value={s}>{LIFECYCLE_STATUS_LABELS[s]}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>
                                <FormField label="Location">
                                    <Select value={formData.currentLocation} onValueChange={(v) => updateField("currentLocation", v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {ALL_WAREHOUSE_LOCATIONS.map((l) => (
                                                <SelectItem key={l} value={l}>{WAREHOUSE_LOCATION_LABELS[l]}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>
                                <FormField label="Manufacturer">
                                    <Input value={formData.manufacturer} onChange={(e) => updateField("manufacturer", e.target.value)} />
                                </FormField>
                                <FormField label="Year Manufactured">
                                    <Input type="number" value={formData.yearManufactured} onChange={(e) => updateField("yearManufactured", e.target.value)} />
                                </FormField>
                                <FormField label="Notes">
                                    <Textarea value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} rows={3} />
                                </FormField>
                            </>
                        ) : (
                            <>
                                <Field label="Asset Type" value={asset.productTypeModel} />
                                <Field label="Manufacturer" value={asset.manufacturer} />
                                <Field label="Location" value={
                                    asset.currentLocation === "deployed_customer" && asset.deployedLocationName
                                        ? `Deployed — ${asset.deployedLocationName}`
                                        : WAREHOUSE_LOCATION_LABELS[asset.currentLocation]
                                } />
                                <Field label="Customer" value={asset.customer?.teamName} />
                                <Field label="SKU" value={asset.sku?.sku} />
                                <Field label="Year Manufactured" value={asset.yearManufactured?.toString()} />
                                <Field label="Availability">
                                    <Badge className={cn("text-[10px]", AVAILABILITY_COLORS[asset.availability])}>
                                        {AVAILABILITY_LABELS[asset.availability]}
                                    </Badge>
                                </Field>
                                {asset.notes && (
                                    <div className="pt-1">
                                        <p className="text-xs text-muted-foreground mb-1">Notes</p>
                                        <p className="text-sm whitespace-pre-wrap">{asset.notes}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Bench Specifications */}
                {cat === "bench" && (
                    <Card>
                        <CardHeader className="pb-2 pt-4">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Bench Specifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isEditing ? (
                                <>
                                    <FormField label="Condition">
                                        <Input value={formData.condition} onChange={(e) => updateField("condition", e.target.value)} />
                                    </FormField>
                                    <FormField label="Status">
                                        <Input value={formData.benchStatus} onChange={(e) => updateField("benchStatus", e.target.value)} />
                                    </FormField>
                                    <FormField label="Availability">
                                        <Select value={formData.availability} onValueChange={(v) => updateField("availability", v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {ALL_AVAILABILITIES.map((a) => (
                                                    <SelectItem key={a} value={a}>{AVAILABILITY_LABELS[a]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormField>
                                    <FormField label="DS Plate Number">
                                        <Input value={formData.dsPlateNumber} onChange={(e) => updateField("dsPlateNumber", e.target.value)} />
                                    </FormField>
                                    <FormField label="Manifold Style">
                                        <Input value={formData.manifoldStyle} onChange={(e) => updateField("manifoldStyle", e.target.value)} />
                                    </FormField>
                                    <FormField label="Deck Type">
                                        <Input value={formData.deckType} onChange={(e) => updateField("deckType", e.target.value)} />
                                    </FormField>
                                    <FormField label="Seat Type">
                                        <Input value={formData.seatType} onChange={(e) => updateField("seatType", e.target.value)} />
                                    </FormField>
                                    <FormField label="Wheel Style">
                                        <Input value={formData.wheelType} onChange={(e) => updateField("wheelType", e.target.value)} />
                                    </FormField>
                                    <FormField label="Compressor Holes">
                                        <Input value={formData.compressorHoles} onChange={(e) => updateField("compressorHoles", e.target.value)} />
                                    </FormField>
                                    <FormField label="AC Holes">
                                        <Input value={formData.acHoles} onChange={(e) => updateField("acHoles", e.target.value)} />
                                    </FormField>
                                    <FormField label="Flange/Diffuser">
                                        <Input value={formData.flangeOrDiffuser} onChange={(e) => updateField("flangeOrDiffuser", e.target.value)} />
                                    </FormField>
                                    <FormField label="Team 2024">
                                        <Input value={formData.teamAllocated2024} onChange={(e) => updateField("teamAllocated2024", e.target.value)} />
                                    </FormField>
                                    <FormField label="Team 2025">
                                        <Input value={formData.teamAllocated2025} onChange={(e) => updateField("teamAllocated2025", e.target.value)} />
                                    </FormField>
                                </>
                            ) : (
                                <>
                                    <Field label="Condition" value={asset.condition} />
                                    <Field label="Status" value={asset.benchStatus} />
                                    <Field label="DS Plate #" value={asset.dsPlateNumber} />
                                    <Field label="Manifold Style" value={asset.manifoldStyle} />
                                    <Field label="Deck Type" value={asset.deckType} />
                                    <Field label="Seat Type" value={asset.seatType} />
                                    <Field label="Wheel Style" value={asset.wheelType} />
                                    <Field label="Compressor Holes" value={asset.compressorHoles} />
                                    <Field label="AC Holes" value={asset.acHoles} />
                                    <Field label="Flange/Diffuser" value={asset.flangeOrDiffuser} />
                                    <Field label="Team 2024" value={asset.teamAllocated2024} />
                                    <Field label="Team 2025" value={asset.teamAllocated2025} />
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Heater Specifications */}
                {cat === "heater" && (
                    <Card>
                        <CardHeader className="pb-2 pt-4">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Heater Specifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isEditing ? (
                                <>
                                    <FormField label="Heater Type">
                                        <Input value={formData.heaterType} onChange={(e) => updateField("heaterType", e.target.value)} />
                                    </FormField>
                                    <FormField label="BTU Level">
                                        <Input value={formData.btuLevel} onChange={(e) => updateField("btuLevel", e.target.value)} />
                                    </FormField>
                                    <FormField label="Condition">
                                        <Input value={formData.condition} onChange={(e) => updateField("condition", e.target.value)} />
                                    </FormField>
                                </>
                            ) : (
                                <>
                                    <Field label="Heater Type" value={asset.heaterType} />
                                    <Field label="BTU Level" value={asset.btuLevel} />
                                    <Field label="Condition" value={asset.condition} />
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* AC Unit Specifications */}
                {cat === "ac_unit" && (
                    <Card>
                        <CardHeader className="pb-2 pt-4">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                AC Unit Specifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isEditing ? (
                                <>
                                    <FormField label="BTU Rating">
                                        <Input type="number" value={formData.btuRating} onChange={(e) => updateField("btuRating", e.target.value)} />
                                    </FormField>
                                    <FormField label="Amps">
                                        <Input type="number" value={formData.amps} onChange={(e) => updateField("amps", e.target.value)} />
                                    </FormField>
                                    <FormField label="Condition">
                                        <Input value={formData.condition} onChange={(e) => updateField("condition", e.target.value)} />
                                    </FormField>
                                </>
                            ) : (
                                <>
                                    <Field label="BTU Rating" value={asset.btuRating?.toString()} />
                                    <Field label="Amps" value={asset.amps?.toString()} />
                                    <Field label="Condition" value={asset.condition} />
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Other categories — generic specs */}
                {cat !== "bench" && cat !== "heater" && cat !== "ac_unit" && (
                    <Card>
                        <CardHeader className="pb-2 pt-4">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Specifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isEditing ? (
                                <FormField label="Condition">
                                    <Input value={formData.condition} onChange={(e) => updateField("condition", e.target.value)} />
                                </FormField>
                            ) : (
                                <Field label="Condition" value={asset.condition} />
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Maintenance */}
                {(isEditing || asset.maintenanceNotes) && (
                    <Card>
                        <CardHeader className="pb-2 pt-4">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Maintenance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <FormField label="Maintenance Notes">
                                    <Textarea
                                        value={formData.maintenanceNotes}
                                        onChange={(e) => updateField("maintenanceNotes", e.target.value)}
                                        rows={4}
                                    />
                                </FormField>
                            ) : (
                                <p className="text-sm whitespace-pre-wrap">{asset.maintenanceNotes}</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Deployment History */}
                {!isEditing && (
                    <Card>
                        <CardHeader className="pb-2 pt-4">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Deployment History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {asset.deployments.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No deployments recorded.</p>
                            ) : (
                                <div className="space-y-3">
                                    {asset.deployments.map((d) => (
                                        <div key={d.id} className="rounded-lg border p-3 text-sm space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{d.customerName}</span>
                                                <span className="text-xs text-muted-foreground tabular-nums">
                                                    {new Date(d.deploymentDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Expected return:{" "}
                                                {d.expectedReturnDate
                                                    ? new Date(d.expectedReturnDate).toLocaleDateString()
                                                    : "TBD"}
                                            </div>
                                            {d.actualReturnDate && (
                                                <div className="text-xs text-muted-foreground">
                                                    Returned: {new Date(d.actualReturnDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Timestamps */}
                {!isEditing && (
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 pb-4">
                        <span>Created {new Date(asset.createdAt).toLocaleDateString()}</span>
                        <span>Updated {new Date(asset.updatedAt).toLocaleDateString()}</span>
                    </div>
                )}

                {/* Edit mode footer */}
                {isEditing && (
                    <div className="sticky bottom-0 bg-background border-t pt-4 pb-6 flex gap-2">
                        <Button onClick={handleSave} disabled={isPending} className="flex-1">
                            <Save className="h-4 w-4 mr-2" />
                            {isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button variant="outline" onClick={handleCancel} disabled={isPending}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function Field({
    label,
    value,
    children,
}: {
    label: string;
    value?: string | null;
    children?: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            {children ?? (
                <span className="text-sm font-medium text-right">
                    {value ?? <span className="text-muted-foreground/40">&mdash;</span>}
                </span>
            )}
        </div>
    );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs">{label}</Label>
            {children}
        </div>
    );
}
