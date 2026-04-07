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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    PRODUCT_CATEGORY_LABELS,
    LIFECYCLE_STATUS_LABELS,
    LIFECYCLE_STATUS_COLORS,
    WAREHOUSE_LOCATION_LABELS,
} from "@/lib/maintenance/constants";
import type { MaintenanceAssetDetail } from "@/lib/maintenance/types";
import { fetchMaintenanceDetailAction, updateMaintenanceInfoAction } from "./actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityTab } from "@/components/shared/activity-tab";
import { fetchActivityForRecordAction } from "../shared-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MaintenanceDetailSheetProps {
    assetId: string | null;
    open: boolean;
    onClose: () => void;
}

export function MaintenanceDetailSheet({ assetId, open, onClose }: MaintenanceDetailSheetProps) {
    const [detail, setDetail] = useState<MaintenanceAssetDetail | null>(null);
    const [isPending, startTransition] = useTransition();

    // Editable fields
    const [maintNotes, setMaintNotes] = useState("");
    const [lastRefurbDate, setLastRefurbDate] = useState("");

    useEffect(() => {
        if (assetId) {
            startTransition(async () => {
                try {
                    const data = await fetchMaintenanceDetailAction(assetId);
                    setDetail(data);
                    if (data) {
                        setMaintNotes(data.maintenanceNotes ?? "");
                        setLastRefurbDate(
                            data.lastRefurbishedDate
                                ? new Date(data.lastRefurbishedDate).toISOString().slice(0, 10)
                                : "",
                        );
                    }
                } catch {
                    toast.error("Failed to load maintenance details");
                }
            });
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDetail(null);
        }
    }, [assetId]);

    function handleSave() {
        if (!detail) return;
        startTransition(async () => {
            await updateMaintenanceInfoAction({
                id: detail.id,
                maintenanceNotes: maintNotes || null,
                lastRefurbishedDate: lastRefurbDate || null,
            });
            toast.success("Maintenance info updated");
            const refreshed = await fetchMaintenanceDetailAction(detail.id);
            setDetail(refreshed);
        });
    }

    const hasChanges = detail && (
        (maintNotes || "") !== (detail.maintenanceNotes ?? "") ||
        (lastRefurbDate || "") !== (detail.lastRefurbishedDate ? new Date(detail.lastRefurbishedDate).toISOString().slice(0, 10) : "")
    );

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                {isPending || !detail ? (
                    <DetailSkeleton />
                ) : (
                    <>
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                                <span className="font-mono">{detail.serialNumber}</span>
                                <Badge
                                    className={cn(
                                        "text-[10px]",
                                        LIFECYCLE_STATUS_COLORS[detail.lifecycleStatus],
                                    )}
                                >
                                    {LIFECYCLE_STATUS_LABELS[detail.lifecycleStatus]}
                                </Badge>
                            </SheetTitle>
                            <SheetDescription>
                                {PRODUCT_CATEGORY_LABELS[detail.productCategory]}
                                {detail.productTypeModel && ` — ${detail.productTypeModel}`}
                            </SheetDescription>
                        </SheetHeader>

                        <Tabs defaultValue="details" className="px-1">
                            {detail && (
                                <TabsList className="w-full mb-4">
                                    <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                                    <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                                </TabsList>
                            )}
                            <TabsContent value="details" className="space-y-6 mt-0">
                            {/* Asset Info (read-only) */}
                            <Section title="Asset Info">
                                <Field label="Location" value={WAREHOUSE_LOCATION_LABELS[detail.currentLocation]} />
                                <Field label="Customer" value={detail.customerName} />
                                <Field label="Manufacturer" value={detail.manufacturer} />
                                <Field label="Year Manufactured" value={detail.yearManufactured?.toString()} />
                                <Field label="Date Acquired" value={detail.dateAcquired ? new Date(detail.dateAcquired).toLocaleDateString() : null} />
                            </Section>

                            {/* Maintenance (editable) */}
                            <Section title="Maintenance">
                                <div className="space-y-3 pt-1">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Last Refurbished Date</Label>
                                        <Input
                                            type="date"
                                            value={lastRefurbDate}
                                            onChange={(e) => setLastRefurbDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Maintenance Notes</Label>
                                        <textarea
                                            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            value={maintNotes}
                                            onChange={(e) => setMaintNotes(e.target.value)}
                                            placeholder="Describe damage, repairs needed, or maintenance observations..."
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSave}
                                        disabled={!hasChanges || isPending}
                                        className="w-full"
                                    >
                                        {isPending ? "Saving..." : "Save Maintenance Info"}
                                    </Button>
                                </div>
                            </Section>

                            {/* General notes */}
                            {detail.notes && (
                                <Section title="General Notes">
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {detail.notes}
                                    </p>
                                </Section>
                            )}
                            </TabsContent>
                            {detail && (
                                <TabsContent value="activity" className="mt-0">
                                    <ActivityTab
                                        recordId={detail.id}
                                        collectionName="serialized-assets"
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
                {value ?? <span className="text-muted-foreground/40">—</span>}
            </span>
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
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-32" />
                </div>
            ))}
            <Separator />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    );
}
