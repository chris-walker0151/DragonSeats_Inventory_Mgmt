"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import type { SerializedAssetDetail } from "@/lib/serialized-assets/types";
import {
    PRODUCT_CATEGORY_LABELS,
    LIFECYCLE_STATUS_LABELS,
    LIFECYCLE_STATUS_COLORS,
    WAREHOUSE_LOCATION_LABELS,
    ALL_LIFECYCLE_STATUSES,
    ALL_WAREHOUSE_LOCATIONS,
    ALL_PRODUCT_CATEGORIES,
} from "@/lib/serialized-assets/constants";
import { AVAILABILITY_LABELS, ALL_AVAILABILITIES } from "@/lib/deployments/constants";
import { type AssetFormData, detailToForm, formToPayload } from "@/lib/serialized-assets/asset-form";
import { fetchAssetDetail, updateAssetAction, fetchActiveCustomersAction } from "../actions";

interface Props {
    asset: SerializedAssetDetail;
}

export function AssetProfileClient({ asset }: Props) {
    const [mode, setMode] = useState<"view" | "edit">("view");
    const [liveAsset, setLiveAsset] = useState(asset);
    const [formData, setFormData] = useState<AssetFormData>(() => detailToForm(asset));
    const [isPending, startTransition] = useTransition();
    const [customers, setCustomers] = useState<{ id: string; teamName: string }[]>([]);
    const [customerOpen, setCustomerOpen] = useState(false);

    function updateField(field: keyof AssetFormData, value: string) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    function handleEdit() {
        setFormData(detailToForm(liveAsset));
        startTransition(async () => {
            const list = await fetchActiveCustomersAction();
            setCustomers(list);
            setMode("edit");
        });
    }

    function handleCancel() {
        setFormData(detailToForm(liveAsset));
        setMode("view");
    }

    function handleSave() {
        startTransition(async () => {
            try {
                const payload = formToPayload(formData);
                await updateAssetAction(liveAsset.id, payload);
                const refreshed = await fetchAssetDetail(liveAsset.id);
                if (refreshed) {
                    setLiveAsset(refreshed);
                    setFormData(detailToForm(refreshed));
                }
                setMode("view");
                toast.success("Asset saved");
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to save");
            }
        });
    }

    const val = (v: string | null | undefined) => v || "—";

    return (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
            {/* Top bar */}
            <div className="flex items-center justify-between">
                <Link
                    href="/serialized-assets"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    All Assets
                </Link>
                {mode === "view" && (
                    <Button variant="ghost" size="sm" onClick={handleEdit}>
                        Edit
                    </Button>
                )}
            </div>

            {/* Hero */}
            <div>
                <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-mono font-bold text-2xl">{liveAsset.serialNumber}</h1>
                    <Badge className={cn("text-[10px]", LIFECYCLE_STATUS_COLORS[liveAsset.lifecycleStatus])}>
                        {LIFECYCLE_STATUS_LABELS[liveAsset.lifecycleStatus]}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                    {PRODUCT_CATEGORY_LABELS[liveAsset.productCategory]}
                    {liveAsset.productTypeModel ? ` — ${liveAsset.productTypeModel}` : ""}
                </p>
            </div>

            {/* ─── VIEW MODE ─── */}
            {mode === "view" && (
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">General</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-2 gap-y-3 gap-x-4">
                                <FieldRow label="Manufacturer" value={val(liveAsset.manufacturer)} />
                                <FieldRow label="Year" value={liveAsset.yearManufactured?.toString() ?? "—"} />
                                <FieldRow label="Location" value={WAREHOUSE_LOCATION_LABELS[liveAsset.currentLocation]} />
                                <FieldRow label="Customer" value={val(liveAsset.customer?.teamName)} />
                                <FieldRow label="SKU" value={val(liveAsset.sku?.sku)} />
                                <FieldRow label="Status" value={LIFECYCLE_STATUS_LABELS[liveAsset.lifecycleStatus]} />
                            </dl>
                        </CardContent>
                    </Card>

                    {liveAsset.productCategory === "bench" && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Specifications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid grid-cols-2 gap-y-3 gap-x-4">
                                    <FieldRow label="Condition" value={val(liveAsset.condition)} />
                                    <FieldRow label="Availability" value={liveAsset.availability ? AVAILABILITY_LABELS[liveAsset.availability] : "—"} />
                                    <FieldRow label="DS Plate #" value={val(liveAsset.dsPlateNumber)} />
                                    <FieldRow label="Manifold" value={val(liveAsset.manifoldStyle)} />
                                    <FieldRow label="Deck Type" value={val(liveAsset.deckType)} />
                                    <FieldRow label="Seat Type" value={val(liveAsset.seatType)} />
                                    <FieldRow label="Wheel Type" value={val(liveAsset.wheelType)} />
                                    <FieldRow label="Flange/Diffuser" value={val(liveAsset.flangeOrDiffuser)} />
                                    <FieldRow label="Compressor Holes" value={val(liveAsset.compressorHoles)} />
                                    <FieldRow label="AC Holes" value={val(liveAsset.acHoles)} />
                                    <FieldRow label="Bench Status" value={val(liveAsset.benchStatus)} />
                                </dl>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Allocation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-2 gap-y-3 gap-x-4">
                                <FieldRow label="Team 2024" value={val(liveAsset.teamAllocated2024)} />
                                <FieldRow label="Team 2025" value={val(liveAsset.teamAllocated2025)} />
                                <FieldRow label="Deployed Location" value={val(liveAsset.deployedLocationName)} />
                            </dl>
                        </CardContent>
                    </Card>

                    {liveAsset.deployments.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Deployment History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {liveAsset.deployments.map((d) => (
                                        <li key={d.id} className="text-sm">
                                            <span className="font-medium">{d.customerName}</span>
                                            <span className="text-muted-foreground block text-xs">
                                                {new Date(d.deploymentDate).toLocaleDateString()}
                                                {d.expectedReturnDate ? ` → ${new Date(d.expectedReturnDate).toLocaleDateString()}` : ""}
                                                {d.actualReturnDate ? ` (returned ${new Date(d.actualReturnDate).toLocaleDateString()})` : " (active)"}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {(liveAsset.maintenanceNotes || liveAsset.notes) && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Notes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {liveAsset.maintenanceNotes && (
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground mb-1">Maintenance</p>
                                        <p className="text-sm whitespace-pre-wrap">{liveAsset.maintenanceNotes}</p>
                                    </div>
                                )}
                                {liveAsset.notes && (
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground mb-1">General</p>
                                        <p className="text-sm whitespace-pre-wrap">{liveAsset.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* ─── EDIT MODE ─── */}
            {mode === "edit" && (
                <div className="space-y-6">
                    {/* General */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-1">General</h3>

                        <div className="space-y-1.5">
                            <Label>Product Category</Label>
                            <Select value={formData.productCategory} onValueChange={(v) => updateField("productCategory", v)}>
                                <SelectTrigger className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ALL_PRODUCT_CATEGORIES.map((c) => (
                                        <SelectItem key={c} value={c}>{PRODUCT_CATEGORY_LABELS[c]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Lifecycle Status</Label>
                            <Select value={formData.lifecycleStatus} onValueChange={(v) => updateField("lifecycleStatus", v)}>
                                <SelectTrigger className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ALL_LIFECYCLE_STATUSES.map((s) => (
                                        <SelectItem key={s} value={s}>{LIFECYCLE_STATUS_LABELS[s]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Location</Label>
                            <Select value={formData.currentLocation} onValueChange={(v) => updateField("currentLocation", v)}>
                                <SelectTrigger className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ALL_WAREHOUSE_LOCATIONS.map((l) => (
                                        <SelectItem key={l} value={l}>{WAREHOUSE_LOCATION_LABELS[l]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Customer</Label>
                            <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full h-11 justify-between font-normal"
                                    >
                                        {formData.customerId
                                            ? customers.find((c) => c.id === formData.customerId)?.teamName ?? "Loading…"
                                            : "None"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Search customers…" />
                                        <CommandList>
                                            <CommandEmpty>No customers found.</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    value="none"
                                                    onSelect={() => {
                                                        updateField("customerId", "");
                                                        setCustomerOpen(false);
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", !formData.customerId ? "opacity-100" : "opacity-0")} />
                                                    None
                                                </CommandItem>
                                                {customers.map((c) => (
                                                    <CommandItem
                                                        key={c.id}
                                                        value={c.teamName}
                                                        onSelect={() => {
                                                            updateField("customerId", c.id);
                                                            setCustomerOpen(false);
                                                        }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", formData.customerId === c.id ? "opacity-100" : "opacity-0")} />
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
                            <Label>Manufacturer</Label>
                            <Input className="h-11" value={formData.manufacturer} onChange={(e) => updateField("manufacturer", e.target.value)} />
                        </div>

                        <div className="space-y-1.5">
                            <Label>Year Manufactured</Label>
                            <Input className="h-11" type="number" value={formData.yearManufactured} onChange={(e) => updateField("yearManufactured", e.target.value)} />
                        </div>

                        <div className="space-y-1.5">
                            <Label>Notes</Label>
                            <Textarea rows={3} value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} />
                        </div>
                    </section>

                    {/* Specifications (bench only) */}
                    {formData.productCategory === "bench" && (
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-1">Specifications</h3>

                            <div className="space-y-1.5">
                                <Label>Condition</Label>
                                <Input className="h-11" value={formData.condition} onChange={(e) => updateField("condition", e.target.value)} />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Bench Status</Label>
                                <Input className="h-11" value={formData.benchStatus} onChange={(e) => updateField("benchStatus", e.target.value)} />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Availability</Label>
                                <Select value={formData.availability} onValueChange={(v) => updateField("availability", v)}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ALL_AVAILABILITIES.map((a) => (
                                            <SelectItem key={a} value={a}>{AVAILABILITY_LABELS[a]}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label>DS Plate #</Label>
                                <Input className="h-11" value={formData.dsPlateNumber} onChange={(e) => updateField("dsPlateNumber", e.target.value)} />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Manifold Style</Label>
                                <Input className="h-11" value={formData.manifoldStyle} onChange={(e) => updateField("manifoldStyle", e.target.value)} />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Deck Type</Label>
                                <Input className="h-11" value={formData.deckType} onChange={(e) => updateField("deckType", e.target.value)} />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Seat Type</Label>
                                <Input className="h-11" value={formData.seatType} onChange={(e) => updateField("seatType", e.target.value)} />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Wheel Type</Label>
                                <Input className="h-11" value={formData.wheelType} onChange={(e) => updateField("wheelType", e.target.value)} />
                            </div>
                        </section>
                    )}

                    {/* Allocation */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-1">Allocation</h3>

                        <div className="space-y-1.5">
                            <Label>Team Allocated 2024</Label>
                            <Input className="h-11" value={formData.teamAllocated2024} onChange={(e) => updateField("teamAllocated2024", e.target.value)} />
                        </div>

                        <div className="space-y-1.5">
                            <Label>Team Allocated 2025</Label>
                            <Input className="h-11" value={formData.teamAllocated2025} onChange={(e) => updateField("teamAllocated2025", e.target.value)} />
                        </div>
                    </section>

                    {/* Maintenance */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-1">Maintenance</h3>

                        <div className="space-y-1.5">
                            <Label>Maintenance Notes</Label>
                            <Textarea rows={3} value={formData.maintenanceNotes} onChange={(e) => updateField("maintenanceNotes", e.target.value)} />
                        </div>
                    </section>

                    {/* Save / Cancel */}
                    <div className="space-y-2 pt-2 pb-8">
                        <Button className="w-full h-11" onClick={handleSave} disabled={isPending}>
                            {isPending ? "Saving…" : "Save Changes"}
                        </Button>
                        <Button variant="outline" className="w-full h-11" onClick={handleCancel} disabled={isPending}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function FieldRow({ label, value }: { label: string; value: string }) {
    return (
        <>
            <dt className="text-xs uppercase text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium">{value}</dd>
        </>
    );
}
