import { fetchTransfersList } from "@/lib/transfers/queries";
import { TransfersShell } from "./transfers-shell";

export const metadata = { title: "Dragon Seats — Transfers" };

export default async function TransfersPage() {
    const transfers = await fetchTransfersList();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Transfers</h1>
                <p className="text-sm text-muted-foreground">
                    Warehouse-to-warehouse equipment movements
                </p>
            </div>
            <TransfersShell transfers={transfers} />
        </div>
    );
}
