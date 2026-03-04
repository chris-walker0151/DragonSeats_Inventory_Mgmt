import { fetchDeploymentsList } from "@/lib/deployments/queries";
import { DeploymentsShell } from "./deployments-shell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dragon Seats — Deployments" };

export default async function DeploymentsPage() {
    const deployments = await fetchDeploymentsList();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Deployments</h1>
                <p className="text-sm text-muted-foreground">
                    Asset-to-customer assignments and return tracking
                </p>
            </div>
            <DeploymentsShell deployments={deployments} />
        </div>
    );
}
