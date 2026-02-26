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
    LEAGUE_LABELS,
    LEAGUE_COLORS,
    CUSTOMER_STATUS_LABELS,
    CUSTOMER_STATUS_COLORS,
    CONTRACT_TYPE_LABELS,
    ALL_LEAGUES,
    ALL_CUSTOMER_STATUSES,
    ALL_CONTRACT_TYPES,
} from "@/lib/customers/constants";
import {
    PRODUCT_CATEGORY_LABELS,
    PRODUCT_CATEGORY_COLORS,
} from "@/lib/serialized-assets/constants";
import type { CustomerDetail } from "@/lib/customers/types";
import type { LeagueType, ContractType, CustomerStatus } from "@/generated/prisma/client";
import {
    fetchCustomerDetailAction,
    createCustomerAction,
    updateCustomerAction,
} from "./actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

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
    };
}

export function CustomerDetailSheet({ customerId, open, onClose, mode: initialMode = "view", onSaved }: CustomerDetailSheetProps) {
    const [detail, setDetail] = useState<CustomerDetail | null>(null);
    const [isPending, startTransition] = useTransition();
    const [sheetMode, setSheetMode] = useState<SheetMode>(initialMode);
    const [formData, setFormData] = useState<CustomerFormData>(EMPTY_FORM);

    const isEditing = sheetMode === "edit" || sheetMode === "create";

    useEffect(() => {
        if (initialMode === "create") {
            setSheetMode("create");
            setFormData(EMPTY_FORM);
            setDetail(null);
            return;
        }

        setSheetMode("view");
        if (customerId) {
            startTransition(async () => {
                const data = await fetchCustomerDetailAction(customerId);
                setDetail(data);
                if (data) setFormData(detailToForm(data));
            });
        } else {
            setDetail(null);
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
            };

            try {
                if (sheetMode === "create") {
                    const { id } = await createCustomerAction({
                        teamName: formData.teamName.trim(),
                        ...payload,
                    });
                    toast.success("Customer created");
                    const refreshed = await fetchCustomerDetailAction(id);
                    setDetail(refreshed);
                    if (refreshed) setFormData(detailToForm(refreshed));
                    setSheetMode("view");
                } else {
                    await updateCustomerAction(detail!.id, payload);
                    toast.success("Customer updated");
                    const refreshed = await fetchCustomerDetailAction(detail!.id);
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

    const showLoading = initialMode !== "create" && (isPending || !detail);

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
                                    "New Customer"
                                ) : (
                                    <>
                                        {detail!.teamName}
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

                        <div className="space-y-6 px-1">
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
                                        <FormField label="Contract Start">
                                            <Input type="date" value={formData.contractStartDate} onChange={(e) => updateField("contractStartDate", e.target.value)} />
                                        </FormField>
                                        <FormField label="Contract End">
                                            <Input type="date" value={formData.contractEndDate} onChange={(e) => updateField("contractEndDate", e.target.value)} />
                                        </FormField>
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

                            <Section title="Primary Contact">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <FormField label="Name">
                                            <Input value={formData.primaryContactName} onChange={(e) => updateField("primaryContactName", e.target.value)} />
                                        </FormField>
                                        <FormField label="Email">
                                            <Input type="email" value={formData.primaryContactEmail} onChange={(e) => updateField("primaryContactEmail", e.target.value)} />
                                        </FormField>
                                        <FormField label="Phone">
                                            <Input value={formData.primaryContactPhone} onChange={(e) => updateField("primaryContactPhone", e.target.value)} />
                                        </FormField>
                                    </div>
                                ) : (
                                    <>
                                        <Field label="Name" value={detail!.primaryContactName} />
                                        <Field label="Email" value={detail!.primaryContactEmail} />
                                        <Field label="Phone" value={detail!.primaryContactPhone} />
                                    </>
                                )}
                            </Section>

                            <Section title="Stadium">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <FormField label="Name">
                                            <Input value={formData.stadiumName} onChange={(e) => updateField("stadiumName", e.target.value)} />
                                        </FormField>
                                        <FormField label="Address">
                                            <Input value={formData.stadiumAddress} onChange={(e) => updateField("stadiumAddress", e.target.value)} />
                                        </FormField>
                                    </div>
                                ) : (
                                    <>
                                        <Field label="Name" value={detail!.stadiumName} />
                                        <Field label="Address" value={detail!.stadiumAddress} />
                                    </>
                                )}
                            </Section>

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

                            {isEditing && (
                                <div className="sticky bottom-0 bg-background border-t pt-4 pb-4 flex gap-2">
                                    <Button onClick={handleSave} disabled={isPending} className="flex-1">
                                        {isPending ? "Saving..." : sheetMode === "create" ? "Create Customer" : "Save Changes"}
                                    </Button>
                                    <Button variant="outline" onClick={sheetMode === "create" ? onClose : handleCancelEdit} disabled={isPending}>
                                        Cancel
                                    </Button>
                                </div>
                            )}

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
