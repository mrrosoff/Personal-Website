import { describe, expect, it } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import { mockFramebuffer, mockPhotoId } from "../../../mocks/aws/s3";
import { mockDeviceToken } from "../../../mocks/aws/dynamodb";

import { handler } from "../../../../api/endpoints/polaroid/photo";

describe("photo", () => {
    it("should need a device", async () => {
        const result = await handler(mockEvent({ body: { id: "p" } }));

        expect(result.statusCode).toBe(401);
    });

    it("should need a body", async () => {
        const result = await handler(mockEvent({ token: mockDeviceToken }));

        expect(result.statusCode).toBe(400);
    });

    it("should need a photo id", async () => {
        const result = await handler(mockEvent({ token: mockDeviceToken, body: {} }));

        expect(responseBody(result).message).toBe("Missing Photo Id");
    });

    it("should 404 a missing photo", async () => {
        const result = await handler(
            mockEvent({ token: mockDeviceToken, body: { id: "missing" } })
        );

        expect(result.statusCode).toBe(404);
    });

    it("should send the framebuffer bytes", async () => {
        const result = await handler(
            mockEvent({ token: mockDeviceToken, body: { id: mockPhotoId } })
        );

        expect(result).toMatchObject({
            isBase64Encoded: true,
            headers: { "Content-Type": "application/octet-stream" }
        });
        expect(Buffer.from(result.body, "base64")).toEqual(mockFramebuffer);
    });
});
