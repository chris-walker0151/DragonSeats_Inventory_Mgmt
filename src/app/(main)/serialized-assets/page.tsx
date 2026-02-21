import { fetchSerializedAssetsList } from "@/lib/serialized-assets/queries";
import { SerializedAssetsShell } from "./serialized-assets-shell";

export const metadata = { title: "Dragon Seats — Serialized Assets" };

export default async function SerializedAssetsPage() {
    const assets = await fetchSerializedAssetsList();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Serialized Assets</h1>
                <p className="text-sm text-muted-foreground">
                    Track individually serialized equipment across the fleet
                </p>
            </div>
            <SerializedAssetsShell assets={assets} />
        </div>
    );
}
