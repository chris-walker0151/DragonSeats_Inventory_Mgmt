"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Package,
    Boxes,
    Users,
    Truck,
    ArrowLeftRight,
    Tag,
    BookOpen,
    Wrench,
    ClipboardList,
    ScrollText,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar";

const iconMap = {
    BarChart3,
    Package,
    Boxes,
    Users,
    Truck,
    ArrowLeftRight,
    Tag,
    BookOpen,
    Wrench,
    ClipboardList,
    ScrollText,
} as const;

interface NavItem {
    label: string;
    href: string;
    icon: keyof typeof iconMap;
}

const navGroups: { label: string; items: NavItem[] }[] = [
    {
        label: "Inventory",
        items: [
            { label: "Dashboard", href: "/dashboard", icon: "BarChart3" },
            {
                label: "Serialized Assets",
                href: "/serialized-assets",
                icon: "Package",
            },
            {
                label: "Bulk Inventory",
                href: "/quantity-inventory",
                icon: "Boxes",
            },
        ],
    },
    {
        label: "Operations",
        items: [
            { label: "Customers", href: "/customers", icon: "Users" },
            { label: "Deployments", href: "/deployments", icon: "Truck" },
            {
                label: "Transfers",
                href: "/transfers",
                icon: "ArrowLeftRight",
            },
        ],
    },
    {
        label: "Maintenance",
        items: [
            {
                label: "Service Tickets",
                href: "/service-tickets",
                icon: "ClipboardList",
            },
            {
                label: "Predictive Maintenance",
                href: "/maintenance",
                icon: "Wrench",
            },
        ],
    },
    {
        label: "Tools",
        items: [
            {
                label: "Audit Log",
                href: "/tools/audit-log",
                icon: "ScrollText",
            },
        ],
    },
    {
        label: "Reference",
        items: [
            { label: "SKU Master", href: "/sku-master", icon: "Tag" },
            {
                label: "Data Dictionary",
                href: "/data-dictionary",
                icon: "BookOpen",
            },
        ],
    },
];

const WAREHOUSE_DOTS = [
    { code: "CLE", label: "Cleveland", color: "var(--hub-cle)" },
    { code: "KC", label: "Kansas City", color: "var(--hub-kc)" },
    { code: "JAX", label: "Jacksonville", color: "var(--hub-jax)" },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <Image
                        src="/dragon-seats-logo.svg"
                        alt="Dragon Seats"
                        width={36}
                        height={36}
                        className="shrink-0"
                    />
                    <div>
                        <p className="text-sm font-bold tracking-tight">
                            Dragon Seats
                        </p>
                        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                            Inventory
                        </p>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                {navGroups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const Icon = iconMap[item.icon];
                                    const isActive =
                                        pathname === item.href ||
                                        pathname.startsWith(item.href + "/");
                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                className={
                                                    isActive
                                                        ? "border-l-2 border-l-[var(--hub-cle)] bg-sidebar-accent font-medium"
                                                        : ""
                                                }
                                            >
                                                <Link href={item.href}>
                                                    <Icon className="h-4 w-4" />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border p-4">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                        Warehouses
                    </p>
                    <div
                        className="flex items-center gap-1.5"
                        title="Warehouse Status"
                    >
                        {WAREHOUSE_DOTS.map((wh) => (
                            <span
                                key={wh.code}
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: wh.color }}
                                title={wh.label}
                            />
                        ))}
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
