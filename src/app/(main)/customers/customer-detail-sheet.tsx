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
    LEAGUE_LABELS,
    LEAGUE_COLORS,
    CUSTOMER_STATUS_LABELS,
    CUSTOMER_STATUS_COLORS,
    CONTRACT_TYPE_LABELS,
} from "@/lib/customers/constants";
import {
    PRODUCT_CATEGORY_LABELS,
    PRODUCT_CATEGORY_COLORS,
} from "@/lib/serialized-assets/constants";
import type { CustomerDetail } from "@/lib/customers/types";
import { fetchCustomerDetailAction } from "./actions";
import { cn } from "@/lib/utils";

interface CustomerDetailSheetProps {
    customerId: string | null;
    open: boolean;
    onClose: () => void;
}

export function CustomerDetailSheet({ customerId, open, onClose }: CustomerDetailSheetProps) {
    const [detail, setDetail] = useState<CustomerDetail | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (customerId) {
            startTransition(async () => {
                const data = await fetchCustomerDetailAction(customerId);
                setDetail(data);
            });
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDetail(null);
        }
    }, [customerId]);

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                {isPending || !detail ? (
                    <DetailSkeleton />
                ) : (
                    <>
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                                {detail.teamName}
                                <Badge
                                    className={cn(
                                        "text-[10px]",
                                        CUSTOMER_STATUS_COLORS[detail.activeStatus],
                                    )}
                                >
                                    {CUSTOMER_STATUS_LABELS[detail.activeStatus]}
                                </Badge>
                            </SheetTitle>
                            <SheetDescription>
                                {detail.organizationLegalName}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-6 px-1">
                            {/* League & Contract */}
                            <Section title="Organization">
                                <div className="flex items-center justify-between py-1.5">
                                    <span className="text-xs text-muted-foreground">League</span>
                                    <Badge
                                        className={cn(
                                            "text-[10px]",
                                            LEAGUE_COLORS[detail.league],
                                        )}
                                    >
                                        {LEAGUE_LABELS[detail.league]}
                                    </Badge>
                                </div>
                                <Field label="Contract" value={CONTRACT_TYPE_LABELS[detail.contractType]} />
                                <Field
                                    label="Contract Start"
                                    value={
                                        detail.contractStartDate
                                            ? new Date(detail.contractStartDate).toLocaleDateString()
                                            : null
                                    }
                                />
                                <Field
                                    label="Contract End"
                                    value={
                                        detail.contractEndDate
                                            ? new Date(detail.contractEndDate).toLocaleDateString()
                                            : null
                                    }
                                />
                            </Section>

                            {/* Contact Info */}
                            <Section title="Primary Contact">
                                <Field label="Name" value={detail.primaryContactName} />
                                <Field label="Email" value={detail.primaryContactEmail} />
                                <Field label="Phone" value={detail.primaryContactPhone} />
                            </Section>

                            {/* Stadium */}
                            <Section title="Stadium">
                                <Field label="Name" value={detail.stadiumName} />
                                <Field label="Address" value={detail.stadiumAddress} />
                            </Section>

                            {/* Deployed Assets */}
                            <Section title={`Deployed Assets (${detail.deployedAssets.length})`}>
                                {detail.deployedAssets.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">
                                        No assets currently deployed.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {detail.deployedAssets.map((asset) => (
                                            <div
                                                key={asset.id}
                                                className="flex items-center justify-between rounded-lg border p-2.5"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        className={cn(
                                                            "text-[10px]",
                                                            PRODUCT_CATEGORY_COLORS[asset.productCategory],
                                                        )}
                                                    >
                                                        {PRODUCT_CATEGORY_LABELS[asset.productCategory]}
                                                    </Badge>
                                                    <span className="font-mono text-xs">
                                                        {asset.serialNumber}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {asset.productTypeModel ?? ""}
                                                </span>
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
