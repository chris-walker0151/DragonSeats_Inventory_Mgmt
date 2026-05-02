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
import { Badge } from "@/components/ui/badge";
import {
    WAREHOUSE_LOCATION_LABELS,
    PRODUCT_CATEGORY_LABELS,
    PRODUCT_CATEGORY_COLORS,
} from "@/lib/serialized-assets/constants";
import type { WarehouseLocation, ProductCategory } from "@/generated/prisma/client";
import { WAREHOUSES } from "@/lib/constants";
import {
    createTransferAction,
    searchAssetsAction,
    fetchQuantityItemsAction,
} from "./actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type TransferType = "asset" | "quantity";

interface AssetResult {
    id: string;
    serialNumber: string;
    productCategory: ProductCategory;
    currentLocation: WarehouseLocation;
}

interface QuantityItemResult {
    id: string;
    itemCategory: string;
    itemVariant: string | null;
    location: WarehouseLocation;
    quantityOnHand: number;
}

interface NewTransferDialogProps {
    open: boolean;
    onClose: () => void;
}

export function NewTransferDialog({ open, onClose }: NewTransferDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [transferType, setTransferType] = useState<TransferType>("asset");

    // Asset search
    const [assetSearch, setAssetSearch] = useState("");
    const [assetResults, setAssetResults] = useState<AssetResult[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<AssetResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Quantity item
    const [quantityItems, setQuantityItems] = useState<QuantityItemResult[]>([]);
    const [selectedItemId, setSelectedItemId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [itemsLoaded, setItemsLoaded] = useState(false);

    // Common fields
    const [originLocation, setOriginLocation] = useState("");
    const [destinationLocation, setDestinationLocation] = useState("");
    const [transferDate, setTransferDate] = useState(
        new Date().toISOString().split("T")[0],
    );
    const [initiatedBy, setInitiatedBy] = useState("");
    const [notes, setNotes] = useState("");

    function resetForm() {
        setTransferType("asset");
        setAssetSearch("");
        setAssetResults([]);
        setSelectedAsset(null);
        setSelectedItemId("");
        setQuantity("");
        setOriginLocation("");
        setDestinationLocation("");
        setTransferDate(new Date().toISOString().split("T")[0]);
        setInitiatedBy("");
        setNotes("");
        setItemsLoaded(false);
    }

    function handleClose() {
        resetForm();
        onClose();
    }

    async function handleAssetSearch(value: string) {
        setAssetSearch(value);
        setSelectedAsset(null);
        if (value.trim().length < 2) {
            setAssetResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const results = await searchAssetsAction(value);
            setAssetResults(results);
        } catch {
            setAssetResults([]);
        } finally {
            setIsSearching(false);
        }
    }

    function handleSelectAsset(asset: AssetResult) {
        setSelectedAsset(asset);
        setAssetSearch(asset.serialNumber);
        setAssetResults([]);
        // Auto-populate origin from asset's current location
        if (asset.currentLocation !== "deployed_customer") {
            setOriginLocation(asset.currentLocation);
        }
    }

    async function handleTransferTypeChange(type: TransferType) {
        setTransferType(type);
        setSelectedAsset(null);
        setAssetSearch("");
        setAssetResults([]);
        setSelectedItemId("");
        setQuantity("");
        setOriginLocation("");

        if (type === "quantity" && !itemsLoaded) {
            try {
                const items = await fetchQuantityItemsAction();
                setQuantityItems(items);
                setItemsLoaded(true);
            } catch {
                toast.error("Failed to load quantity items");
            }
        }
    }

    function handleSubmit() {
        if (transferType === "asset" && !selectedAsset) {
            toast.error("Please select an asset");
            return;
        }
        if (transferType === "quantity" && !selectedItemId) {
            toast.error("Please select an item");
            return;
        }
        if (!originLocation || !destinationLocation) {
            toast.error("Please select origin and destination");
            return;
        }
        if (originLocation === destinationLocation) {
            toast.error("Origin and destination must be different");
            return;
        }

        startTransition(async () => {
            try {
                await createTransferAction({
                    assetId:
                        transferType === "asset"
                            ? selectedAsset!.id
                            : null,
                    itemId:
                        transferType === "quantity" ? selectedItemId : null,
                    quantity:
                        transferType === "quantity" && quantity
                            ? parseInt(quantity, 10)
                            : null,
                    originLocation: originLocation as WarehouseLocation,
                    destinationLocation:
                        destinationLocation as WarehouseLocation,
                    transferDate,
                    transferInitiatedBy: initiatedBy || null,
                    notes: notes || null,
                });
                toast.success("Transfer created");
                handleClose();
            } catch (err) {
                toast.error(
                    err instanceof Error
                        ? err.message
                        : "Failed to create transfer",
                );
            }
        });
    }

    const warehouseOptions = WAREHOUSES.filter(
        (w) => w.location !== originLocation,
    );

    const selectedItem = quantityItems.find((i) => i.id === selectedItemId);

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>New Transfer</DialogTitle>
                    <DialogDescription>
                        Initiate a warehouse-to-warehouse transfer
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Transfer Type */}
                    <div className="space-y-1.5">
                        <Label>Transfer Type</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant={
                                    transferType === "asset"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() =>
                                    handleTransferTypeChange("asset")
                                }
                            >
                                Serialized Asset
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={
                                    transferType === "quantity"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() =>
                                    handleTransferTypeChange("quantity")
                                }
                            >
                                Quantity Item
                            </Button>
                        </div>
                    </div>

                    {/* Asset Search */}
                    {transferType === "asset" && (
                        <div className="space-y-1.5">
                            <Label htmlFor="asset-search">
                                Search by Serial Number
                            </Label>
                            <div className="relative">
                                <Input
                                    id="asset-search"
                                    placeholder="Type serial number..."
                                    value={assetSearch}
                                    onChange={(e) =>
                                        handleAssetSearch(e.target.value)
                                    }
                                />
                                {isSearching && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                        Searching...
                                    </span>
                                )}
                            </div>
                            {assetResults.length > 0 && (
                                <div className="rounded-md border max-h-40 overflow-y-auto">
                                    {assetResults.map((a) => (
                                        <button
                                            key={a.id}
                                            type="button"
                                            className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted"
                                            onClick={() =>
                                                handleSelectAsset(a)
                                            }
                                        >
                                            <span className="font-mono text-xs">
                                                {a.serialNumber}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    className={cn(
                                                        "text-[10px]",
                                                        PRODUCT_CATEGORY_COLORS[
                                                            a.productCategory
                                                        ],
                                                    )}
                                                >
                                                    {
                                                        PRODUCT_CATEGORY_LABELS[
                                                            a.productCategory
                                                        ]
                                                    }
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {
                                                        WAREHOUSE_LOCATION_LABELS[
                                                            a.currentLocation
                                                        ]
                                                    }
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {selectedAsset && (
                                <p className="text-xs text-muted-foreground">
                                    Selected: {selectedAsset.serialNumber} (
                                    {
                                        PRODUCT_CATEGORY_LABELS[
                                            selectedAsset.productCategory
                                        ]
                                    }
                                    )
                                </p>
                            )}
                        </div>
                    )}

                    {/* Quantity Item Select */}
                    {transferType === "quantity" && (
                        <>
                            <div className="space-y-1.5">
                                <Label>Item</Label>
                                <Select
                                    value={selectedItemId}
                                    onValueChange={(v) => {
                                        setSelectedItemId(v);
                                        const item = quantityItems.find(
                                            (i) => i.id === v,
                                        );
                                        if (item) {
                                            setOriginLocation(item.location);
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {quantityItems.map((item) => (
                                            <SelectItem
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.itemCategory}
                                                {item.itemVariant
                                                    ? ` (${item.itemVariant})`
                                                    : ""}{" "}
                                                —{" "}
                                                {
                                                    WAREHOUSE_LOCATION_LABELS[
                                                        item.location
                                                    ]
                                                }{" "}
                                                ({item.quantityOnHand} on hand)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min={1}
                                    max={selectedItem?.quantityOnHand ?? 9999}
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(e.target.value)
                                    }
                                    placeholder="Number of items"
                                />
                            </div>
                        </>
                    )}

                    {/* Origin */}
                    <div className="space-y-1.5">
                        <Label>Origin Warehouse</Label>
                        <Select
                            value={originLocation}
                            onValueChange={setOriginLocation}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select origin" />
                            </SelectTrigger>
                            <SelectContent>
                                {WAREHOUSES.map((w) => (
                                    <SelectItem
                                        key={w.location}
                                        value={w.location}
                                    >
                                        {w.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Destination */}
                    <div className="space-y-1.5">
                        <Label>Destination Warehouse</Label>
                        <Select
                            value={destinationLocation}
                            onValueChange={setDestinationLocation}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                            <SelectContent>
                                {warehouseOptions.map((w) => (
                                    <SelectItem
                                        key={w.location}
                                        value={w.location}
                                    >
                                        {w.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Transfer Date */}
                    <div className="space-y-1.5">
                        <Label htmlFor="transfer-date">Transfer Date</Label>
                        <Input
                            id="transfer-date"
                            type="date"
                            value={transferDate}
                            onChange={(e) => setTransferDate(e.target.value)}
                        />
                    </div>

                    {/* Initiated By */}
                    <div className="space-y-1.5">
                        <Label htmlFor="initiated-by">Initiated By</Label>
                        <Input
                            id="initiated-by"
                            placeholder="Your name"
                            value={initiatedBy}
                            onChange={(e) => setInitiatedBy(e.target.value)}
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <Label htmlFor="transfer-notes">Notes</Label>
                        <Textarea
                            id="transfer-notes"
                            placeholder="Optional notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? "Creating..." : "Create Transfer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
