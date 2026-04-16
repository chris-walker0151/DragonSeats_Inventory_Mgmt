"use client";

import { useEffect, useState, useTransition } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import {
    LEAGUE_LABELS,
    LEAGUE_COLORS,
    CUSTOMER_STATUS_LABELS,
    CUSTOMER_STATUS_COLORS,
    CONTRACT_TYPE_LABELS,
    ALL_LEAGUES,
    ALL_CUSTOMER_STATUSES,
    ALL_CONTRACT_TYPES,
    CUSTOMER_FIELD_LABELS,
} from "@/lib/customers/constants";
import {
    PRODUCT_CATEGORY_LABELS,
    PRODUCT_CATEGORY_COLORS,
} from "@/lib/serialized-assets/constants";
import type { CustomerDetail } from "@/lib/customers/types";
import type { ActivityLogListItem } from "@/lib/activity-log/types";
import type { LeagueType, ContractType, CustomerStatus } from "@/generated/prisma/client";
import {
    fetchCustomerDetailAction,
    fetchCustomerActivityAction,
    createCustomerAction,
    updateCustomerAction,
} from "./actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Pencil, Clock, ArrowRight } from "lucide-react";

type SheetMode = "view" | "edit" | "create";

interface CustomerDetailSheetProps {
    customerId: string | null;
    open: boolean;
    onClose: () => void;
    mode?: "view" | "create";
    onSaved?: () => void;
}

interface CustomerFormData {
    teamName: string;
    league: LeagueType;
    organizationLegalName: string;
    contractType: ContractType;
    activeStatus: CustomerStatus;
    primaryContactName: string;
    primaryContactEmail: string;
    primaryContactPhone: string;
    stadiumName: string;
    stadiumAddress: string;
    contractStartDate: string;
    contractEndDate: string;
    roadContactName: string;
    loadingDock: string;
    fieldType: string;
    sidelineSetupNotes: string;
    sidelineSetupDiagram: string;
    homeBenches: string;
    homeShaders: string;
    homeCooling: string;
    homeHeat: string;
    roadBenches: string;
    roadShaders: string;
    roadCooling: string;
    roadHeat: string;
    notes: string;
}

const EMPTY_FORM: CustomerFormData = {
    teamName: "",
    league: "nfl",
    organizationLegalName: "",
    contractType: "seasonal_rental",
    activeStatus: "active",
    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
    stadiumName: "",
    stadiumAddress: "",
    contractStartDate: "",
    contractEndDate: "",
    roadContactName: "",
    loadingDock: "",
    fieldType: "",
    sidelineSetupNotes: "",
    sidelineSetupDiagram: "",
    homeBenches: "",
    homeShaders: "",
    homeCooling: "",
    homeHeat: "",
    roadBenches: "",
    roadShaders: "",
    roadCooling: "",
    roadHeat: "",
    notes: "",
};

function detailToForm(detail: CustomerDetail): CustomerFormData {
    return {
        teamName: detail.teamName,
        league: detail.league,
        organizationLegalName: detail.organizationLegalName,
        contractType: detail.contractType,
        activeStatus: detail.activeStatus,
        primaryContactName: detail.primaryContactName ?? "",
        primaryContactEmail: detail.primaryContactEmail ?? "",
        primaryContactPhone: detail.primaryContactPhone ?? "",
        stadiumName: detail.stadiumName ?? "",
        stadiumAddress: detail.stadiumAddress ?? "",
        contractStartDate: detail.contractStartDate ? new Date(detail.contractStartDate).toISOString().slice(0, 10) : "",
        contractEndDate: detail.contractEndDate ? new Date(detail.contractEndDate).toISOString().slice(0, 10) : "",
        roadContactName: detail.roadContactName ?? "",
        loadingDock: detail.loadingDock ?? "",
        fieldType: detail.fieldType ?? "",
        sidelineSetupNotes: detail.sidelineSetupNotes ?? "",
        sidelineSetupDiagram: detail.sidelineSetupDiagram ?? "",
        homeBenches: detail.homeBenches != null ? String(detail.homeBenches) : "",
        homeShaders: detail.homeShaders ?? "",
        homeCooling: detail.homeCooling ?? "",
        homeHeat: detail.homeHeat ?? "",
        roadBenches: detail.roadBenches != null ? String(detail.roadBenches) : "",
        roadShaders: detail.roadShaders ?? "",
        roadCooling: detail.roadCooling ?? "",
        roadHeat: detail.roadHeat ?? "",
        notes: detail.notes ?? "",
    };
}

