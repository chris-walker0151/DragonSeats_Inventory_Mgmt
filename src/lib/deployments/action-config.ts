/**
 * Client-side action metadata for the Deployments Dash workflow system.
 * Defines action labels, icons, descriptions, and state machine rules.
 */

import type { AssetAvailability } from "@/generated/prisma/client";
import {
    Bookmark,
    Truck,
    RotateCcw,
    Wrench,
    ArrowRightLeft,
    Factory,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DeploymentAction =
    | "reserve"
    | "deploy"
    | "return"
    | "service"
    | "transfer"
    | "refurbish";

export interface ActionConfig {
    key: DeploymentAction;
    label: string;
    description: string;
    icon: LucideIcon;
    allowedFrom: AssetAvailability[];
}

export const DEPLOYMENT_ACTIONS: ActionConfig[] = [
    {
        key: "reserve",
        label: "Reserve",
        description: "Reserve the selected asset(s) for a customer.",
        icon: Bookmark,
        allowedFrom: ["available"],
    },
    {
        key: "deploy",
        label: "Deploy",
        description: "Deploy the selected reserved asset(s) to the field.",
        icon: Truck,
        allowedFrom: ["reserved"],
    },
    {
        key: "return",
        label: "Return",
        description: "Return the selected asset(s) to a warehouse.",
        icon: RotateCcw,
        allowedFrom: ["deployed", "reserved", "down"],
    },
    {
        key: "service",
        label: "Service",
        description: "Send the selected asset(s) for service (mark as Down).",
        icon: Wrench,
        allowedFrom: ["available"],
    },
    {
        key: "transfer",
        label: "Transfer",
        description: "Transfer the selected deployed asset(s) to a different customer.",
        icon: ArrowRightLeft,
        allowedFrom: ["deployed"],
    },
    {
        key: "refurbish",
        label: "Refurbish",
        description: "Send the selected down asset(s) for refurbishment.",
        icon: Factory,
        allowedFrom: ["down"],
    },
];
