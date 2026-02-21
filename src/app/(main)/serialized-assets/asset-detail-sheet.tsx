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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    PRODUCT_CATEGORY_LABELS,
    LIFECYCLE_STATUS_LABELS,
    LIFECYCLE_STATUS_COLORS,
    WAREHOUSE_LOCATION_LABELS,
    BRANDING_STATUS_LABELS,
    BRANDING_STATUS_COLORS,
} from "@/lib/serialized-assets/constants";
import type { SerializedAssetDetail } from "@/lib/serialized-assets/types";
import { fetchAssetDetail } from "./actions";
import { cn } from "@/lib/utils";

interface AssetDetailSheetProps {
    assetId: string | null;
    open: boolean;
    onClose: () => void;
}

export function AssetDetailSheet({ assetId, open, onClose }: AssetDetailSheetProps) {
    const [detail, setDetail] = useState<SerializedAssetDetail | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (assetId) {
            startTransition(async () => {
                const data = await fetchAssetDetail(assetId);
                setDetail(data);
            });
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDetail(null);
        }
    }, [assetId]);

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

                        <div className="space-y-6 px-1">
                            {/* General Info */}
                            <Section title="General">
                                <Field label="SKU" value={detail.sku?.sku} />
                                <Field label="Location" value={WAREHOUSE_LOCATION_LABELS[detail.currentLocation]} />
                                <Field label="Customer" value={detail.customer?.teamName} />
                                <Field label="Date Acquired" value={detail.dateAcquired ? new Date(detail.dateAcquired).toLocaleDateString() : null} />
                                <Field label="Responsible" value={detail.responsiblePerson} />
                                <Field label="Manufacturer" value={detail.manufacturer} />
                                <Field label="Year Manufactured" value={detail.yearManufactured?.toString()} />
                            </Section>

                            {/* Category-specific fields */}
                            {detail.productCategory === "bench" && (
                                <Section title="Bench Details">
                                    <Field label="Bench Type" value={detail.benchType} />
                                    <Field label="Flange/Diffuser" value={detail.flangeOrDiffuser} />
                                    <Field label="Wheel Type" value={detail.wheelType} />
                                    <Field label="Vent Holes" value={detail.ventHoles != null ? (detail.ventHoles ? "Yes" : "No") : null} />
                                    {detail.brandingStatus && (
                                        <div className="flex items-center justify-between py-1.5">
                                            <span className="text-xs text-muted-foreground">Branding</span>
                                            <Badge
                                                className={cn(
                                                    "text-[10px]",
                                                    BRANDING_STATUS_COLORS[detail.brandingStatus],
                                                )}
                                            >
                                                {BRANDING_STATUS_LABELS[detail.brandingStatus]}
                                            </Badge>
                                        </div>
                                    )}
                                    <Field label="Branding Desc" value={detail.brandingDescription} />
                                </Section>
                            )}

                            {detail.productCategory === "heater" && (
                                <Section title="Heater Details">
                                    <Field label="Heater Type" value={detail.heaterType} />
                                    <Field label="BTU Level" value={detail.btuLevel} />
                                </Section>
                            )}

                            {detail.productCategory === "ac_unit" && (
                                <Section title="AC Unit Details">
                                    <Field label="BTU Rating" value={detail.btuRating?.toLocaleString()} />
                                    <Field label="Amps" value={detail.amps?.toString()} />
                                </Section>
                            )}

                            {/* Notes */}
                            {detail.notes && (
                                <Section title="Notes">
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {detail.notes}
                                    </p>
                                </Section>
                            )}

                            {/* Deployment History */}
                            <Section title="Deployment History">
                                {detail.deployments.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No deployments recorded.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {detail.deployments.map((d) => (
                                            <div
                                                key={d.id}
                                                className="rounded-lg border p-3 text-sm space-y-1"
                                            >
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

                            {/* Timestamps */}
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 pb-4">
                                <span>Created {new Date(detail.createdAt).toLocaleDateString()}</span>
                                <span>Updated {new Date(detail.updatedAt).toLocaleDateString()}</span>
                            </div>
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
