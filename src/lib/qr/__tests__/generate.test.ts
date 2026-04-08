/**
 * @jest-environment node
 *
 * Tests for the QR code generation utility.
 * Written before implementation (TDD red phase).
 */

import { generateQRCode } from "../generate";

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("generateQRCode", () => {
    it("returns a PNG data URL for a valid asset ID", async () => {
        const result = await generateQRCode(VALID_UUID);
        expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it("returns the correct HTTPS payload URL", async () => {
        const result = await generateQRCode(VALID_UUID);
        expect(result.payload).toBe(
            `https://inventory.dragonseats.com/serialized-assets/${VALID_UUID}`
        );
    });

    it("payload is a valid absolute HTTPS URL", async () => {
        const result = await generateQRCode(VALID_UUID);
        const url = new URL(result.payload);
        expect(url.protocol).toBe("https:");
        expect(url.hostname).toBe("inventory.dragonseats.com");
        expect(url.pathname).toBe(`/serialized-assets/${VALID_UUID}`);
    });

    it("throws for an empty asset ID", async () => {
        await expect(generateQRCode("")).rejects.toThrow("assetId is required");
    });

    it("produces a non-empty base64 string", async () => {
        const result = await generateQRCode(VALID_UUID);
        const base64Part = result.dataUrl.replace("data:image/png;base64,", "");
        expect(base64Part.length).toBeGreaterThan(100);
    });
});
