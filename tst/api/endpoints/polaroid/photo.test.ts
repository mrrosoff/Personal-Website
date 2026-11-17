import { GetObjectCommand } from "@aws-sdk/client-s3";
import { describe, expect, it } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import { mockFramebuffer, mockS3Client } from "../../../__mocks__/__aws__/s3";
import { mockDeviceToken } from "../../../__mocks__/__data__/aws/dynamodb";

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
        mockS3Client.on(GetObjectCommand).rejects(new Error("NoSuchKey"));

        const result = await handler(mockEvent({ token: mockDeviceToken, body: { id: "p" } }));

        expect(result.statusCode).toBe(404);
    });

    it("should send the framebuffer bytes", async () => {
        const result = await handler(mockEvent({ token: mockDeviceToken, body: { id: "p" } }));

        expect(result).toMatchObject({
            isBase64Encoded: true,
            headers: { "Content-Type": "application/octet-stream" }
        });
        expect(Buffer.from(result.body, "base64")).toEqual(mockFramebuffer);
    });
});
