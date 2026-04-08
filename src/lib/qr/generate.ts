/**
 * Server-side QR code generation utility.
 * Generates a PNG data URL for a serialized asset's deep-link profile URL.
 *
 * Usage: call only from Server Components, Server Actions, or API routes.
 */

import QRCode from "qrcode";

const BASE_URL = "https://inventory.dragonseats.com/serialized-assets";

export interface QRCodeResult {
    /** Base64 PNG data URL — safe to store in the database and render in <img src> */
    dataUrl: string;
    /** The HTTPS URL encoded in the QR code */
    payload: string;
}

/**
 * Generate a QR code for a serialized asset.
 *
 * @param assetId - The UUID of the serialized asset
 * @returns { dataUrl, payload }
 * @throws if assetId is empty or QR generation fails
 */
export async function generateQRCode(assetId: string): Promise<QRCodeResult> {
    if (!assetId || !assetId.trim()) {
        throw new Error("assetId is required");
    }

    const payload = `${BASE_URL}/${assetId.trim()}`;

    const dataUrl = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: "M",
        width: 300,
        margin: 2,
    });

    return { dataUrl, payload };
}
