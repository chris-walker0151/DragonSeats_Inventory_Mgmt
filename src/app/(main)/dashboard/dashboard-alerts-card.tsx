"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    WAREHOUSE_LOCATION_LABELS,
} from "@/lib/serialized-assets/constants";
import {
    PRODUCT_CATEGORY_LABELS,
} from "@/lib/serialized-assets/constants";
import {
    PROBLEM_CATEGORY_LABELS,
    PRIORITY_LABELS,
} from "@/lib/service-tickets/constants";
import type { DashboardAlerts } from "@/lib/dashboard/queries";
import type { WarehouseLocation, ProductCategory, ProblemCategory, TicketPriority } from "@/generated/prisma/client";
import {
    AlertTriangle,
    ArrowDownCircle,
    CalendarClock,
    PackageX,
    Wrench,
    Truck,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

interface DashboardAlertsCardProps {
    alerts: DashboardAlerts;
    className?: string;
}

interface AlertSectionProps {
    title: string;
    count: number;
    severity: "critical" | "warning";
    icon: React.ReactNode;
    href: string;
    children: React.ReactNode;
}

function AlertSection({
    title,
    count,
    severity,
    icon,
    href,
    children,
}: AlertSectionProps) {
    const [expanded, setExpanded] = useState(false);

    if (count === 0) return null;

    const isCritical = severity === "critical";

    return (
        <div
            className={`rounded-lg border p-3 ${
                isCritical
                    ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                    : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950"
            }`}
        >
            <button
                type="button"
                className="flex w-full items-center justify-between"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-sm font-medium">{title}</span>
                    <Badge
                        className={`text-[10px] ${
                            isCritical
                                ? "bg-red-500 text-white"
                                : "bg-amber-500 text-white"
                        }`}
                    >
                        {count}
                    </Badge>
                </div>
                {expanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
            </button>

            {expanded && (
                <div className="mt-3 space-y-1.5">
                    {children}
                    <div className="pt-1">
                        <Link
                            href={href}
                            className="text-xs font-medium text-primary hover:underline"
                        >
                            View all →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export function DashboardAlertsCard({
    alerts,
    className,
}: DashboardAlertsCardProps) {
    const {
        overdueReturns,
        downedEquipment,
        expiringContracts,
        lowStockItems,
        overdueTickets,
        stalledTransfers,
        totalAlertCount,
    } = alerts;

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {totalAlertCount > 0 ? (
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                        ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        <CardTitle>Alerts</CardTitle>
                        {totalAlertCount > 0 && (
                            <Badge className="bg-amber-500 text-white text-xs">
                                {totalAlertCount}
                            </Badge>
                        )}
                    </div>
                </div>
                <CardDescription>
                    {totalAlertCount === 0
                        ? "No operational alerts — all clear"
                        : `${totalAlertCount} item${totalAlertCount !== 1 ? "s" : ""} needing attention`}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2">
                {totalAlertCount === 0 && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-900 dark:bg-green-950">
                        <CheckCircle2 className="mx-auto h-8 w-8 text-green-500 mb-2" />
                        <p className="text-sm text-green-700 dark:text-green-300">
                            All systems operational
                        </p>
                    </div>
                )}

                {/* Overdue Returns */}
                <AlertSection
                    title="Overdue Returns"
                    count={overdueReturns.length}
                    severity="warning"
                    icon={<CalendarClock className="h-4 w-4 text-amber-600" />}
                    href="/deployments"
                >
                    {overdueReturns.slice(0, 5).map((r, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between text-xs"
                        >
                            <span>
                                <span className="font-mono font-medium">
                                    {r.assetSerialNumber}
                                </span>{" "}
                                — {r.customerTeamName}
                            </span>
                            <span className="text-red-600 font-medium">
                                {r.daysOverdue}d overdue
                            </span>
                        </div>
                    ))}
                </AlertSection>

                {/* Downed Equipment 30+ Days */}
                <AlertSection
                    title="Downed Equipment (30+ days)"
                    count={downedEquipment.length}
                    severity="critical"
                    icon={<ArrowDownCircle className="h-4 w-4 text-red-600" />}
                    href="/service-tickets"
                >
                    {downedEquipment.slice(0, 5).map((a, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between text-xs"
                        >
                            <span>
                                <span className="font-mono font-medium">
                                    {a.serialNumber}
                                </span>{" "}
                                ({PRODUCT_CATEGORY_LABELS[a.productCategory as ProductCategory] ?? a.productCategory})
                            </span>
                            <span className="text-red-600 font-medium">
                                {a.daysDown}d down
                            </span>
                        </div>
                    ))}
                </AlertSection>

                {/* Expiring Contracts */}
                <AlertSection
                    title="Expiring Contracts"
                    count={expiringContracts.length}
                    severity="warning"
                    icon={<CalendarClock className="h-4 w-4 text-amber-600" />}
                    href="/customers"
                >
                    {expiringContracts.slice(0, 5).map((c, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between text-xs"
                        >
                            <span className="font-medium">{c.teamName}</span>
                            <span
                                className={`font-medium ${
                                    c.daysUntilExpiry <= 30
                                        ? "text-red-600"
                                        : "text-amber-600"
                                }`}
                            >
                                {c.daysUntilExpiry}d remaining
                            </span>
                        </div>
                    ))}
                </AlertSection>

                {/* Low Stock */}
                <AlertSection
                    title="Low Stock Items"
                    count={lowStockItems.length}
                    severity="warning"
                    icon={<PackageX className="h-4 w-4 text-amber-600" />}
                    href="/quantity-inventory"
                >
                    {lowStockItems.slice(0, 5).map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between text-xs"
                        >
                            <span>
                                {item.itemCategory}
                                {item.itemVariant ? ` (${item.itemVariant})` : ""} —{" "}
                                {WAREHOUSE_LOCATION_LABELS[item.location as WarehouseLocation] ?? item.location}
                            </span>
                            <span className="text-amber-600 font-medium">
                                {item.quantityOnHand}/{item.reorderLevel}
                            </span>
                        </div>
                    ))}
                </AlertSection>

                {/* Overdue Tickets */}
                <AlertSection
                    title="Overdue Service Tickets"
                    count={overdueTickets.length}
                    severity={
                        overdueTickets.some(
                            (t) =>
                                t.priority === "critical" ||
                                t.priority === "high",
                        )
                            ? "critical"
                            : "warning"
                    }
                    icon={<Wrench className="h-4 w-4 text-amber-600" />}
                    href="/service-tickets"
                >
                    {overdueTickets.slice(0, 5).map((t, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between text-xs"
                        >
                            <span>
                                <span className="font-mono font-medium">
                                    {t.assetSerialNumber}
                                </span>{" "}
                                — {PROBLEM_CATEGORY_LABELS[t.problemCategory as ProblemCategory] ?? t.problemCategory}{" "}
                                ({PRIORITY_LABELS[t.priority as TicketPriority] ?? t.priority})
                            </span>
                            <span className="text-red-600 font-medium">
                                {t.daysOverdue}d overdue
                            </span>
                        </div>
                    ))}
                </AlertSection>

                {/* Stalled Transfers */}
                <AlertSection
                    title="Stalled Transfers (7+ days)"
                    count={stalledTransfers.length}
                    severity="warning"
                    icon={<Truck className="h-4 w-4 text-amber-600" />}
                    href="/transfers"
                >
                    {stalledTransfers.slice(0, 5).map((t, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between text-xs"
                        >
                            <span>
                                <span className="font-medium">
                                    {t.itemLabel}
                                </span>{" "}
                                — {WAREHOUSE_LOCATION_LABELS[t.originLocation as WarehouseLocation] ?? t.originLocation}{" "}
                                → {WAREHOUSE_LOCATION_LABELS[t.destinationLocation as WarehouseLocation] ?? t.destinationLocation}
                            </span>
                            <span className="text-amber-600 font-medium">
                                {t.daysInTransit}d in transit
                            </span>
                        </div>
                    ))}
                </AlertSection>
            </CardContent>
        </Card>
    );
}
