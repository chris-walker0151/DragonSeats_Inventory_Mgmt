import { fetchQuantityInventoryList } from "@/lib/quantity-inventory/queries";
import { QuantityShell } from "./quantity-shell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dragon Seats — Quantity Inventory" };

export default async function QuantityInventoryPage() {
    const items = await fetchQuantityInventoryList();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Quantity Inventory</h1>
                <p className="text-sm text-muted-foreground">
                    Non-serialized items tracked by count across warehouses
                </p>
            </div>
            <QuantityShell items={items} />
        </div>
    );
}
