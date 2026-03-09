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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityHistory } from "@/components/shared";
import {
    TICKET_STATUS_LABELS,
    TICKET_STATUS_COLORS,
    ALL_TICKET_STATUSES,
    PRIORITY_LABELS,
    ALL_PRIORITIES,
    PROBLEM_CATEGORY_LABELS,
    ALL_PROBLEM_CATEGORIES,
    RESOLUTION_OUTCOME_LABELS,
    ALL_RESOLUTION_OUTCOMES,
    DAYS_DOWN_WARNING,
    DAYS_DOWN_CRITICAL,
} from "@/lib/service-tickets/constants";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/serialized-assets/constants";
import {
    WAREHOUSE_LOCATION_LABELS,
} from "@/lib/serialized-assets/constants";
import { WAREHOUSES } from "@/lib/constants";
import type { ServiceTicketDetail } from "@/lib/service-tickets/types";
import type {
    TicketStatus,
    ProblemCategory,
    TicketPriority,
    WarehouseLocation,
    ResolutionOutcome,
    ProductCategory,
} from "@/generated/prisma/client";
import {
    fetchTicketDetailAction,
    createTicketAction,
    updateTicketAction,
    fetchAssetsForDropdownAction,
} from "./actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

type SheetMode = "view" | "edit" | "create";

interface TicketDetailSheetProps {
    ticketId: string | null;
    open: boolean;
    onClose: () => void;
    mode?: "view" | "create";
    onSaved?: () => void;
}

interface TicketFormData {
    assetId: string;
    hub: string;
    ticketStatus: string;
    problemCategory: string;
    priority: string;
    detailedNotes: string;
    assignedTechnician: string;
    targetCompletionDate: string;
    dateDownStarted: string;
    resolutionOutcome: string;
    resolutionNotes: string;
}

const EMPTY_FORM: TicketFormData = {
    assetId: "",
    hub: "cleveland_warehouse",
    ticketStatus: "open",
    problemCategory: "damage",
    priority: "medium",
    detailedNotes: "",
    assignedTechnician: "",
    targetCompletionDate: "",
    dateDownStarted: new Date().toISOString().slice(0, 10),
    resolutionOutcome: "",
    resolutionNotes: "",
};

function detailToForm(detail: ServiceTicketDetail): TicketFormData {
    return {
        assetId: detail.assetId,
        hub: detail.hub,
        ticketStatus: detail.ticketStatus,
        problemCategory: detail.problemCategory,
        priority: detail.priority,
        detailedNotes: detail.detailedNotes ?? "",
        assignedTechnician: detail.assignedTechnician ?? "",
        targetCompletionDate: detail.targetCompletionDate
            ? new Date(detail.targetCompletionDate).toISOString().slice(0, 10)
            : "",
        dateDownStarted: new Date(detail.dateDownStarted).toISOString().slice(0, 10),
        resolutionOutcome: detail.resolutionOutcome ?? "",
        resolutionNotes: detail.resolutionNotes ?? "",
    };
}

interface AssetOption {
    id: string;
    serialNumber: string;
    currentLocation: WarehouseLocation;
    productCategory: ProductCategory;
}

