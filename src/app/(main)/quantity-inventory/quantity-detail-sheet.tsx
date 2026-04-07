"use client";

import { useEffect, useState, useTransition } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
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
    WAREHOUSE_LOCATION_LABELS,
    WAREHOUSE_LOCATION_COLORS,
    ALL_WAREHOUSE_LOCATIONS,
} from "@/lib/serialized-assets/constants";
import type { QuantityInventoryListItem } from "@/lib/quantity-inventory/types";
import type { WarehouseLocation } from "@/generated/prisma/client";
import {
    fetchQuantityItemAction,
    createQuantityItemAction,
    updateQuantityItemAction,
} from "./actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityTab } from "@/components/shared/activity-tab";
import { fetchActivityForRecordAction } from "../shared-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AlertTriangle, Pencil } from "lucide-react";

type SheetMode = "view" | "edit" | "create";

interface QuantityDetailSheetProps {
    itemId: string | null;
    open: boolean;
    onClose: () => void;
    mode?: "view" | "create";
    onSaved?: () => void;
}

interface QuantityFormData {
    itemCategory: string;
    itemVariant: string;
    location: WarehouseLocation;
    quantityOnHand: string;
    reorderLevel: string;
    responsiblePerson: string;
}

const EMPTY_FORM: QuantityFormData = {
    itemCategory: "",
    itemVariant: "",
    location: "cleveland_warehouse",
    quantityOnHand: "0",
    reorderLevel: "0",
    responsiblePerson: "",
};

function itemToForm(item: QuantityInventoryListItem): QuantityFormData {
    return {
        itemCategory: item.itemCategory,
        itemVariant: item.itemVariant ?? "",
        location: item.location,
        quantityOnHand: item.quantityOnHand.toString(),
        reorderLevel: item.reorderLevel.toString(),
        responsiblePerson: item.responsiblePerson ?? "",
    };
}

