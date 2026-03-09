"use client";

import { useState, useTransition } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { DeploymentAction } from "@/lib/deployments/action-config";
import { DEPLOYMENT_ACTIONS } from "@/lib/deployments/action-config";
import {
    WAREHOUSE_LOCATION_LABELS,
} from "@/lib/serialized-assets/constants";
import type { WarehouseLocation } from "@/generated/prisma/client";
import {
    reserveAssetAction,
    deployAssetAction,
    returnAssetAction,
    serviceAssetAction,
    transferAssetAction,
    refurbishAssetAction,
} from "./actions";

/** Only the three physical warehouses (not "deployed_customer") */
const RETURN_WAREHOUSES: { value: WarehouseLocation; label: string }[] = [
    { value: "cleveland_warehouse", label: WAREHOUSE_LOCATION_LABELS.cleveland_warehouse },
    { value: "kansas_city_warehouse", label: WAREHOUSE_LOCATION_LABELS.kansas_city_warehouse },
    { value: "jacksonville_warehouse", label: WAREHOUSE_LOCATION_LABELS.jacksonville_warehouse },
];

interface DeploymentActionDialogProps {
    open: boolean;
    action: DeploymentAction | null;
    assetIds: string[];
    customers: { id: string; teamName: string }[];
    onClose: () => void;
    onComplete: () => void;
}

export function DeploymentActionDialog({
    open,
    action,
    assetIds,
    customers,
    onClose,
    onComplete,
}: DeploymentActionDialogProps) {
    // Form state
    const [customerId, setCustomerId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [gameType, setGameType] = useState<"home" | "away">("home");
    const [pickupDate, setPickupDate] = useState("");
    const [transportVendor, setTransportVendor] = useState("");
    const [returnWarehouse, setReturnWarehouse] = useState("");
    const [condition, setCondition] = useState("");
    const [benchStatus, setBenchStatus] = useState("");
    const [notes, setNotes] = useState("");
    const [manufacturer, setManufacturer] = useState("");
    const [returnDate, setReturnDate] = useState("");
    const [isPending, startTransition] = useTransition();

    if (!action) return null;

    const config = DEPLOYMENT_ACTIONS.find((a) => a.key === action)!;

    function resetForm() {
        setCustomerId("");
        setStartDate("");
        setGameType("home");
        setPickupDate("");
        setTransportVendor("");
        setReturnWarehouse("");
        setCondition("");
        setBenchStatus("");
        setNotes("");
        setManufacturer("");
        setReturnDate("");
    }

    function handleClose() {
        if (isPending) return;
        resetForm();
        onClose();
    }

    function handleSubmit() {
        startTransition(async () => {
            try {
                let succeeded = 0;
                for (const assetId of assetIds) {
                    switch (action) {
                        case "reserve":
                            if (!customerId) throw new Error("Customer is required");
                            if (!startDate) throw new Error("Start date is required");
                            await reserveAssetAction({ assetId, customerId, startDate, gameType });
                            break;
                        case "deploy":
                            if (!pickupDate) throw new Error("Pick-up date is required");
                            if (!transportVendor.trim()) throw new Error("Transport vendor is required");
                            await deployAssetAction({ assetId, pickupDate, transportVendor: transportVendor.trim() });
                            break;
                        case "return":
                            if (!returnWarehouse) throw new Error("Return warehouse is required");
                            if (!condition.trim()) throw new Error("Condition is required");
                            await returnAssetAction({
                                assetId,
                                returnWarehouse: returnWarehouse as WarehouseLocation,
                                condition: condition.trim(),
                                benchStatus: benchStatus.trim() || undefined,
                            });
                            break;
                        case "service":
                            if (!condition.trim()) throw new Error("Condition is required");
                            await serviceAssetAction({
                                assetId,
                                condition: condition.trim(),
                                notes: notes.trim(),
                            });
                            break;
                        case "transfer":
                            if (!customerId) throw new Error("Customer is required");
                            if (!startDate) throw new Error("Start date is required");
                            await transferAssetAction({ assetId, customerId, startDate, gameType });
                            break;
                        case "refurbish":
                            if (!manufacturer.trim()) throw new Error("Manufacturer is required");
                            if (!returnDate) throw new Error("Return date is required");
                            await refurbishAssetAction({
                                assetId,
                                manufacturer: manufacturer.trim(),
                                returnDate,
                            });
                            break;
                    }
                    succeeded++;
                }
                toast.success(
                    `${succeeded} asset${succeeded !== 1 ? "s" : ""} updated successfully`,
                );
                resetForm();
                onComplete();
            } catch (err) {
                toast.error(
                    err instanceof Error ? err.message : "Action failed",
                );
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {config.label} Asset{assetIds.length > 1 ? "s" : ""}
                    </DialogTitle>
                    <DialogDescription>{config.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <p className="text-sm text-muted-foreground">
                        Applying to{" "}
                        <span className="font-semibold text-foreground">
                            {assetIds.length}
                        </span>{" "}
                        asset{assetIds.length !== 1 ? "s" : ""}.
                    </p>

                    {/* Reserve / Transfer fields */}
                    {(action === "reserve" || action === "transfer") && (
                        <>
                            <div className="space-y-2">
                                <Label>Customer</Label>
                                <Select value={customerId} onValueChange={setCustomerId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select customer..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.teamName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Away / Home</Label>
                                <Select
                                    value={gameType}
                                    onValueChange={(v) => setGameType(v as "home" | "away")}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="home">Home</SelectItem>
                                        <SelectItem value="away">Away</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}

                    {/* Deploy fields */}
                    {action === "deploy" && (
                        <>
                            <div className="space-y-2">
                                <Label>Pick-up Date</Label>
                                <Input
                                    type="date"
                                    value={pickupDate}
                                    onChange={(e) => setPickupDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Transport Vendor</Label>
                                <Input
                                    placeholder="Enter transport vendor..."
                                    value={transportVendor}
                                    onChange={(e) => setTransportVendor(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {/* Return fields */}
                    {action === "return" && (
                        <>
                            <div className="space-y-2">
                                <Label>Return Warehouse</Label>
                                <Select value={returnWarehouse} onValueChange={setReturnWarehouse}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select warehouse..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {RETURN_WAREHOUSES.map((w) => (
                                            <SelectItem key={w.value} value={w.value}>
                                                {w.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Condition</Label>
                                <Input
                                    placeholder="e.g. Excellent, Good, Poor..."
                                    value={condition}
                                    onChange={(e) => setCondition(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Input
                                    placeholder="e.g. Ready, Needs Repair..."
                                    value={benchStatus}
                                    onChange={(e) => setBenchStatus(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {/* Service fields */}
                    {action === "service" && (
                        <>
                            <div className="space-y-2">
                                <Label>Condition</Label>
                                <Input
                                    placeholder="e.g. Down, Damaged..."
                                    value={condition}
                                    onChange={(e) => setCondition(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea
                                    placeholder="Describe the issue..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </>
                    )}

                    {/* Refurbish fields */}
                    {action === "refurbish" && (
                        <>
                            <div className="space-y-2">
                                <Label>Manufacturer</Label>
                                <Input
                                    placeholder="Enter manufacturer name..."
                                    value={manufacturer}
                                    onChange={(e) => setManufacturer(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Expected Return Date</Label>
                                <Input
                                    type="date"
                                    value={returnDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? "Processing..." : "Confirm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