export function TicketDetailSheet({
    ticketId,
    open,
    onClose,
    mode: initialMode = "view",
    onSaved,
}: TicketDetailSheetProps) {
    const [detail, setDetail] = useState<ServiceTicketDetail | null>(null);
    const [isPending, startTransition] = useTransition();
    const [sheetMode, setSheetMode] = useState<SheetMode>(initialMode);
    const [formData, setFormData] = useState<TicketFormData>(EMPTY_FORM);
    const [assets, setAssets] = useState<AssetOption[]>([]);

    // Keep sheetMode in sync with initialMode prop changes
    useEffect(() => {
        setSheetMode(initialMode);
    }, [initialMode]);

    const isCreateMode = sheetMode === "create" || initialMode === "create";
    const isEditing = sheetMode === "edit" || sheetMode === "create" || isCreateMode;

    useEffect(() => {
        if (initialMode === "create") {
            setSheetMode("create");
            setFormData(EMPTY_FORM);
            setDetail(null);
            startTransition(async () => {
                const list = await fetchAssetsForDropdownAction();
                setAssets(list);
            });
            return;
        }

        setSheetMode("view");
        if (ticketId) {
            startTransition(async () => {
                const data = await fetchTicketDetailAction(ticketId);
                setDetail(data);
                if (data) setFormData(detailToForm(data));
            });
        } else {
            setDetail(null);
        }
    }, [ticketId, initialMode]);

    function handleEdit() {
        if (detail) setFormData(detailToForm(detail));
        setSheetMode("edit");
    }

    function handleCancelEdit() {
        if (detail) setFormData(detailToForm(detail));
        setSheetMode("view");
    }

    function updateField(field: keyof TicketFormData, value: string) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    function handleSave() {
        startTransition(async () => {
            try {
                if (sheetMode === "create") {
                    if (!formData.assetId) {
                        toast.error("Please select an asset");
                        return;
                    }
                    const { id } = await createTicketAction({
                        assetId: formData.assetId,
                        hub: formData.hub as WarehouseLocation,
                        problemCategory: formData.problemCategory as ProblemCategory,
                        priority: formData.priority as TicketPriority,
                        detailedNotes: formData.detailedNotes || null,
                        assignedTechnician: formData.assignedTechnician || null,
                        targetCompletionDate: formData.targetCompletionDate || null,
                        dateDownStarted: formData.dateDownStarted || null,
                    });
                    toast.success("Ticket created");
                    const refreshed = await fetchTicketDetailAction(id);
                    setDetail(refreshed);
                    if (refreshed) setFormData(detailToForm(refreshed));
                    setSheetMode("view");
                } else {
                    await updateTicketAction(detail!.id, {
                        ticketStatus: formData.ticketStatus as TicketStatus,
                        problemCategory: formData.problemCategory as ProblemCategory,
                        priority: formData.priority as TicketPriority,
                        detailedNotes: formData.detailedNotes || null,
                        assignedTechnician: formData.assignedTechnician || null,
                        targetCompletionDate: formData.targetCompletionDate || null,
                        resolutionOutcome: formData.resolutionOutcome
                            ? (formData.resolutionOutcome as ResolutionOutcome)
                            : null,
                        resolutionNotes: formData.resolutionNotes || null,
                    });
                    toast.success("Ticket updated");
                    const refreshed = await fetchTicketDetailAction(detail!.id);
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

    // Auto-set hub when asset is selected in create mode
    function handleAssetChange(assetId: string) {
        updateField("assetId", assetId);
        const asset = assets.find((a) => a.id === assetId);
        if (asset && asset.currentLocation !== "deployed_customer") {
            updateField("hub", asset.currentLocation);
        }
    }

    const showResolution =
        isEditing && (formData.ticketStatus === "completed");

    // Show loading skeleton if not in create mode and detail hasn't loaded
    const showContent = isCreateMode || (!isPending && detail !== null);

    function daysDownColor(days: number): string {
        if (days >= DAYS_DOWN_CRITICAL) return "text-red-500 font-semibold";
        if (days >= DAYS_DOWN_WARNING) return "text-orange-500 font-medium";
        return "";
    }

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                {!showContent ? (
                    <DetailSkeleton />
                ) : (
                    <>
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                                {isCreateMode ? (
                                    "New Service Ticket"
                                ) : (
                                    <>
                                        <span className="font-mono">
                                            {detail!.asset.serialNumber}
                                        </span>
                                        <Badge
                                            className={cn(
                                                "text-[10px]",
                                                TICKET_STATUS_COLORS[detail!.ticketStatus],
                                            )}
                                        >
                                            {TICKET_STATUS_LABELS[detail!.ticketStatus]}
                                        </Badge>
                                        {sheetMode === "view" && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="ml-auto h-7 w-7"
                                                onClick={handleEdit}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </>
                                )}
                            </SheetTitle>
                            <SheetDescription>
                                {isCreateMode
                                    ? "Create a service ticket for a down asset."
                                    : `${PRODUCT_CATEGORY_LABELS[detail!.asset.productCategory as ProductCategory] ?? detail!.asset.productCategory}${detail!.asset.productTypeModel ? ` — ${detail!.asset.productTypeModel}` : ""}`}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-6 px-1">
                            {/* Asset Info */}
                            {isCreateMode ? (
                                <Section title="Asset">
                                    <div className="space-y-3">
                                        <FormField label="Asset *">
                                            <Select
                                                value={formData.assetId || "none"}
                                                onValueChange={(v) =>
                                                    handleAssetChange(v === "none" ? "" : v)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select asset..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">
                                                        Select asset...
                                                    </SelectItem>
                                                    {assets.map((a) => (
                                                        <SelectItem key={a.id} value={a.id}>
                                                            {a.serialNumber}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                    </div>
                                </Section>
                            ) : (
                                <Section title="Asset Info">
                                    <Field
                                        label="Asset #"
                                        value={detail!.asset.serialNumber}
                                    />
                                    <Field
                                        label="Category"
                                        value={
                                            PRODUCT_CATEGORY_LABELS[
                                                detail!.asset
                                                    .productCategory as ProductCategory
                                            ] ?? detail!.asset.productCategory
                                        }
                                    />
                                    <Field
                                        label="Manufacturer"
                                        value={detail!.asset.manufacturer}
                                    />
                                    <Field
                                        label="Condition"
                                        value={detail!.asset.condition}
                                    />
                                </Section>
                            )}

                            {/* Ticket Details */}
                            <Section title="Ticket Details">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <FormField label="Hub *">
                                            <Select
                                                value={formData.hub}
                                                onValueChange={(v) =>
                                                    updateField("hub", v)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {WAREHOUSES.map((wh) => (
                                                        <SelectItem
                                                            key={wh.location}
                                                            value={wh.location}
                                                        >
                                                            {wh.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                        {sheetMode === "edit" && (
                                            <FormField label="Status">
                                                <Select
                                                    value={formData.ticketStatus}
                                                    onValueChange={(v) =>
                                                        updateField("ticketStatus", v)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ALL_TICKET_STATUSES.map((s) => (
                                                            <SelectItem key={s} value={s}>
                                                                {TICKET_STATUS_LABELS[s]}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormField>
                                        )}
                                        <FormField label="Priority">
                                            <Select
                                                value={formData.priority}
                                                onValueChange={(v) =>
                                                    updateField("priority", v)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ALL_PRIORITIES.map((p) => (
                                                        <SelectItem key={p} value={p}>
                                                            {PRIORITY_LABELS[p]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                        <FormField label="Problem Category *">
                                            <Select
                                                value={formData.problemCategory}
                                                onValueChange={(v) =>
                                                    updateField("problemCategory", v)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ALL_PROBLEM_CATEGORIES.map((c) => (
                                                        <SelectItem key={c} value={c}>
                                                            {PROBLEM_CATEGORY_LABELS[c]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                        <FormField label="Date Down Started">
                                            <Input
                                                type="date"
                                                value={formData.dateDownStarted}
                                                onChange={(e) =>
                                                    updateField(
                                                        "dateDownStarted",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </FormField>
                                    </div>
                                ) : (
                                    <>
                                        <Field
                                            label="Hub"
                                            value={
                                                WAREHOUSE_LOCATION_LABELS[detail!.hub]
                                            }
                                        />
                                        <Field
                                            label="Status"
                                            value={
                                                TICKET_STATUS_LABELS[detail!.ticketStatus]
                                            }
                                        />
                                        <Field
                                            label="Priority"
                                            value={PRIORITY_LABELS[detail!.priority]}
                                        />
                                        <Field
                                            label="Problem"
                                            value={
                                                PROBLEM_CATEGORY_LABELS[
                                                    detail!.problemCategory
                                                ]
                                            }
                                        />
                                        <div className="flex items-center justify-between py-1.5">
                                            <span className="text-xs text-muted-foreground">
                                                Days Down
                                            </span>
                                            <span
                                                className={cn(
                                                    "text-sm font-mono tabular-nums",
                                                    daysDownColor(detail!.daysDown),
                                                )}
                                            >
                                                {detail!.daysDown}d
                                            </span>
                                        </div>
                                        <Field
                                            label="Down Since"
                                            value={new Date(
                                                detail!.dateDownStarted,
                                            ).toLocaleDateString()}
                                        />
                                    </>
                                )}
                            </Section>

                            {/* Assignment */}
                            <Section title="Assignment">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <FormField label="Assigned Technician">
                                            <Input
                                                value={formData.assignedTechnician}
                                                onChange={(e) =>
                                                    updateField(
                                                        "assignedTechnician",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Technician name..."
                                            />
                                        </FormField>
                                        <FormField label="Target Completion Date">
                                            <Input
                                                type="date"
                                                value={formData.targetCompletionDate}
                                                onChange={(e) =>
                                                    updateField(
                                                        "targetCompletionDate",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </FormField>
                                    </div>
                                ) : (
                                    <>
                                        <Field
                                            label="Technician"
                                            value={detail!.assignedTechnician}
                                        />
                                        <Field
                                            label="Target Date"
                                            value={
                                                detail!.targetCompletionDate
                                                    ? new Date(
                                                          detail!.targetCompletionDate,
                                                      ).toLocaleDateString()
                                                    : null
                                            }
                                        />
                                    </>
                                )}
                            </Section>

                            {/* Notes */}
                            <Section title="Notes">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <FormField label="Detailed Notes">
                                            <Textarea
                                                value={formData.detailedNotes}
                                                onChange={(e) =>
                                                    updateField(
                                                        "detailedNotes",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Describe the issue..."
                                                rows={4}
                                            />
                                        </FormField>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap py-1.5">
                                        {detail!.detailedNotes || (
                                            <span className="text-muted-foreground/40">
                                                No notes
                                            </span>
                                        )}
                                    </p>
                                )}
                            </Section>

                            {/* Resolution (edit mode when completing, or view mode if completed) */}
                            {showResolution && (
                                <Section title="Resolution">
                                    <div className="space-y-3">
                                        <FormField label="Resolution Outcome">
                                            <Select
                                                value={
                                                    formData.resolutionOutcome || "none"
                                                }
                                                onValueChange={(v) =>
                                                    updateField(
                                                        "resolutionOutcome",
                                                        v === "none" ? "" : v,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select outcome..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">
                                                        None
                                                    </SelectItem>
                                                    {ALL_RESOLUTION_OUTCOMES.map((o) => (
                                                        <SelectItem key={o} value={o}>
                                                            {RESOLUTION_OUTCOME_LABELS[o]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                        <FormField label="Resolution Notes">
                                            <Textarea
                                                value={formData.resolutionNotes}
                                                onChange={(e) =>
                                                    updateField(
                                                        "resolutionNotes",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Resolution details..."
                                                rows={3}
                                            />
                                        </FormField>
                                    </div>
                                </Section>
                            )}

                            {/* Resolution view (completed tickets) */}
                            {!isEditing &&
                                detail &&
                                detail.ticketStatus === "completed" && (
                                    <Section title="Resolution">
                                        <Field
                                            label="Outcome"
                                            value={
                                                detail.resolutionOutcome
                                                    ? RESOLUTION_OUTCOME_LABELS[
                                                          detail.resolutionOutcome
                                                      ]
                                                    : null
                                            }
                                        />
                                        <Field
                                            label="Resolved Date"
                                            value={
                                                detail.resolvedDate
                                                    ? new Date(
                                                          detail.resolvedDate,
                                                      ).toLocaleDateString()
                                                    : null
                                            }
                                        />
                                        {detail.resolutionNotes && (
                                            <div className="py-1.5">
                                                <span className="text-xs text-muted-foreground">
                                                    Notes
                                                </span>
                                                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {detail.resolutionNotes}
                                                </p>
                                            </div>
                                        )}
                                    </Section>
                                )}

                            {/* Save / Cancel footer */}
                            {isEditing && (
                                <div className="sticky bottom-0 bg-background border-t pt-4 pb-4 flex gap-2">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isPending}
                                        className="flex-1"
                                    >
                                        {isPending
                                            ? "Saving..."
                                            : sheetMode === "create"
                                              ? "Create Ticket"
                                              : "Save Changes"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={
                                            sheetMode === "create"
                                                ? onClose
                                                : handleCancelEdit
                                        }
                                        disabled={isPending}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}

                            {/* Timestamps (view mode) */}
                            {!isEditing && detail && (
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 pb-4">
                                    <span>
                                        Created{" "}
                                        {new Date(
                                            detail.createdAt,
                                        ).toLocaleDateString()}
                                    </span>
                                    <span>
                                        Updated{" "}
                                        {new Date(
                                            detail.updatedAt,
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            )}

                            {/* Activity History (view mode) */}
                            {sheetMode === "view" && detail && (
                                <ActivityHistory
                                    entityType="ServiceTicket"
                                    entityId={detail.id}
                                />
                            )}
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

// ─── Shared sub-components ──────────────────────────────────────────────────

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
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

function Field({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">
                {value ?? (
                    <span className="text-muted-foreground/40">&mdash;</span>
                )}
            </span>
        </div>
    );
}

function FormField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
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