export function QuantityDetailSheet({ itemId, open, onClose, mode: initialMode = "view", onSaved }: QuantityDetailSheetProps) {
    const [item, setItem] = useState<QuantityInventoryListItem | null>(null);
    const [isPending, startTransition] = useTransition();
    const [sheetMode, setSheetMode] = useState<SheetMode>(initialMode);
    const [formData, setFormData] = useState<QuantityFormData>(EMPTY_FORM);

    const isEditing = sheetMode === "edit" || sheetMode === "create";

    // Track prop changes and reset state during render (avoids setState in useEffect)
    const [prev, setPrev] = useState({ itemId, initialMode });
    if (prev.itemId !== itemId || prev.initialMode !== initialMode) {
        setPrev({ itemId, initialMode });
        if (initialMode === "create") {
            setSheetMode("create");
            setFormData(EMPTY_FORM);
            setItem(null);
        } else {
            setSheetMode("view");
            if (!itemId) setItem(null);
        }
    }

    // Fetch data only for view mode
    useEffect(() => {
        if (initialMode !== "create" && itemId) {
            startTransition(async () => {
                const data = await fetchQuantityItemAction(itemId);
                setItem(data);
                if (data) setFormData(itemToForm(data));
            });
        }
    }, [itemId, initialMode]);

    function handleEdit() {
        if (item) setFormData(itemToForm(item));
        setSheetMode("edit");
    }

    function handleCancelEdit() {
        if (item) setFormData(itemToForm(item));
        setSheetMode("view");
    }

    function updateField(field: keyof QuantityFormData, value: string) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    function handleSave() {
        if (!formData.itemCategory.trim()) {
            toast.error("Item category is required");
            return;
        }

        startTransition(async () => {
            const payload = {
                itemCategory: formData.itemCategory.trim(),
                itemVariant: formData.itemVariant || null,
                location: formData.location,
                quantityOnHand: Number(formData.quantityOnHand) || 0,
                reorderLevel: Number(formData.reorderLevel) || 0,
                responsiblePerson: formData.responsiblePerson || null,
            };

            try {
                if (sheetMode === "create") {
                    const { id } = await createQuantityItemAction(payload);
                    toast.success("Item created");
                    const refreshed = await fetchQuantityItemAction(id);
                    setItem(refreshed);
                    if (refreshed) setFormData(itemToForm(refreshed));
                    setSheetMode("view");
                } else {
                    await updateQuantityItemAction(item!.id, payload);
                    toast.success("Item updated");
                    const refreshed = await fetchQuantityItemAction(item!.id);
                    setItem(refreshed);
                    if (refreshed) setFormData(itemToForm(refreshed));
                    setSheetMode("view");
                }
                onSaved?.();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to save");
            }
        });
    }

    const showLoading = initialMode !== "create" && (isPending || !item);

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                {showLoading ? (
                    <DetailSkeleton />
                ) : (
                    <>
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                                {sheetMode === "create" ? (
                                    "New Inventory Item"
                                ) : (
                                    <>
                                        {item!.itemCategory}
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
                                    ? "Fill in the details to create a new inventory item."
                                    : item!.itemVariant ?? "No variant specified"}
                            </SheetDescription>
                        </SheetHeader>

                        <Tabs defaultValue="details" className="px-1">
                            {!isEditing && item && (
                                <TabsList className="w-full mb-4">
                                    <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                                    <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                                </TabsList>
                            )}
                            <TabsContent value="details" className="space-y-6 mt-0">
                            {isEditing ? (
                                <>
                                    <Section title="Item Details">
                                        <div className="space-y-3">
                                            <FormField label="Item Category *">
                                                <Input value={formData.itemCategory} onChange={(e) => updateField("itemCategory", e.target.value)} placeholder="e.g. Fasteners, Tubing" />
                                            </FormField>
                                            <FormField label="Item Variant">
                                                <Input value={formData.itemVariant} onChange={(e) => updateField("itemVariant", e.target.value)} placeholder="e.g. 1/4 inch, Blue" />
                                            </FormField>
                                            <FormField label="Location *">
                                                <Select value={formData.location} onValueChange={(v) => updateField("location", v)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {ALL_WAREHOUSE_LOCATIONS.filter((l) => l !== "deployed_customer").map((l) => (
                                                            <SelectItem key={l} value={l}>{WAREHOUSE_LOCATION_LABELS[l]}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormField>
                                            <FormField label="Quantity on Hand *">
                                                <Input type="number" min="0" value={formData.quantityOnHand} onChange={(e) => updateField("quantityOnHand", e.target.value)} />
                                            </FormField>
                                            <FormField label="Reorder Level">
                                                <Input type="number" min="0" value={formData.reorderLevel} onChange={(e) => updateField("reorderLevel", e.target.value)} />
                                            </FormField>
                                            <FormField label="Responsible Person">
                                                <Input value={formData.responsiblePerson} onChange={(e) => updateField("responsiblePerson", e.target.value)} />
                                            </FormField>
                                        </div>
                                    </Section>

                                    <div className="sticky bottom-0 bg-background border-t pt-4 pb-4 flex gap-2">
                                        <Button onClick={handleSave} disabled={isPending} className="flex-1">
                                            {isPending ? "Saving..." : sheetMode === "create" ? "Create Item" : "Save Changes"}
                                        </Button>
                                        <Button variant="outline" onClick={sheetMode === "create" ? onClose : handleCancelEdit} disabled={isPending}>
                                            Cancel
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Separator />

                                    {/* Stock Status */}
                                    <div className="rounded-lg border p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Quantity on Hand</span>
                                            <span
                                                className={cn(
                                                    "text-2xl font-bold tabular-nums",
                                                    item!.quantityOnHand <= item!.reorderLevel && "text-amber-400",
                                                )}
                                            >
                                                {item!.quantityOnHand}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Reorder Level</span>
                                            <span className="text-lg font-medium tabular-nums text-muted-foreground">
                                                {item!.reorderLevel}
                                            </span>
                                        </div>
                                        {item!.quantityOnHand <= item!.reorderLevel && (
                                            <Badge variant="warning" className="gap-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                Below reorder level — restock needed
                                            </Badge>
                                        )}
                                    </div>

                                    <Separator />

                                    <div className="space-y-0.5">
                                        <Field label="Location">
                                            <Badge className={cn("text-[10px]", WAREHOUSE_LOCATION_COLORS[item!.location])}>
                                                {WAREHOUSE_LOCATION_LABELS[item!.location]}
                                            </Badge>
                                        </Field>
                                        <Field label="Responsible Person" value={item!.responsiblePerson} />
                                        <Field
                                            label="Last Count Date"
                                            value={item!.lastCountDate ? new Date(item!.lastCountDate).toLocaleDateString() : null}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 pb-4">
                                        <span>Created {new Date(item!.createdAt).toLocaleDateString()}</span>
                                        <span>Updated {new Date(item!.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </>
                            )}
                            </TabsContent>
                            {!isEditing && item && (
                                <TabsContent value="activity" className="mt-0">
                                    <ActivityTab
                                        recordId={item.id}
                                        collectionName="quantity-inventory"
                                        fetchAction={fetchActivityForRecordAction}
                                    />
                                </TabsContent>
                            )}
                        </Tabs>
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

function Field({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            {children ?? (
                <span className="text-sm font-medium">
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

function DetailSkeleton() {
    return (
        <div className="space-y-6 p-4">
            <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-48" />
            </div>
            <Separator />
            <Skeleton className="h-24 w-full" />
            <Separator />
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-32" />
                </div>
            ))}
        </div>
    );
}
