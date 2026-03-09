"use client";

import { useState, useTransition } from "react";
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
import {
    TRANSFER_STATUS_LABELS,
    TRANSFER_STATUS_COLORS,
} from "@/lib/transfers/constants";
import {
    WAREHOUSE_LOCATION_LABELS,
    WAREHOUSE_LOCATION_COLORS,
    PRODUCT_CATEGORY_LABELS,
    PRODUCT_CATEGORY_COLORS,
} from "@/lib/serialized-assets/constants";
import type { TransferListItem } from "@/lib/transfers/types";
import { updateTransferStatusAction } from "./actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowRight, Truck, PackageCheck, XCircle } from "lucide-react";

interface TransferDetailSheetProps {
    transfer: TransferListItem | null;
    open: boolean;
    onClose: () => void;
}

export function TransferDetailSheet({
    transfer,
    open,
    onClose,
}: TransferDetailSheetProps) {
    const [isPending, startTransition] = useTransition();
    const [receivedBy, setReceivedBy] = useState("");

    if (!transfer) return null;

    const isAsset = transfer.assetId !== null;
    const canMarkInTransit = transfer.transferStatus === "initiated";
    const canMarkReceived = transfer.transferStatus === "in_transit";
    const canCancel =
        transfer.transferStatus === "initiated" ||
        transfer.transferStatus === "in_transit";
    const isTerminal =
        transfer.transferStatus === "received" ||
        transfer.transferStatus === "cancelled";

    function handleStatusUpdate(status: "in_transit" | "received" | "cancelled") {
        startTransition(async () => {
            try {
                await updateTransferStatusAction({
                    id: transfer!.id,
                    status,
                    receivedBy: status === "received" ? receivedBy || null : null,
                });
                toast.success(
                    status === "in_transit"
                        ? "Transfer marked in transit"
                        : status === "received"
                          ? "Transfer received — asset location updated"
                          : "Transfer cancelled",
                );
                setReceivedBy("");
                onClose();
            } catch (err) {
                toast.error(
                    err instanceof Error ? err.message : "Failed to update transfer",
                );
            }
        });
    }

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent className="overflow-y-auto sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Transfer Details</SheetTitle>
                    <SheetDescription>
                        {isAsset
                            ? `Asset ${transfer.assetSerialNumber}`
                            : `${transfer.quantityItemCategory}${transfer.quantity != null ? ` ×${transfer.quantity}` : ""}`}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 pt-6">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                        <Label className="text-muted-foreground">Status</Label>
                        <Badge
                            className={cn(
                                "text-xs",
                                TRANSFER_STATUS_COLORS[transfer.transferStatus],
                            )}
                        >
                            {TRANSFER_STATUS_LABELS[transfer.transferStatus]}
                        </Badge>
                    </div>

                    <Separator />

                    {/* Item Info */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium">Item</h4>
                        {isAsset ? (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Serial Number
                                    </Label>
                                    <p className="text-sm font-mono">
                                        {transfer.assetSerialNumber}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Category
                                    </Label>
                                    <div className="pt-0.5">
                                        {transfer.assetProductCategory && (
                                            <Badge
                                                className={cn(
                                                    "text-[10px]",
                                                    PRODUCT_CATEGORY_COLORS[
                                                        transfer.assetProductCategory
                                                    ],
                                                )}
                                            >
                                                {
                                                    PRODUCT_CATEGORY_LABELS[
                                                        transfer.assetProductCategory
                                                    ]
                                                }
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Item
                                    </Label>
                                    <p className="text-sm">
                                        {transfer.quantityItemCategory}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Quantity
                                    </Label>
                                    <p className="text-sm">{transfer.quantity ?? "—"}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Route */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium">Route</h4>
                        <div className="flex items-center gap-2">
                            <Badge
                                className={cn(
                                    "text-[10px]",
                                    WAREHOUSE_LOCATION_COLORS[transfer.originLocation],
                                )}
                            >
                                {WAREHOUSE_LOCATION_LABELS[transfer.originLocation]}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            <Badge
                                className={cn(
                                    "text-[10px]",
                                    WAREHOUSE_LOCATION_COLORS[
                                        transfer.destinationLocation
                                    ],
                                )}
                            >
                                {
                                    WAREHOUSE_LOCATION_LABELS[
                                        transfer.destinationLocation
                                    ]
                                }
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* Dates & Personnel */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium">Details</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs text-muted-foreground">
                                    Transfer Date
                                </Label>
                                <p className="text-sm tabular-nums">
                                    {new Date(
                                        transfer.transferDate,
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">
                                    Initiated By
                                </Label>
                                <p className="text-sm">
                                    {transfer.transferInitiatedBy ?? "—"}
                                </p>
                            </div>
                            {transfer.transferReceivedBy && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Received By
                                    </Label>
                                    <p className="text-sm">
                                        {transfer.transferReceivedBy}
                                    </p>
                                </div>
                            )}
                        </div>
                        {transfer.notes && (
                            <div>
                                <Label className="text-xs text-muted-foreground">
                                    Notes
                                </Label>
                                <p className="text-sm whitespace-pre-wrap">
                                    {transfer.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {!isTerminal && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium">
                                    Update Status
                                </h4>

                                {canMarkReceived && (
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="received-by"
                                            className="text-xs text-muted-foreground"
                                        >
                                            Received By
                                        </Label>
                                        <Input
                                            id="received-by"
                                            placeholder="Name of person receiving"
                                            value={receivedBy}
                                            onChange={(e) =>
                                                setReceivedBy(e.target.value)
                                            }
                                        />
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {canMarkInTransit && (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleStatusUpdate("in_transit")
                                            }
                                            disabled={isPending}
                                        >
                                            <Truck className="mr-1.5 h-3.5 w-3.5" />
                                            Mark In Transit
                                        </Button>
                                    )}
                                    {canMarkReceived && (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleStatusUpdate("received")
                                            }
                                            disabled={isPending}
                                        >
                                            <PackageCheck className="mr-1.5 h-3.5 w-3.5" />
                                            Mark Received
                                        </Button>
                                    )}
                                    {canCancel && (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                handleStatusUpdate("cancelled")
                                            }
                                            disabled={isPending}
                                        >
                                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
