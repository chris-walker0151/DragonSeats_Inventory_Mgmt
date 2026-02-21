"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    WAREHOUSE_LOCATION_LABELS,
    WAREHOUSE_LOCATION_COLORS,
} from "@/lib/serialized-assets/constants";
import type { QuantityInventoryListItem } from "@/lib/quantity-inventory/types";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface QuantityDetailSheetProps {
    item: QuantityInventoryListItem | null;
    open: boolean;
    onClose: () => void;
}

export function QuantityDetailSheet({ item, open, onClose }: QuantityDetailSheetProps) {
    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                {item && (
                    <>
                        <SheetHeader>
                            <SheetTitle>{item.itemCategory}</SheetTitle>
                            <SheetDescription>
                                {item.itemVariant ?? "No variant specified"}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-6 px-1">
                            <Separator />

                            {/* Stock Status */}
                            <div className="rounded-lg border p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Quantity on Hand</span>
                                    <span
                                        className={cn(
                                            "text-2xl font-bold tabular-nums",
                                            item.quantityOnHand <= item.reorderLevel && "text-amber-400",
                                        )}
                                    >
                                        {item.quantityOnHand}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Reorder Level</span>
                                    <span className="text-lg font-medium tabular-nums text-muted-foreground">
                                        {item.reorderLevel}
                                    </span>
                                </div>
                                {item.quantityOnHand <= item.reorderLevel && (
                                    <Badge variant="warning" className="gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        Below reorder level — restock needed
                                    </Badge>
                                )}
                            </div>

                            <Separator />

                            {/* Details */}
                            <div className="space-y-0.5">
                                <Field label="Location">
                                    <Badge
                                        className={cn(
                                            "text-[10px]",
                                            WAREHOUSE_LOCATION_COLORS[item.location],
                                        )}
                                    >
                                        {WAREHOUSE_LOCATION_LABELS[item.location]}
                                    </Badge>
                                </Field>
                                <Field label="Responsible Person" value={item.responsiblePerson} />
                                <Field
                                    label="Last Count Date"
                                    value={
                                        item.lastCountDate
                                            ? new Date(item.lastCountDate).toLocaleDateString()
                                            : null
                                    }
                                />
                            </div>

                            {/* Timestamps */}
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 pb-4">
                                <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
                                <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
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
        <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            {children ?? (
                <span className="text-sm font-medium">
                    {value ?? <span className="text-muted-foreground/40">—</span>}
                </span>
            )}
        </div>
    );
}
