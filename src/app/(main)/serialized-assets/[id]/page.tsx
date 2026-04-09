import { notFound } from "next/navigation";
import { fetchSerializedAssetDetail } from "@/lib/serialized-assets/queries";
import { AssetProfileClient } from "./asset-profile-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const asset = await fetchSerializedAssetDetail(id);
    if (!asset) return { title: "Asset Not Found" };
    return { title: `${asset.serialNumber} — Dragon Seats` };
}

export default async function AssetProfilePage({ params }: Props) {
    const { id } = await params;
    const asset = await fetchSerializedAssetDetail(id);

    if (!asset) {
        notFound();
    }

    return <AssetProfileClient asset={asset} />;
}
