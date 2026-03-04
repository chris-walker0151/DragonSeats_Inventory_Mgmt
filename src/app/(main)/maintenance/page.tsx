import { fetchMaintenanceList } from "@/lib/maintenance/queries";
import { MaintenanceShell } from "./maintenance-shell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dragon Seats — Predictive Maintenance" };

export default async function MaintenancePage() {
    const assets = await fetchMaintenanceList();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Predictive Maintenance</h1>
                <p className="text-sm text-muted-foreground">
                    Track asset age, refurbishment status, and maintenance needs
                </p>
            </div>
            <MaintenanceShell assets={assets} />
        </div>
    );
}
