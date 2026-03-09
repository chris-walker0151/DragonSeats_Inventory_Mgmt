import { fetchAuditLogs } from "@/lib/audit/log";
import { ActivityLogShell } from "./activity-log-shell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dragon Seats — Activity Log" };

export default async function ActivityLogPage() {
    const { logs, total } = await fetchAuditLogs({ limit: 50, offset: 0 });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
                <p className="text-sm text-muted-foreground">
                    Complete history of all changes across the platform
                </p>
            </div>
            <ActivityLogShell initialLogs={logs} initialTotal={total} />
        </div>
    );
}
