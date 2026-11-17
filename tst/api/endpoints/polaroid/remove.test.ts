import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { describe, expect, it } from "vitest";

import { mockEvent, mockToken, responseBody } from "../../../setup";
import { mockS3Client } from "../../../__mocks__/__aws__/s3";
import { mockDevice } from "../../../__mocks__/__data__/aws/dynamodb";

import { handler } from "../../../../api/endpoints/polaroid/remove";
import { UserType } from "../../../../api/types";

describe("remove", () => {
    it("should need a friend with a polaroid", async () => {
        const result = await handler(mockEvent({ body: { id: "p" } }));

        expect(result.statusCode).toBe(401);
    });

    it("should need a body", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await handler(mockEvent({ token }));

        expect(result.statusCode).toBe(400);
    });

    it("should need a photo id", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await handler(mockEvent({ token, body: {} }));

        expect(responseBody(result).message).toBe("Missing Photo Id");
    });

    it("should 404 a missing photo", async () => {
        mockS3Client.on(HeadObjectCommand).rejects(new Error("NotFound"));
        const token = await mockToken(UserType.FRIEND);

        const result = await handler(mockEvent({ token, body: { id: "p" } }));

        expect(result.statusCode).toBe(404);
    });

    it("should delete the framebuffer and preview", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await handler(mockEvent({ token, body: { id: "p" } }));

        expect(responseBody(result)).toEqual({ removed: true, id: "p" });
        expect(mockS3Client).toHaveReceivedCommandWith(DeleteObjectCommand, {
            Key: `framebuffer/${mockDevice.deviceId}/p.bin`
        });
        expect(mockS3Client).toHaveReceivedCommandWith(DeleteObjectCommand, {
            Key: `preview/${mockDevice.deviceId}/p.png`
        });
    });
});
