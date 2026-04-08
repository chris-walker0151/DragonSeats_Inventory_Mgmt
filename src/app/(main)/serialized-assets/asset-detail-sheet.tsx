"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { QRCodeSVG } from "qrcode.react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    PRODUCT_CATEGORY_LABELS,
    LIFECYCLE_STATUS_LABELS,
    LIFECYCLE_STATUS_COLORS,
    WAREHOUSE_LOCATION_LABELS,
    ALL_PRODUCT_CATEGORIES,
    ALL_LIFECYCLE_STATUSES,
    ALL_WAREHOUSE_LOCATIONS,
} from "@/lib/serialized-assets/constants";
import { WAREHOUSES } from "@/lib/constants";
import type { SerializedAssetDetail } from "@/lib/serialized-assets/types";
import type { ProductCategory, LifecycleStatus, WarehouseLocation, BrandingStatus, AssetAvailability } from "@/generated/prisma/client";
import { AVAILABILITY_LABELS, ALL_AVAILABILITIES } from "@/lib/deployments/constants";
import {
    fetchAssetDetail,
    deployAssetAction,
    returnAssetAction,
    fetchActiveCustomersAction,
    createAssetAction,
    updateAssetAction,
} from "./actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Pencil, Check, ChevronsUpDown } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

type SheetMode = "view" | "edit" | "create";

interface AssetDetailSheetProps {
    assetId: string | null;
    open: boolean;
    onClose: () => void;
    mode?: "view" | "create";
    onSaved?: () => void;
}

