import { fetchSkuList } from "@/lib/sku-master/queries";
import { SkuMasterShell } from "./sku-master-shell";

export const metadata = { title: "Dragon Seats — SKU Master" };

export default async function SkuMasterPage() {
    const skus = await fetchSkuList();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">SKU Master</h1>
                <p className="text-sm text-muted-foreground">
                    Product catalog and SKU naming convention
                </p>
            </div>
            <SkuMasterShell skus={skus} />
        </div>
    );
}
