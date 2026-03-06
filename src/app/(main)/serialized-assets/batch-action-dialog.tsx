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
import { toast } from "sonner";
import { batchUpdateAssetsAction } from "./actions";
import type { BatchAction } from "./actions";

const ACTION_CONFIG: Record<
    BatchAction,
    {
        title: string;
        description: string;
        inputLabel?: string;
        inputPlaceholder?: string;
    }
> = {
    reserve: {
        title: "Reserve Assets",
        description: "Reserve the selected assets for a team.",
        inputLabel: "Team Name",
        inputPlaceholder: "Enter team name...",
    },
    deploy: {
        title: "Deploy Assets",
        description: "Deploy the selected assets to a team.",
        inputLabel: "Team Name",
        inputPlaceholder: "Enter team name...",
    },
    refurbish: {
        title: "Refurbish Assets",
        description: "Send the selected assets for refurbishment.",
        inputLabel: "Manufacturer Name",
        inputPlaceholder: "Enter manufacturer name...",
    },
    retire: {
        title: "Retire Assets",
        description:
            "Retire the selected assets. This will set both the Condition and Location to Retired.",
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
    const [targetName, setTargetName] = useState("");
    const [isPending, startTransition] = useTransition();

    if (!action) return null;

    const config = ACTION_CONFIG[action];
    const needsInput = action !== "retire";

    function handleSubmit() {
        if (needsInput && !targetName.trim()) {
            toast.error(`${config.inputLabel} is required`);
            return;
        }

        startTransition(async () => {
            try {
                const result = await batchUpdateAssetsAction({
                    assetIds,
                    action: action!,
                    targetName: needsInput ? targetName.trim() : undefined,
                });
                toast.success(
                    `${result.updated} asset${result.updated !== 1 ? "s" : ""} updated successfully`,
                );
                setTargetName("");
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
        setTargetName("");
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{config.title}</DialogTitle>
                    <DialogDescription>
                        {config.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <p className="text-sm text-muted-foreground">
                        Applying to{" "}
                        <span className="font-semibold text-foreground">
                            {assetIds.length}
                        </span>{" "}
                        asset{assetIds.length !== 1 ? "s" : ""}.
                    </p>

                    {needsInput && config.inputLabel && (
                        <div className="space-y-2">
                            <Label htmlFor="batch-target-name">
                                {config.inputLabel}
                            </Label>
                            <Input
                                id="batch-target-name"
                                placeholder={config.inputPlaceholder}
                                value={targetName}
                                onChange={(e) => setTargetName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSubmit();
                                }}
                                autoFocus
                            />
                        </div>
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
                        variant={action === "retire" ? "destructive" : "default"}
                    >
                        {isPending ? "Updating..." : "Confirm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