interface AssetFormData {
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

const EMPTY_FORM: AssetFormData = {
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

function detailToForm(detail: SerializedAssetDetail): AssetFormData {
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

export function AssetDetailSheet({ assetId, open, onClose, mode: initialMode = "view", onSaved }: AssetDetailSheetProps) {
    const [detail, setDetail] = useState<SerializedAssetDetail | null>(null);
    const [isPending, startTransition] = useTransition();
    const [sheetMode, setSheetMode] = useState<SheetMode>(initialMode);
    const [formData, setFormData] = useState<AssetFormData>(EMPTY_FORM);
    const [customers, setCustomers] = useState<{ id: string; teamName: string }[]>([]);

    // Deploy form state
    const [showDeployForm, setShowDeployForm] = useState(false);
    const [deployCustomerId, setDeployCustomerId] = useState("");
    const [deployCustomerOpen, setDeployCustomerOpen] = useState(false);
    const [deployDate, setDeployDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [deployExpectedReturn, setDeployExpectedReturn] = useState("");
    const [deployNotes, setDeployNotes] = useState("");

    // Return form state
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [returnLocation, setReturnLocation] = useState("");

    const isEditing = sheetMode === "edit" || sheetMode === "create";

    // Reset deploy/return form state when sheet closes (state-tracking pattern)
    const [prevOpen, setPrevOpen] = useState(open);
    if (prevOpen !== open) {
        setPrevOpen(open);
        if (!open) {
            setShowDeployForm(false);
            setDeployCustomerId("");
            setDeployDate(new Date().toISOString().slice(0, 10));
            setDeployExpectedReturn("");
            setDeployNotes("");
            setShowReturnForm(false);
            setReturnLocation("");
        }
    }

    // Track prop changes and reset state during render (avoids setState in useEffect)
    const [prev, setPrev] = useState({ assetId, initialMode });
    if (prev.assetId !== assetId || prev.initialMode !== initialMode) {
        setPrev({ assetId, initialMode });
        if (initialMode === "create") {
            setSheetMode("create");
            setFormData(EMPTY_FORM);
            setDetail(null);
        } else {
            setSheetMode("view");
            if (!assetId) setDetail(null);
            setShowDeployForm(false);
            setShowReturnForm(false);
        }
    }

    // Fetch data / load customers
    useEffect(() => {
        if (initialMode === "create") {
            startTransition(async () => {
                const list = await fetchActiveCustomersAction();
                setCustomers(list);
            });
        } else if (assetId) {
            startTransition(async () => {
                try {
                    const data = await fetchAssetDetail(assetId);
                    setDetail(data);
                    if (data) setFormData(detailToForm(data));
                } catch {
                    toast.error("Failed to load asset details");
                }
            });
        }
    }, [assetId, initialMode]);

    function handleEdit() {
        if (detail) setFormData(detailToForm(detail));
        startTransition(async () => {
            const list = await fetchActiveCustomersAction();
            setCustomers(list);
            setSheetMode("edit");
        });
    }

    function handleCancelEdit() {
        if (detail) setFormData(detailToForm(detail));
        setSheetMode("view");
    }

    function updateField(field: keyof AssetFormData, value: string) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    function handleSave() {
        if (!formData.serialNumber.trim()) {
            toast.error("Serial number is required");
            return;
        }

        startTransition(async () => {
            const payload = {
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

            try {
                if (sheetMode === "create") {
                    const { id } = await createAssetAction({
                        serialNumber: formData.serialNumber.trim(),
                        ...payload,
                    });
                    toast.success("Asset created");
                    const refreshed = await fetchAssetDetail(id);
                    setDetail(refreshed);
                    if (refreshed) setFormData(detailToForm(refreshed));
                    setSheetMode("view");
                } else {
                    await updateAssetAction(detail!.id, payload);
                    toast.success("Asset updated");
                    const refreshed = await fetchAssetDetail(detail!.id);
                    setDetail(refreshed);
                    if (refreshed) setFormData(detailToForm(refreshed));
                    setSheetMode("view");
                }
                onSaved?.();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to save");
            }
        });
    }

    const canDeploy = detail && sheetMode === "view" && (
        detail.lifecycleStatus === "in_warehouse_available" ||
        detail.lifecycleStatus === "in_warehouse_reserved"
    );
    const canReturn = detail && sheetMode === "view" && detail.lifecycleStatus === "deployed_customer";

    function handleOpenDeployForm() {
        startTransition(async () => {
            const list = await fetchActiveCustomersAction();
            setCustomers(list);
            setShowDeployForm(true);
            setDeployCustomerId("");
            setDeployDate(new Date().toISOString().slice(0, 10));
            setDeployExpectedReturn("");
            setDeployNotes("");
        });
    }

    function handleDeploy() {
        if (!detail) return;
        if (!deployCustomerId) { toast.error("Please select a customer"); return; }
        if (!deployDate) { toast.error("Please enter a deployment date"); return; }
        startTransition(async () => {
            await deployAssetAction({
                assetId: detail.id,
                customerId: deployCustomerId,
                deploymentDate: deployDate,
                expectedReturnDate: deployExpectedReturn || undefined,
                notes: deployNotes || undefined,
            });
            toast.success("Asset reserved successfully");
            const refreshed = await fetchAssetDetail(detail.id);
            setDetail(refreshed);
            setShowDeployForm(false);
            onSaved?.();
        });
    }

    function handleReturn() {
        if (!detail || !returnLocation) return;
        startTransition(async () => {
            await returnAssetAction({
                assetId: detail.id,
                returnLocation: returnLocation as "cleveland_warehouse" | "kansas_city_warehouse" | "jacksonville_warehouse",
            });
            toast.success("Asset returned successfully");
            const refreshed = await fetchAssetDetail(detail.id);
            setDetail(refreshed);
            setShowReturnForm(false);
            onSaved?.();
        });
    }

    const showLoading = initialMode !== "create" && (isPending || !detail);
    const cat = isEditing ? formData.productCategory : detail?.productCategory;

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                {showLoading ? (
                    <DetailSkeleton />
                ) : (
                    <>
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                                {sheetMode === "create" ? (
                                    "New Asset"
                                ) : (
                                    <>
                                        <span className="font-mono">{detail!.serialNumber}</span>
                                        <Badge
                                            className={cn(
                                                "text-[10px]",
                                                LIFECYCLE_STATUS_COLORS[detail!.lifecycleStatus],
                                            )}
                                        >
                                            {LIFECYCLE_STATUS_LABELS[detail!.lifecycleStatus]}
                                        </Badge>
                                        {sheetMode === "view" && (
                                            <Button variant="ghost" size="icon" className="ml-auto h-7 w-7" onClick={handleEdit}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </>
                                )}
                            </SheetTitle>
                            <SheetDescription>
                                {sheetMode === "create"
                                    ? "Fill in the details to create a new serialized asset."
                                    : `${PRODUCT_CATEGORY_LABELS[detail!.productCategory]}${detail!.productTypeModel ? ` — ${detail!.productTypeModel}` : ""}`}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-6 px-1">
                            {/* General Info */}
                            <Section title="General">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        {sheetMode === "create" && (
                                            <FormField label="Serial Number *">
                                                <Input value={formData.serialNumber} onChange={(e) => updateField("serialNumber", e.target.value)} placeholder="e.g. BN-0001" />
                                            </FormField>
                                        )}
                                        <FormField label="Product Category *">
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
                                        <FormField label="Location *">
                                            <Select value={formData.currentLocation} onValueChange={(v) => updateField("currentLocation", v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {ALL_WAREHOUSE_LOCATIONS.map((l) => (
                                                        <SelectItem key={l} value={l}>{WAREHOUSE_LOCATION_LABELS[l]}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                        <FormField label="Customer">
                                            <Select value={formData.customerId || "none"} onValueChange={(v) => updateField("customerId", v === "none" ? "" : v)}>
                                                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {customers.map((c) => (
                                                        <SelectItem key={c.id} value={c.id}>{c.teamName}</SelectItem>
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
                                            <Input value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} />
                                        </FormField>
                                    </div>
                                ) : (
                                    <>
                                        <Field label="Asset Type" value={detail!.productTypeModel} />
                                        <Field label="Manufacturer" value={detail!.manufacturer} />
                                        <Field label="Location" value={
                                            detail!.currentLocation === "deployed_customer" && detail!.deployedLocationName
                                                ? `Deployed — ${detail!.deployedLocationName}`
                                                : WAREHOUSE_LOCATION_LABELS[detail!.currentLocation]
                                        } />
                                        <Field label="Customer" value={detail!.customer?.teamName} />
                                        <Field label="SKU" value={detail!.sku?.sku} />
                                        <Field label="Year Manufactured" value={detail!.yearManufactured?.toString()} />
                                    </>
                                )}
                            </Section>

                            {/* Reserve / Return Actions (view mode only) */}
                            {canDeploy && !showDeployForm && (
                                <Button onClick={handleOpenDeployForm} className="w-full" disabled={isPending}>
                                    Reserve to Customer
                                </Button>
                            )}

                            {showDeployForm && sheetMode === "view" && (
                                <Section title="Reserve to Customer">
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Customer</Label>
                                            <Popover open={deployCustomerOpen} onOpenChange={setDeployCustomerOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={deployCustomerOpen}
                                                        className="w-full justify-between font-normal"
                                                    >
                                                        {deployCustomerId
                                                            ? customers.find((c) => c.id === deployCustomerId)?.teamName
                                                            : "Search customer..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Type to search..." />
                                                        <CommandList>
                                                            <CommandEmpty>No customer found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {customers.map((c) => (
                                                                    <CommandItem
                                                                        key={c.id}
                                                                        value={c.teamName}
                                                                        onSelect={() => {
                                                                            setDeployCustomerId(c.id);
                                                                            setDeployCustomerOpen(false);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                deployCustomerId === c.id ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {c.teamName}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Reservation Date</Label>
                                            <Input type="date" value={deployDate} onChange={(e) => setDeployDate(e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Expected Return Date</Label>
                                            <Input type="date" value={deployExpectedReturn} onChange={(e) => setDeployExpectedReturn(e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Notes</Label>
                                            <Input value={deployNotes} onChange={(e) => setDeployNotes(e.target.value)} placeholder="Reservation notes..." />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleDeploy} disabled={!deployCustomerId || !deployDate || isPending} className="flex-1">
                                                {isPending ? "Reserving..." : "Confirm Reservation"}
                                            </Button>
                                            <Button variant="outline" onClick={() => setShowDeployForm(false)}>Cancel</Button>
                                        </div>
                                    </div>
                                </Section>
                            )}

                            {canReturn && !showReturnForm && (
                                <Button variant="outline" onClick={() => setShowReturnForm(true)} className="w-full" disabled={isPending}>
                                    Return from Customer
                                </Button>
                            )}

                            {showReturnForm && sheetMode === "view" && (
                                <Section title="Return to Warehouse">
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Return Location</Label>
                                            <Select value={returnLocation} onValueChange={setReturnLocation}>
                                                <SelectTrigger><SelectValue placeholder="Select warehouse..." /></SelectTrigger>
                                                <SelectContent>
                                                    {WAREHOUSES.map((wh) => (
                                                        <SelectItem key={wh.location} value={wh.location}>{wh.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleReturn} disabled={!returnLocation || isPending} className="flex-1">
                                                {isPending ? "Returning..." : "Confirm Return"}
                                            </Button>
                                            <Button variant="outline" onClick={() => setShowReturnForm(false)}>Cancel</Button>
                                        </div>
                                    </div>
                                </Section>
                            )}

                            {/* Category-specific fields */}
                            {cat === "bench" && (
                                <Section title="Bench Specifications">
                                    {isEditing ? (
                                        <div className="space-y-3">
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
                                        </div>
                                    ) : (
                                        <>
                                            <Field label="Condition" value={detail!.condition} />
                                            <Field label="Status" value={detail!.benchStatus} />
                                            <Field label="Availability" value={AVAILABILITY_LABELS[detail!.availability]} />
                                            <Field label="DS Plate #" value={detail!.dsPlateNumber} />
                                            <Field label="Manifold Style" value={detail!.manifoldStyle} />
                                            <Field label="Deck Type" value={detail!.deckType} />
                                            <Field label="Seat Type" value={detail!.seatType} />
                                            <Field label="Wheel Style" value={detail!.wheelType} />
                                            <Field label="Compressor Holes" value={detail!.compressorHoles} />
                                            <Field label="AC Holes" value={detail!.acHoles} />
                                        </>
                                    )}
                                </Section>
                            )}

                            {/* Team Allocations (bench only) */}
                            {cat === "bench" && (
                                <Section title="Team Allocations">
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <FormField label="Team Allocated 2024">
                                                <Input value={formData.teamAllocated2024} onChange={(e) => updateField("teamAllocated2024", e.target.value)} />
                                            </FormField>
                                            <FormField label="Team Allocated 2025">
                                                <Input value={formData.teamAllocated2025} onChange={(e) => updateField("teamAllocated2025", e.target.value)} />
                                            </FormField>
                                        </div>
                                    ) : (
                                        <>
                                            <Field label="2024 Allocation" value={detail!.teamAllocated2024} />
                                            <Field label="2025 Allocation" value={detail!.teamAllocated2025} />
                                        </>
                                    )}
                                </Section>
                            )}

                            {cat === "heater" && (
                                <Section title="Heater Details">
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <FormField label="Heater Type">
                                                <Input value={formData.heaterType} onChange={(e) => updateField("heaterType", e.target.value)} />
                                            </FormField>
                                            <FormField label="BTU Level">
                                                <Input value={formData.btuLevel} onChange={(e) => updateField("btuLevel", e.target.value)} />
                                            </FormField>
                                        </div>
                                    ) : (
                                        <>
                                            <Field label="Heater Type" value={detail!.heaterType} />
                                            <Field label="BTU Level" value={detail!.btuLevel} />
                                        </>
                                    )}
                                </Section>
                            )}

                            {cat === "ac_unit" && (
                                <Section title="AC Unit Details">
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <FormField label="BTU Rating">
                                                <Input type="number" value={formData.btuRating} onChange={(e) => updateField("btuRating", e.target.value)} />
                                            </FormField>
                                            <FormField label="Amps">
                                                <Input type="number" value={formData.amps} onChange={(e) => updateField("amps", e.target.value)} />
                                            </FormField>
                                        </div>
                                    ) : (
                                        <>
                                            <Field label="BTU Rating" value={detail!.btuRating?.toLocaleString()} />
                                            <Field label="Amps" value={detail!.amps?.toString()} />
                                        </>
                                    )}
                                </Section>
                            )}

                            {/* Maintenance Notes (edit mode) */}
                            {isEditing && (
                                <Section title="Maintenance">
                                    <div className="space-y-3">
                                        <FormField label="Maintenance Notes">
                                            <Input value={formData.maintenanceNotes} onChange={(e) => updateField("maintenanceNotes", e.target.value)} />
                                        </FormField>
                                    </div>
                                </Section>
                            )}

                            {/* Notes (view mode) */}
                            {!isEditing && detail!.notes && (
                                <Section title="Notes">
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {detail!.notes}
                                    </p>
                                </Section>
                            )}

                            {/* Deployment History (view mode only) */}
                            {!isEditing && detail && (
                                <Section title="Deployment History">
                                    {detail.deployments.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">No deployments recorded.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {detail.deployments.map((d) => (
                                                <div key={d.id} className="rounded-lg border p-3 text-sm space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">{d.customerName}</span>
                                                        <span className="text-xs text-muted-foreground tabular-nums">
                                                            {new Date(d.deploymentDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span>
                                                            Expected return:{" "}
                                                            {d.expectedReturnDate
                                                                ? new Date(d.expectedReturnDate).toLocaleDateString()
                                                                : "TBD"}
                                                        </span>
                                                        {d.actualReturnDate && (
                                                            <Badge variant="active" className="text-[10px]">
                                                                Returned {new Date(d.actualReturnDate).toLocaleDateString()}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Section>
                            )}

                            {/* Save / Cancel footer for edit/create */}
                            {isEditing && (
                                <div className="sticky bottom-0 bg-background border-t pt-4 pb-4 flex gap-2">
                                    <Button onClick={handleSave} disabled={isPending} className="flex-1">
                                        {isPending ? "Saving..." : sheetMode === "create" ? "Create Asset" : "Save Changes"}
                                    </Button>
                                    <Button variant="outline" onClick={sheetMode === "create" ? onClose : handleCancelEdit} disabled={isPending}>
                                        Cancel
                                    </Button>
                                </div>
                            )}

                            {/* QR Code (view mode only) */}
                            {!isEditing && detail && (
                                <AssetQRCode assetId={detail.id} serialNumber={detail.serialNumber} />
                            )}

                            {/* Timestamps (view mode) */}
                            {!isEditing && detail && (
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 pb-4">
                                    <span>Created {new Date(detail.createdAt).toLocaleDateString()}</span>
                                    <span>Updated {new Date(detail.updatedAt).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <Separator />
            <h3 className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
            </h3>
            <div className="space-y-0.5">{children}</div>
        </div>
    );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">
                {value ?? <span className="text-muted-foreground/40">&mdash;</span>}
            </span>
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

function AssetQRCode({ assetId, serialNumber }: { assetId: string; serialNumber: string }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const profileUrl = `${baseUrl}/serialized-assets/${assetId}`;

    function handleDownload() {
        const svg = svgRef.current;
        if (!svg) return;

        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);
            URL.revokeObjectURL(url);
            const pngUrl = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = pngUrl;
            a.download = `asset-${serialNumber}.png`;
            a.click();
        };
        img.src = url;
    }

    return (
        <div>
            <Separator />
            <h3 className="mt-4 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                QR Code
            </h3>
            <div className="flex flex-col items-center gap-3 pb-2">
                <div className="rounded-lg border p-3 bg-white">
                    <QRCodeSVG
                        ref={svgRef}
                        value={profileUrl}
                        size={160}
                        level="M"
                        includeMargin={false}
                    />
                </div>
                <p className="text-[10px] text-muted-foreground text-center break-all max-w-[220px]">
                    {profileUrl}
                </p>
                <Button variant="outline" size="sm" onClick={handleDownload} className="w-full">
                    Download QR Code
                </Button>
            </div>
        </div>
    );
}

function DetailSkeleton() {
    return (
        <div className="space-y-6 p-4">
            <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
            </div>
            <Separator />
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-32" />
                </div>
            ))}
            <Separator />
            {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
    );
}
