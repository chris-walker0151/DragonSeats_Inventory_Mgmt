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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { batchUpdateAssetsAction, fetchActiveCustomersAction } from "./actions";
import type { BatchAction } from "./actions";
import { WAREHOUSES } from "@/lib/constants";

const ACTION_CONFIG: Record<
    BatchAction,
    { title: string; description: string }
> = {
    reserve: {
        title: "Reserve Assets",
        description: "Reserve the selected assets for a customer.",
    },
    deploy: {
        title: "Deploy Assets",
        description: "Deploy the selected reserved assets to their customer.",
    },
    return: {
        title: "Return Assets",
        description: "Return the selected assets to a warehouse.",
    },
    service: {
        title: "Service Assets",
        description: "Mark the selected assets as down for service.",
    },
    transfer: {
        title: "Transfer Assets",
        description: "Transfer the selected deployed assets to a different customer.",
    },
    refurbish: {
        title: "Refurbish Assets",
        description: "Send the selected down assets for refurbishment.",
    },
};

interface BatchActionDialogProps {
    open: boolean;
    action: BatchAction | null;
    assetIds: string[];
    onClose: () => void;
    onComplete: () => void;
}

export function BatchActionDialog({
    open,
    action,
    assetIds,
    onClose,
    onComplete,
}: BatchActionDialogProps) {
    const [isPending, startTransition] = useTransition();

    // Reserve & Transfer fields
    const [customerId, setCustomerId] = useState("");
    const [customerOpen, setCustomerOpen] = useState(false);
    const [customers, setCustomers] = useState<{ id: string; teamName: string }[]>([]);
    const [startDate, setStartDate] = useState("");
    const [gameType, setGameType] = useState("");

    // Deploy fields
    const [pickupDate, setPickupDate] = useState("");
    const [transportVendor, setTransportVendor] = useState("");

    // Return fields
    const [returnLocation, setReturnLocation] = useState("");
    const [condition, setCondition] = useState("");

    // Service fields
    const [serviceCondition, setServiceCondition] = useState("");
    const [notes, setNotes] = useState("");

    // Refurbish fields
    const [manufacturer, setManufacturer] = useState("");
    const [returnDate, setReturnDate] = useState("");

    // Load customers when dialog opens for reserve/transfer
    const needsCustomers = action === "reserve" || action === "transfer";
    const [prevOpen, setPrevOpen] = useState(false);
    if (open && !prevOpen && needsCustomers) {
        fetchActiveCustomersAction().then(setCustomers);
    }
    if (open !== prevOpen) {
        setPrevOpen(open);
    }

    function resetForm() {
        setCustomerId("");
        setCustomerOpen(false);
        setStartDate("");
        setGameType("");
        setPickupDate("");
        setTransportVendor("");
        setReturnLocation("");
        setCondition("");
        setServiceCondition("");
        setNotes("");
        setManufacturer("");
        setReturnDate("");
    }

    if (!action) return null;

    const config = ACTION_CONFIG[action];

    function handleSubmit() {
        startTransition(async () => {
            try {
                const result = await batchUpdateAssetsAction({
                    assetIds,
                    action: action!,
                    customerId: customerId || undefined,
                    startDate: startDate || undefined,
                    gameType: gameType || undefined,
                    pickupDate: pickupDate || undefined,
                    transportVendor: transportVendor || undefined,
                    returnLocation: returnLocation as never,
                    condition: (action === "return" ? condition : serviceCondition) || undefined,
                    notes: notes || undefined,
                    manufacturer: manufacturer || undefined,
                    returnDate: returnDate || undefined,
                });
                toast.success(
                    `${result.updated} asset${result.updated !== 1 ? "s" : ""} updated successfully`,
                );
                resetForm();
                onComplete();
            } catch (err) {
                toast.error(
                    err instanceof Error ? err.message : "Failed to update assets",
                );
            }
        });
    }

    function handleClose() {
        if (isPending) return;
        resetForm();
        onClose();
    }

    const selectedCustomer = customers.find((c) => c.id === customerId);

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{config.title}</DialogTitle>
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

                    {/* ── Reserve Form ── */}
                    {action === "reserve" && (
                        <>
                            <CustomerCombobox
                                customers={customers}
                                customerId={customerId}
                                setCustomerId={setCustomerId}
                                customerOpen={customerOpen}
                                setCustomerOpen={setCustomerOpen}
                                selectedCustomer={selectedCustomer}
                            />
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
                                <Select value={gameType} onValueChange={setGameType}>
                                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="away">Away</SelectItem>
                                        <SelectItem value="home">Home</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}

                    {/* ── Deploy Form ── */}
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
                                    autoFocus
                                />
                            </div>
                        </>
                    )}

                    {/* ── Return Form ── */}
                    {action === "return" && (
                        <>
                            <div className="space-y-2">
                                <Label>Return Warehouse</Label>
                                <Select value={returnLocation} onValueChange={setReturnLocation}>
                                    <SelectTrigger><SelectValue placeholder="Select warehouse..." /></SelectTrigger>
                                    <SelectContent>
                                        {WAREHOUSES.map((wh) => (
                                            <SelectItem key={wh.location} value={wh.location}>
                                                {wh.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Condition</Label>
                                <Select value={condition} onValueChange={setCondition}>
                                    <SelectTrigger><SelectValue placeholder="Select condition..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Excellent">Excellent</SelectItem>
                                        <SelectItem value="OK">OK</SelectItem>
                                        <SelectItem value="Poor">Poor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}

                    {/* ── Service Form ── */}
                    {action === "service" && (
                        <>
                            <div className="space-y-2">
                                <Label>Condition</Label>
                                <Input
                                    placeholder="Enter condition..."
                                    value={serviceCondition}
                                    onChange={(e) => setServiceCondition(e.target.value)}
                                    autoFocus
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

                    {/* ── Transfer Form ── */}
                    {action === "transfer" && (
                        <>
                            <CustomerCombobox
                                customers={customers}
                                customerId={customerId}
                                setCustomerId={setCustomerId}
                                customerOpen={customerOpen}
                                setCustomerOpen={setCustomerOpen}
                                selectedCustomer={selectedCustomer}
                            />
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
                                <Select value={gameType} onValueChange={setGameType}>
                                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="away">Away</SelectItem>
                                        <SelectItem value="home">Home</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}

                    {/* ── Refurbish Form ── */}
                    {action === "refurbish" && (
                        <>
                            <div className="space-y-2">
                                <Label>Manufacturer</Label>
                                <Input
                                    placeholder="Enter manufacturer name..."
                                    value={manufacturer}
                                    onChange={(e) => setManufacturer(e.target.value)}
                                    autoFocus
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
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending}
                    >
                        {isPending ? "Updating..." : "Confirm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/** Reusable customer combobox used by Reserve and Transfer forms. */
function CustomerCombobox({
    customers,
    customerId,
    setCustomerId,
    customerOpen,
    setCustomerOpen,
    selectedCustomer,
}: {
    customers: { id: string; teamName: string }[];
    customerId: string;
    setCustomerId: (id: string) => void;
    customerOpen: boolean;
    setCustomerOpen: (open: boolean) => void;
    selectedCustomer: { id: string; teamName: string } | undefined;
}) {
    return (
        <div className="space-y-2">
            <Label>Customer</Label>
            <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={customerOpen}
                        className="w-full justify-between font-normal"
                    >
                        {selectedCustomer?.teamName ?? "Select customer..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Type to search..." />
                        <CommandList>
                            <CommandEmpty>No customer found.</CommandEmpty>
                            <CommandGroup>
                                {customers.map((c) => (
                                    <CommandItem
                                        key={c.id}
                                        value={c.teamName}
                                        onSelect={() => {
                                            setCustomerId(c.id);
                                            setCustomerOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                customerId === c.id ? "opacity-100" : "opacity-0",
                                            )}
                                        />
                                        {c.teamName}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
