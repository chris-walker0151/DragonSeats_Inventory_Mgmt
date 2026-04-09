import { notFound } from "next/navigation";
import { fetchAssetDetail } from "../actions";
import { AssetMobilePage } from "./asset-mobile-page";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function SerializedAssetPage({ params }: Props) {
    const { id } = await params;
    const asset = await fetchAssetDetail(id);

    if (!asset) {
        notFound();
    }

    return <AssetMobilePage asset={asset} />;
}
