import { fetchRecentActivity } from "@/lib/activity-log/queries";
import { AuditLogShell } from "./audit-log-shell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dragon Seats — Audit Log" };

export default async function AuditLogPage() {
    const { entries, total } = await fetchRecentActivity({ limit: 500 });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Audit Log
                </h1>
                <p className="text-sm text-muted-foreground">
                    Latest changes across all collections
                </p>
            </div>
            <AuditLogShell entries={entries} total={total} />
        </div>
    );
}
