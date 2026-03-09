import { fetchDownedAssets, fetchDownedEquipmentSummary } from "@/lib/service-tickets/queries";
import { ServiceTicketsShell } from "./service-tickets-shell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dragon Seats — Service Tickets" };

export default async function ServiceTicketsPage() {
    const [downedAssets, summary] = await Promise.all([
        fetchDownedAssets(),
        fetchDownedEquipmentSummary(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Service Tickets</h1>
                <p className="text-sm text-muted-foreground">
                    Manage repair and maintenance tickets for down equipment
                </p>
            </div>
            <ServiceTicketsShell downedAssets={downedAssets} summary={summary} />
        </div>
    );
}