export function CustomerDetailSheet({ customerId, open, onClose, mode: initialMode = "view", onSaved }: CustomerDetailSheetProps) {
    const [detail, setDetail] = useState<CustomerDetail | null>(null);
    const [activity, setActivity] = useState<ActivityLogListItem[]>([]);
    const [isPending, startTransition] = useTransition();
    const [sheetMode, setSheetMode] = useState<SheetMode>(initialMode);
    const [formData, setFormData] = useState<CustomerFormData>(EMPTY_FORM);
    const [activeTab, setActiveTab] = useState("profile");

    const isEditing = sheetMode === "edit" || sheetMode === "create";

    // Track prop changes and reset state during render
    const [prev, setPrev] = useState({ customerId, initialMode });
    if (prev.customerId !== customerId || prev.initialMode !== initialMode) {
        setPrev({ customerId, initialMode });
        setActiveTab("profile");
        if (initialMode === "create") {
            setSheetMode("create");
            setFormData(EMPTY_FORM);
            setDetail(null);
            setActivity([]);
        } else {
            setSheetMode("view");
            if (!customerId) { setDetail(null); setActivity([]); }
        }
    }

    // Fetch data for view mode
    useEffect(() => {
        if (initialMode !== "create" && customerId) {
            startTransition(async () => {
                try {
                    const [data, log] = await Promise.all([
                        fetchCustomerDetailAction(customerId),
                        fetchCustomerActivityAction(customerId),
                    ]);
                    setDetail(data);
                    setActivity(log);
                    if (data) setFormData(detailToForm(data));
                } catch {
                    toast.error("Failed to load customer details");
                }
            });
        }
    }, [customerId, initialMode]);

    function handleEdit() {
        if (detail) setFormData(detailToForm(detail));
        setSheetMode("edit");
    }

    function handleCancelEdit() {
        if (detail) setFormData(detailToForm(detail));
        setSheetMode("view");
    }

    function updateField(field: keyof CustomerFormData, value: string) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    function handleSave() {
        if (!formData.teamName.trim()) {
            toast.error("Team name is required");
            return;
        }
        if (!formData.organizationLegalName.trim()) {
            toast.error("Organization legal name is required");
            return;
        }

        startTransition(async () => {
            const payload = {
                league: formData.league,
                organizationLegalName: formData.organizationLegalName,
                contractType: formData.contractType,
                activeStatus: formData.activeStatus,
                primaryContactName: formData.primaryContactName || null,
                primaryContactEmail: formData.primaryContactEmail || null,
                primaryContactPhone: formData.primaryContactPhone || null,
                stadiumName: formData.stadiumName || null,
                stadiumAddress: formData.stadiumAddress || null,
                contractStartDate: formData.contractStartDate ? new Date(formData.contractStartDate) : null,
                contractEndDate: formData.contractEndDate ? new Date(formData.contractEndDate) : null,
                roadContactName: formData.roadContactName || null,
                loadingDock: formData.loadingDock || null,
                fieldType: formData.fieldType || null,
                sidelineSetupNotes: formData.sidelineSetupNotes || null,
                sidelineSetupDiagram: formData.sidelineSetupDiagram || null,
                homeBenches: formData.homeBenches ? parseInt(formData.homeBenches, 10) || null : null,
                homeShaders: formData.homeShaders || null,
                homeCooling: formData.homeCooling || null,
                homeHeat: formData.homeHeat || null,
                roadBenches: formData.roadBenches ? parseInt(formData.roadBenches, 10) || null : null,
                roadShaders: formData.roadShaders || null,
                roadCooling: formData.roadCooling || null,
                roadHeat: formData.roadHeat || null,
                notes: formData.notes || null,
            };

            try {
                if (sheetMode === "create") {
                    const { id } = await createCustomerAction({
                        teamName: formData.teamName.trim(),
                        ...payload,
                    });
                    toast.success("Customer created");
                    const [refreshed, log] = await Promise.all([
                        fetchCustomerDetailAction(id),
                        fetchCustomerActivityAction(id),
                    ]);
                    setDetail(refreshed);
                    setActivity(log);
                    if (refreshed) setFormData(detailToForm(refreshed));
                    setSheetMode("view");
                } else {
                    await updateCustomerAction(detail!.id, payload);
                    toast.success("Customer updated");
                    const [refreshed, log] = await Promise.all([
                        fetchCustomerDetailAction(detail!.id),
                        fetchCustomerActivityAction(detail!.id),
                    ]);
                    setDetail(refreshed);
                    setActivity(log);
                    if (refreshed) setFormData(detailToForm(refreshed));
                    setSheetMode("view");
                }
                onSaved?.();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to save");
            }
        });
    }

    const showLoading = initialMode !== "create" && (isPending || !detail);

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
                {showLoading ? (
                    <DetailSkeleton />
                ) : (
                    <>
                        {/* ── Header (baseball card top) ── */}
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                                {sheetMode === "create" ? (
                                    "New Customer"
                                ) : (
                                    <>
                                        {detail!.teamName}
                                        <Badge className={cn("text-[10px]", LEAGUE_COLORS[detail!.league])}>
                                            {LEAGUE_LABELS[detail!.league]}
                                        </Badge>
                                        <Badge className={cn("text-[10px]", CUSTOMER_STATUS_COLORS[detail!.activeStatus])}>
                                            {CUSTOMER_STATUS_LABELS[detail!.activeStatus]}
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
                                    ? "Fill in the details to create a new customer."
                                    : detail!.organizationLegalName}
                            </SheetDescription>
                        </SheetHeader>

                        {/* ── Tabs: Profile / Activity Log ── */}
                        {sheetMode === "create" ? (
                            <ProfileContent
                                isEditing={true}
                                sheetMode="create"
                                detail={null}
                                formData={formData}
                                updateField={updateField}
                                isPending={isPending}
                                onSave={handleSave}
                                onCancel={onClose}
                            />
                        ) : (
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                                <TabsList className="w-full">
                                    <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
                                    <TabsTrigger value="activity" className="flex-1">
                                        Activity Log
                                        {activity.length > 0 && (
                                            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                                                {activity.length}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="profile">
                                    <ProfileContent
                                        isEditing={isEditing}
                                        sheetMode={sheetMode}
                                        detail={detail}
                                        formData={formData}
                                        updateField={updateField}
                                        isPending={isPending}
                                        onSave={handleSave}
                                        onCancel={handleCancelEdit}
                                    />
                                </TabsContent>

                                <TabsContent value="activity">
                                    <ActivityLogContent entries={activity} />
                                </TabsContent>
                            </Tabs>
                        )}
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Profile Tab Content
   ═══════════════════════════════════════════════════════════════════════════ */

function ProfileContent({
    isEditing,
    sheetMode,
    detail,
    formData,
    updateField,
    isPending,
    onSave,
    onCancel,
}: {
    isEditing: boolean;
    sheetMode: SheetMode;
    detail: CustomerDetail | null;
    formData: CustomerFormData;
    updateField: (field: keyof CustomerFormData, value: string) => void;
    isPending: boolean;
    onSave: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="space-y-6 px-1 pt-2">
            {/* Organization */}
            <Section title="Organization">
                {isEditing ? (
                    <div className="space-y-3">
                        {sheetMode === "create" && (
                            <FormField label="Team Name *">
                                <Input value={formData.teamName} onChange={(e) => updateField("teamName", e.target.value)} placeholder="e.g. Cleveland Browns" />
                            </FormField>
                        )}
                        <FormField label="Organization Legal Name *">
                            <Input value={formData.organizationLegalName} onChange={(e) => updateField("organizationLegalName", e.target.value)} />
                        </FormField>
                        <FormField label="League *">
                            <Select value={formData.league} onValueChange={(v) => updateField("league", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {ALL_LEAGUES.map((l) => (
                                        <SelectItem key={l} value={l}>{LEAGUE_LABELS[l]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Contract Type *">
                            <Select value={formData.contractType} onValueChange={(v) => updateField("contractType", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {ALL_CONTRACT_TYPES.map((t) => (
                                        <SelectItem key={t} value={t}>{CONTRACT_TYPE_LABELS[t]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Status">
                            <Select value={formData.activeStatus} onValueChange={(v) => updateField("activeStatus", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {ALL_CUSTOMER_STATUSES.map((s) => (
                                        <SelectItem key={s} value={s}>{CUSTOMER_STATUS_LABELS[s]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Contract Start">
                                <Input type="date" value={formData.contractStartDate} onChange={(e) => updateField("contractStartDate", e.target.value)} />
                            </FormField>
                            <FormField label="Contract End">
                                <Input type="date" value={formData.contractEndDate} onChange={(e) => updateField("contractEndDate", e.target.value)} />
                            </FormField>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-xs text-muted-foreground">League</span>
                            <Badge className={cn("text-[10px]", LEAGUE_COLORS[detail!.league])}>
                                {LEAGUE_LABELS[detail!.league]}
                            </Badge>
                        </div>
                        <Field label="Contract" value={CONTRACT_TYPE_LABELS[detail!.contractType]} />
                        <Field label="Contract Start" value={detail!.contractStartDate ? new Date(detail!.contractStartDate).toLocaleDateString() : null} />
                        <Field label="Contract End" value={detail!.contractEndDate ? new Date(detail!.contractEndDate).toLocaleDateString() : null} />
                    </>
                )}
            </Section>

            {/* Contacts */}
            <Section title="Contacts">
                {isEditing ? (
                    <div className="space-y-3">
                        <FormField label="Stadium Contact">
                            <Input value={formData.primaryContactName} onChange={(e) => updateField("primaryContactName", e.target.value)} />
                        </FormField>
                        <FormField label="Email">
                            <Input type="email" value={formData.primaryContactEmail} onChange={(e) => updateField("primaryContactEmail", e.target.value)} />
                        </FormField>
                        <FormField label="Phone">
                            <Input value={formData.primaryContactPhone} onChange={(e) => updateField("primaryContactPhone", e.target.value)} />
                        </FormField>
                        <FormField label="Road Contact (Equipment Mgr)">
                            <Input value={formData.roadContactName} onChange={(e) => updateField("roadContactName", e.target.value)} />
                        </FormField>
                    </div>
                ) : (
                    <>
                        <Field label="Stadium Contact" value={detail!.primaryContactName} />
                        <Field label="Email" value={detail!.primaryContactEmail} />
                        <Field label="Phone" value={detail!.primaryContactPhone} />
                        <Field label="Road Contact" value={detail!.roadContactName} />
                    </>
                )}
            </Section>

            {/* Stadium & Field */}
            <Section title="Stadium & Field">
                {isEditing ? (
                    <div className="space-y-3">
                        <FormField label="Stadium Name">
                            <Input value={formData.stadiumName} onChange={(e) => updateField("stadiumName", e.target.value)} />
                        </FormField>
                        <FormField label="Address">
                            <Input value={formData.stadiumAddress} onChange={(e) => updateField("stadiumAddress", e.target.value)} />
                        </FormField>
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Field Type">
                                <Input value={formData.fieldType} onChange={(e) => updateField("fieldType", e.target.value)} placeholder="Turf / Grass" />
                            </FormField>
                            <FormField label="Loading Dock">
                                <Select value={formData.loadingDock || "__none"} onValueChange={(v) => updateField("loadingDock", v === "__none" ? "" : v)}>
                                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none">—</SelectItem>
                                        <SelectItem value="Yes">Yes</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </div>
                    </div>
                ) : (
                    <>
                        <Field label="Stadium" value={detail!.stadiumName} />
                        <Field label="Address" value={detail!.stadiumAddress} />
                        <Field label="Field Type" value={detail!.fieldType} />
                        <Field label="Loading Dock" value={detail!.loadingDock} />
                    </>
                )}
            </Section>

            {/* Home Equipment */}
            <Section title="Home Equipment">
                {isEditing ? (
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="# of Benches">
                            <Input type="number" value={formData.homeBenches} onChange={(e) => updateField("homeBenches", e.target.value)} />
                        </FormField>
                        <FormField label="Shaders">
                            <Input value={formData.homeShaders} onChange={(e) => updateField("homeShaders", e.target.value)} />
                        </FormField>
                        <FormField label="Cooling">
                            <Input value={formData.homeCooling} onChange={(e) => updateField("homeCooling", e.target.value)} placeholder="Water / Air" />
                        </FormField>
                        <FormField label="Heat">
                            <Input value={formData.homeHeat} onChange={(e) => updateField("homeHeat", e.target.value)} placeholder="LP / Natural Gas" />
                        </FormField>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-6">
                        <Field label="Benches" value={detail!.homeBenches != null ? String(detail!.homeBenches) : null} />
                        <Field label="Shaders" value={detail!.homeShaders} />
                        <Field label="Cooling" value={detail!.homeCooling} />
                        <Field label="Heat" value={detail!.homeHeat} />
                    </div>
                )}
            </Section>

            {/* Road Equipment */}
            <Section title="Road Equipment">
                {isEditing ? (
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="# of Benches">
                            <Input type="number" value={formData.roadBenches} onChange={(e) => updateField("roadBenches", e.target.value)} />
                        </FormField>
                        <FormField label="Shaders">
                            <Input value={formData.roadShaders} onChange={(e) => updateField("roadShaders", e.target.value)} />
                        </FormField>
                        <FormField label="Cooling">
                            <Input value={formData.roadCooling} onChange={(e) => updateField("roadCooling", e.target.value)} />
                        </FormField>
                        <FormField label="Heat">
                            <Input value={formData.roadHeat} onChange={(e) => updateField("roadHeat", e.target.value)} />
                        </FormField>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-6">
                        <Field label="Benches" value={detail!.roadBenches != null ? String(detail!.roadBenches) : null} />
                        <Field label="Shaders" value={detail!.roadShaders} />
                        <Field label="Cooling" value={detail!.roadCooling} />
                        <Field label="Heat" value={detail!.roadHeat} />
                    </div>
                )}
            </Section>

            {/* Sideline Setup */}
            <Section title="Sideline Setup">
                {isEditing ? (
                    <div className="space-y-3">
                        <FormField label="Setup Notes (For Jason)">
                            <Textarea value={formData.sidelineSetupNotes} onChange={(e) => updateField("sidelineSetupNotes", e.target.value)} rows={3} />
                        </FormField>
                        <FormField label="Diagram Reference">
                            <Input value={formData.sidelineSetupDiagram} onChange={(e) => updateField("sidelineSetupDiagram", e.target.value)} />
                        </FormField>
                    </div>
                ) : (
                    <>
                        <Field label="Setup Notes" value={detail!.sidelineSetupNotes} />
                        <Field label="Diagram" value={detail!.sidelineSetupDiagram} />
                    </>
                )}
            </Section>

            {/* Notes */}
            <Section title="Notes">
                {isEditing ? (
                    <FormField label="General Notes">
                        <Textarea value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} rows={3} placeholder="Any additional notes..." />
                    </FormField>
                ) : (
                    <p className="text-sm whitespace-pre-wrap">
                        {detail!.notes || <span className="text-muted-foreground/40">No notes.</span>}
                    </p>
                )}
            </Section>

            {/* Deployed Assets (view only) */}
            {!isEditing && detail && (
                <Section title={`Deployed Assets (${detail.deployedAssets.length})`}>
                    {detail.deployedAssets.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No assets currently deployed.</p>
                    ) : (
                        <div className="space-y-2">
                            {detail.deployedAssets.map((asset) => (
                                <div key={asset.id} className="flex items-center justify-between rounded-lg border p-2.5">
                                    <div className="flex items-center gap-2">
                                        <Badge className={cn("text-[10px]", PRODUCT_CATEGORY_COLORS[asset.productCategory])}>
                                            {PRODUCT_CATEGORY_LABELS[asset.productCategory]}
                                        </Badge>
                                        <span className="font-mono text-xs">{asset.serialNumber}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{asset.productTypeModel ?? ""}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </Section>
            )}

            {/* Save / Cancel buttons */}
            {isEditing && (
                <div className="sticky bottom-0 bg-background border-t pt-4 pb-4 flex gap-2">
                    <Button onClick={onSave} disabled={isPending} className="flex-1">
                        {isPending ? "Saving..." : sheetMode === "create" ? "Create Customer" : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={onCancel} disabled={isPending}>
                        Cancel
                    </Button>
                </div>
            )}

            {/* Metadata footer */}
            {!isEditing && detail && (
                <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 pb-4">
                    <span>Created {new Date(detail.createdAt).toLocaleDateString()}</span>
                    <span>Updated {new Date(detail.updatedAt).toLocaleDateString()}</span>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Activity Log Tab Content
   ═══════════════════════════════════════════════════════════════════════════ */

function ActivityLogContent({ entries }: { entries: ActivityLogListItem[] }) {
    if (entries.length === 0) {
        return (
            <div className="py-12 text-center">
                <Clock className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                    Changes will appear here when fields are edited.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-1 pt-2">
            {entries.map((entry) => (
                <div key={entry.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{entry.summary}</p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleDateString()}{" "}
                            {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    </div>
                    {entry.fieldChanged && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="font-medium">{CUSTOMER_FIELD_LABELS[entry.fieldChanged] ?? entry.fieldChanged}</span>
                            {entry.oldValue != null && (
                                <>
                                    <span className="line-through opacity-60">{entry.oldValue || "(empty)"}</span>
                                    <ArrowRight className="h-3 w-3 shrink-0" />
                                </>
                            )}
                            <span className="font-medium text-foreground">{entry.newValue || "(empty)"}</span>
                        </div>
                    )}
                    <div className="mt-1 text-[10px] text-muted-foreground/50">
                        {entry.method}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Shared helper components
   ═══════════════════════════════════════════════════════════════════════════ */

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
            <span className="text-sm font-medium max-w-[60%] text-right">
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

function DetailSkeleton() {
    return (
        <div className="space-y-6 p-4">
            <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <Separator />
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-32" />
                </div>
            ))}
            <Separator />
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-40" />
                </div>
            ))}
        </div>
    );
}
