import {
    fetchDeploymentAssets,
    fetchAvailabilitySummary,
    fetchActiveCustomers,
} from "@/lib/deployments/queries";
import { DeploymentsShell } from "./deployments-shell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dragon Seats — Deployments" };

export default async function DeploymentsPage() {
    const [assets, summary, customers] = await Promise.all([
        fetchDeploymentAssets(),
        fetchAvailabilitySummary(),
        fetchActiveCustomers(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Deployments</h1>
                <p className="text-sm text-muted-foreground">
                    Asset availability, deployment workflows, and return tracking
                </p>
            </div>
            <DeploymentsShell
                assets={assets}
                summary={summary}
                customers={customers}
            />
        </div>
    );
}
