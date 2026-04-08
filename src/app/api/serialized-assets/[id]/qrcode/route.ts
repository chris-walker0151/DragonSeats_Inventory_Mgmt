import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const paramsSchema = z.object({
    id: z.string().uuid("Invalid asset ID format"),
});

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const parsed = paramsSchema.safeParse(await params);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
    }

    const asset = await prisma.serializedAsset.findUnique({
        where: { id: parsed.data.id },
        select: { qrCodeUrl: true },
    });

    if (!asset) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    if (!asset.qrCodeUrl) {
        return NextResponse.json({ error: "QR code not yet generated for this asset" }, { status: 404 });
    }

    // Decode base64 data URL → raw PNG buffer
    const base64Data = asset.qrCodeUrl.replace(/^data:image\/png;base64,/, "");
    const pngBuffer = Buffer.from(base64Data, "base64");

    return new NextResponse(pngBuffer, {
        status: 200,
        headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}
